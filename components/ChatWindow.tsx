"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";
import { Model } from "./ModelSelectionForm";
import { CheckCircle } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
  verified?: boolean;
  timestamp: string;
};

interface ChatWindowProps {
  broker: ZgServingUserBrokerConfig;
  aiModel: Model;
}

export function ChatWindow({ broker, aiModel }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const providerAddress = aiModel.provider;
  const serviceName = aiModel.name;
  const price = (Number(aiModel.inputPrice) / 1e18).toFixed(18);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      const { endpoint, model } = await broker.getServiceMetadata(
        providerAddress,
        serviceName
      );
      const headers = await broker.getRequestHeaders(
        providerAddress,
        serviceName,
        input
      );
      console.log(headers);
      console.log(endpoint);
      console.log(model);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          model,
          input,
          headers,
        }),
      });

      const completion = await response.json();
      console.log(completion);
      if (!response.ok) throw new Error(completion.error);
      // const settleResponse = await fetch("/api/settle-fee", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     providerAddress,
      //     serviceName,
      //     price,
      //     signer: await broker.getSigner(),
      //   }),
      // });

      // if (!settleResponse.ok) {
      //   throw new Error("Failed to settle fee");
      // }

      const receivedContent = completion.choices[0].message.content;
      const chatID = completion.id;
      if (!receivedContent) {
        throw new Error("No content received.");
      }
      // const isValid = await broker.processResponse(
      //   providerAddress,
      //   serviceName,
      //   receivedContent,
      //   chatID
      // );
      const isValid = true;

      console.log("Received content:", receivedContent);

      const aiMessage: Message = {
        role: "ai",
        content: receivedContent,
        verified: isValid,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSend();
  }
  return (
    <div className="flex flex-col h-[600px] border border-gray-700 rounded-lg bg-gray-800 shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            } animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2">
              {message.role === "ai" && (
                <span className="text-lg font-medium">
                  AI{" "}
                  {message.verified && (
                    <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                  )}
                </span>
              )}
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-gray-700 text-gray-200"
                } shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105`}
              >
                {message.content}
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
  );
}
