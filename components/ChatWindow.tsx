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
import abi from "@/data/abi";
import { useWriteContract, useDisconnect } from "wagmi";
import { readContract, getAccount } from "@wagmi/core";
import { config } from "@/lib/config";
import { ErrorToast } from "./ui/toast";

interface Message {
  role: "user" | "ai";
  content: string;
  verified?: boolean;
  timestamp: string;
}

interface ChatWindowProps {
  broker: ZgServingUserBrokerConfig;
  aiModel: Model;
  signer: JsonRpcSigner;
  client?: Client;
}

// Add type for backup
interface Backup {
  hash: string;
  content: {
    title: string;
    chat_history: Message[];
  };
}

// Add types for account info
interface AccountInfo {
  userAddress: string;
  providerAddress: string;
  nonce: bigint;
  balance: bigint;
  pendingRefund: bigint;
  signer: [bigint, bigint];
  refunds: any[];
}

// Add proper types instead of any
interface ErrorType {
  message?: string;
  details?: string;
}

export function ChatWindow({
  broker,
  aiModel,
  signer,
  client,
}: ChatWindowProps): JSX.Element {
  const { disconnect } = useDisconnect();
  const account = getAccount(config);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const providerAddress = aiModel.provider;
  const serviceName = aiModel.name;
  const [pendingFee, setPendingFee] = useState(
    (Number(aiModel.inputPrice) / 1e18).toFixed(18)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showFeeDialog, setShowFeeDialog] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupName, setBackupName] = useState("");
  const { writeContract } = useWriteContract();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [rootHashes, setRootHashes] = useState<Backup[]>([]);
  const [showRetrieveDialog, setShowRetrieveDialog] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [accountBalance, setAccountBalance] = useState<bigint | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [failedMessageIndex, setFailedMessageIndex] = useState<number | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const info = await broker.getAccount(providerAddress);
        setAccountInfo({
          userAddress: info[0],
          providerAddress: info[1],
          nonce: info[2],
          balance: info[3],
          pendingRefund: info[4],
          signer: info[5],
          refunds: info[6],
        });
      } catch (error) {
        console.error("Error fetching account:", error);
      }
    };

    fetchAccountDetails();
  }, [broker, providerAddress]);

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
        if (data.requiredFee) {
          setPendingFee(data.requiredFee);
          setShowFeeDialog(true);
          setFailedMessageIndex(messages.length);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const receivedContent = data.choices[0].message.content;
      const isValid = true;

      const aiMessage: Message = {
        role: "ai",
        content: receivedContent,
        verified: isValid,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error("Chat error:", error);
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.toLowerCase().includes("fee")) {
          setErrorMessage(
            "Fee settlement required. Please add funds to continue."
          );
        } else {
          setErrorMessage("Failed to send message. Please try again.");
        }
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

  // Add function to handle backup
  const handleBackupChat = () => {
    setIsBackingUp(true);
    try {
      setShowBackupDialog(true);
    } finally {
      setIsBackingUp(false);
    }
  };
  function constructChatJSON(title: string, messages: Message[]) {
    return {
      title: title,
      chat_history: messages,
    };
  }

  // Add function to handle backup confirmation
  const handleBackupConfirm = async () => {
    if (!backupName.trim()) return;
    setIsBackingUp(true);
    try {
      const json = constructChatJSON(backupName, messages);

      const response = await fetch("/api/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });

      const data = await response.json();

      if (data.success) {
        await writeContract({
          address: "0x80bda8037dB200463759a22cAe3a6314b3C91F16",
          abi: abi,
          functionName: "addRootHash",
          args: [data.rootHash],
        });
        setShowBackupDialog(false);
        setBackupName("");
      } else {
        throw new Error(data.error || "Failed to backup chat");
      }
    } catch (error) {
      console.error("Backup error:", error);
      setErrorMessage("Unable to backup chat. Please try again later.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRetrieve = async () => {
    setIsRetrieving(true);
    if (!account.address) {
      setIsRetrieving(false);
      return;
    }

    try {
      const hashes = await readContract(config, {
        abi: abi,
        address: "0x80bda8037dB200463759a22cAe3a6314b3C91F16",
        functionName: "getRootHashesForUser",
        args: [account.address],
      });

      if (hashes) {
        const response = await fetch("/api/retrieve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ hashes: hashes }),
        });

        const data = await response.json();
        if (data.success) {
          setRootHashes(
            data.backups.map((b: Backup) => ({
              hash: b.hash,
              content: {
                title: b.content.title,
                chat_history: b.content.chat_history,
              },
            }))
          );
          setShowRetrieveDialog(true);
        }
      }
    } catch (error) {
      console.error("Retrieve error:", error);
      setErrorMessage("Unable to load chat history. Please try again.");
    } finally {
      setIsRetrieving(false);
    }
  };

  // Add a check for AI response in messages
  const hasAIResponse = messages.some((msg) => msg.role === "ai");

  return (
    <>
      <div className="flex flex-col h-[600px] border border-gray-700/20 rounded-2xl bg-gray-800/40 backdrop-blur-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex items-center justify-between p-3 border-b border-gray-700/20 bg-gray-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => (window.location.href = "/select-model")}
              className="bg-gray-700/40 hover:bg-gray-600/40 text-white text-sm px-3 py-1 rounded-lg"
            >
              ← Back
            </Button>
            <span className="text-blue-400">AI Model:</span>
            <span className="font-medium text-gray-200">{aiModel.name}</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAccountInfo(true)}
              className="bg-gray-700/40 hover:bg-gray-600/40 text-white text-sm px-3 py-1 rounded-lg"
            >
              Balance:{" "}
              {accountBalance
                ? (Number(accountBalance) / 1e18).toFixed(4)
                : "0"}{" "}
              A0GI
            </Button>
            <Button
              onClick={handleRetrieve}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded-lg"
              disabled={isRetrieving}
            >
              {isRetrieving ? "Retrieving..." : "Retrieve Backups"}
            </Button>
            <Button
              onClick={handleBackupChat}
              className="bg-gray-700/40 hover:bg-gray-600/40 text-white text-sm px-3 py-1 rounded-lg"
              disabled={!hasAIResponse || messages.length === 0 || isBackingUp}
            >
              {isBackingUp ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Backing up...
                </div>
              ) : (
                "Backup Chat"
              )}
            </Button>
          </div>
        </div>
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
                      ? "bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-xl text-white rounded-tr-none"
                      : "bg-gray-900/40 backdrop-blur-xl text-gray-100 rounded-tl-none"
                  } ${
                    index === failedMessageIndex
                      ? "border-2 border-red-500/50"
                      : ""
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
                  {index === failedMessageIndex && (
                    <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                      <span>⚠️ Failed - Settlement Required</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="flex flex-col max-w-[80%]">
                <span className="text-sm font-medium mb-1 flex items-center gap-1">
                  AI
                </span>
                <div className="inline-block p-3 rounded-2xl bg-gray-900/40 backdrop-blur-xl text-gray-200 rounded-tl-none">
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
        <div className="p-4 border-t border-gray-700/20 bg-gray-800/40 backdrop-blur-xl">
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
              className="flex-grow bg-gray-700/30 backdrop-blur-xl border-2 border-gray-600/20 focus:border-blue-500/40"
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-xl hover:from-purple-500/40 hover:to-blue-500/40 text-white font-bold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Send
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={showFeeDialog} onOpenChange={setShowFeeDialog}>
        <DialogContent className="bg-gray-800/40 backdrop-blur-xl text-white rounded-2xl border border-gray-700/20">
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

      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="bg-gray-800/40 backdrop-blur-xl text-white rounded-[32px] border border-gray-700/20">
          <DialogHeader className="border-b border-gray-700/20 pb-4">
            <DialogTitle className="text-blue-400 text-lg">
              Name Your Backup
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-gray-700/30 p-4 rounded-2xl">
              <p className="text-sm text-gray-400 mb-2">
                Enter a name for your backup:
              </p>
              <Input
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Enter backup name..."
                className="bg-gray-700/30 backdrop-blur-xl text-white rounded-xl border-gray-600/20 focus:border-blue-500/40"
              />
            </div>
            <Button
              onClick={handleBackupConfirm}
              className="w-full bg-blue-500/40 hover:bg-blue-600/40 backdrop-blur-xl rounded-xl py-3"
              disabled={isBackingUp || !backupName.trim()}
            >
              {isBackingUp ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Backing up...
                </div>
              ) : (
                "Back it up"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRetrieveDialog} onOpenChange={setShowRetrieveDialog}>
        <DialogContent className="bg-gray-800/40 backdrop-blur-xl text-white max-w-4xl rounded-2xl border border-gray-700/20">
          <DialogHeader className="border-b border-gray-700/20 pb-4">
            <DialogTitle className="text-blue-400">Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[70vh] overflow-auto p-4">
            {rootHashes.map((backup, index) => (
              <div
                key={index}
                className="bg-gray-700/40 backdrop-blur-xl rounded-xl p-4 space-y-4 border border-gray-600/20"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-blue-400 text-lg">
                    {backup.content.title}
                  </h3>
                  <Button
                    onClick={() => {
                      setMessages(backup.content.chat_history);
                      setShowRetrieveDialog(false);
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Load Chat
                  </Button>
                </div>
                <div className="space-y-2">
                  {/* Show first and last message only */}
                  {backup.content.chat_history.length > 0 && (
                    <>
                      <div className={`p-2 rounded bg-gray-600`}>
                        <span className="text-xs text-gray-400">
                          First Message
                        </span>
                        <p className="text-sm line-clamp-2">
                          {backup.content.chat_history[0].content}
                        </p>
                      </div>

                      {backup.content.chat_history.length > 1 && (
                        <div className={`p-2 rounded bg-gray-800`}>
                          <span className="text-xs text-gray-400">
                            Last Message
                          </span>
                          <p className="text-sm line-clamp-2">
                            {
                              backup.content.chat_history[
                                backup.content.chat_history.length - 1
                              ].content
                            }
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        {backup.content.chat_history.length} conversations in
                        total
                      </p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 font-mono mt-2">
                  Hash: {backup.hash}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAccountInfo} onOpenChange={setShowAccountInfo}>
        <DialogContent className="bg-gray-800/40 backdrop-blur-xl text-white rounded-[32px] border border-gray-700/20">
          <DialogHeader className="border-b border-gray-700/20 pb-4">
            <DialogTitle className="text-blue-400">Account Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2 bg-gray-700/30 p-4 rounded-2xl">
              <p className="text-sm text-gray-400">Provider Address</p>
              <p className="font-mono text-xs break-all">
                {accountInfo?.providerAddress || "N/A"}
              </p>
            </div>
            <div className="space-y-2 bg-gray-700/30 p-4 rounded-2xl">
              <p className="text-sm text-gray-400">Balance</p>
              <p className="text-lg font-medium">
                {accountInfo?.balance
                  ? (Number(accountInfo.balance) / 1e18).toFixed(18)
                  : "0"}{" "}
                <span className="text-blue-400">A0GI</span>
              </p>
            </div>
            <div className="space-y-2 bg-gray-700/30 p-4 rounded-2xl">
              <p className="text-sm text-gray-400">Pending Refund</p>
              <p className="text-lg font-medium">
                {accountInfo?.pendingRefund
                  ? (Number(accountInfo.pendingRefund) / 1e18).toFixed(18)
                  : "0"}{" "}
                <span className="text-blue-400">A0GI</span>
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  await disconnect();
                  window.location.href = "/";
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
              className="w-full bg-red-500/40 hover:bg-red-600/40 rounded-xl py-3 mt-4"
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </>
  );
}
