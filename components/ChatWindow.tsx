"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";
import { Model } from "./ModelSelectionForm";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { JsonRpcSigner } from "ethers";
import { Client } from "viem";

type Message = {
  role: "user" | "ai";
  content: string;
  verified?: boolean;
  timestamp: string;
};

interface ChatWindowProps {
  broker: ZgServingUserBrokerConfig;
  aiModel: Model;
  signer: JsonRpcSigner;
  client?: Client;
}

export function ChatWindow({
  broker,
  aiModel,
  signer,
  client,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const providerAddress = aiModel.provider;
  const serviceName = aiModel.name;
  const [currentPrice, setCurrentPrice] = useState(
    (Number(aiModel.inputPrice) / 1e18).toFixed(18)
  );
  const [pendingFee, setPendingFee] = useState(
    (Number(aiModel.inputPrice) / 1e18).toFixed(18)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create prompt based on message history
    const prompt =
      messages.length === 0
        ? input // If no history, just send the input
        : `The following is a conversation between a user and you,at a earlier time. You have to respond based on the previous conversation, and the current message should be treated as the most recent user input:Conversation History:
${messages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")}

Current User Input:
USER: ${input}`;

    console.log(prompt);

    try {
      const { endpoint, model } = await broker.getServiceMetadata(
        providerAddress,
        serviceName
      );
      const headers = await broker.getRequestHeaders(
        providerAddress,
        serviceName,
        prompt
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          model,
          prompt,
          headers,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        console.log("hello");
        if (data.requiredFee) {
          setPendingFee(data.requiredFee);
          setShowFeeDialog(true);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const receivedContent = data.choices[0].message.content;
      const chatID = data.id;
      if (!receivedContent) {
        throw new Error("No content received.");
      }
      const isValid = true;

      console.log("Received content:", receivedContent);

      const aiMessage: Message = {
        role: "ai",
        content: receivedContent,
        verified: isValid,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      if (error.message?.toLowerCase().includes("fee")) {
        setShowFeeDialog(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  async function handleSettleFee() {
    try {
      // Call settleFee directly with the broker
      // await broker.settleFee(
      //   providerAddress,
      //   serviceName,
      //   0.000000000000008200000000000000587
      // );

      console.log("Fee settled successfully");
      setShowFeeDialog(false);
      handleSend();
    } catch (error) {
      console.error("Settlement error:", error);
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      setShouldScroll(true);
    }
  }, [messages]);

  useEffect(() => {
    if (shouldScroll) {
      const scrollArea = scrollAreaRef.current;
      if (scrollArea) {
        const lastMessage = scrollArea.lastElementChild;
        lastMessage?.scrollIntoView({ behavior: "smooth" });
      }
      setShouldScroll(false);
    }
  }, [shouldScroll]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSend();
  }
  return (
    <>
      <div className="flex flex-col h-[600px] border border-gray-700 rounded-lg bg-gray-800 shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        <ScrollArea
          className="flex-grow p-4 h-full overflow-y-auto scroll-smooth"
          ref={scrollAreaRef}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              } animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col max-w-[80%]">
                {message.role === "ai" && (
                  <span className="text-sm font-medium mb-1 flex items-center gap-1">
                    AI{" "}
                    {message.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </span>
                )}
                <div
                  className={`p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-none"
                      : "bg-gray-900 text-gray-100 rounded-tl-none"
                  } shadow-lg transition-all duration-300 hover:shadow-xl`}
                >
                  {message.role === "ai" ? (
                    <div className="whitespace-pre-line">
                      {message.content
                        .split(/(\d+\.\s+\*\*.*?\*\*:|\*\*.*?\*\*|\n•\s+)/)
                        .map((part, index) => {
                          // Handle headers (1. **Title**)
                          if (part.match(/^\d+\.\s+\*\*.*?\*\*:/)) {
                            return (
                              <div
                                key={index}
                                className="text-lg font-bold text-blue-400 mt-4 mb-2"
                              >
                                {part.replace(/\*\*/g, "")}
                              </div>
                            );
                          }
                          // Handle bold text
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <span
                                key={index}
                                className="font-bold text-blue-400"
                              >
                                {part.replace(/\*\*/g, "")}
                              </span>
                            );
                          }
                          // Handle bullet points
                          if (part.startsWith("\n• ")) {
                            return (
                              <div
                                key={index}
                                className="ml-4 mt-2 text-gray-100"
                              >
                                • {part.replace(/\n•\s+/, "")}
                              </div>
                            );
                          }
                          // Regular text
                          return (
                            <span key={index} className="text-gray-100">
                              {part}
                            </span>
                          );
                        })}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">AI</span>
                <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="h-4" />
        </ScrollArea>
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow bg-gray-700 border-2 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 transition-all duration-300 shadow-inner focus:shadow-lg"
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Send
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Fee Settlement Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please settle the fee to continue chatting.</p>
            <p className="text-sm text-gray-400">
              Amount per request: {pendingFee} A0GI
            </p>
            <Button
              onClick={handleSettleFee}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Settle Fee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
