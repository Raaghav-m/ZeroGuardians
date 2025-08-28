"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import { clientToSigner } from "@/lib/ethers";
import {
  createZGComputeNetworkBroker,
  ZGComputeNetworkBroker,
} from "@0glabs/0g-serving-broker";
import { JsonRpcSigner, ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatWindow({ providerAddress }: { providerAddress: string }) {
  const { isConnected, address } = useAccount();
  const { data: client } = useConnectorClient();

  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [broker, setBroker] = useState<ZGComputeNetworkBroker | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Account & funding state
  const [needsAccount, setNeedsAccount] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{
    balance: string;
    locked: string;
    available: string;
  } | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("0.1");

  useEffect(() => {
    if (client) {
      const newSigner = clientToSigner(client);
      setSigner(newSigner);
    }
  }, [client]);

  useEffect(() => {
    if (!isConnected || !signer || !providerAddress) return;
    (async () => {
      try {
        setInitializing(true);
        setError(null);
        setNeedsAccount(false);
        const newBroker = await createZGComputeNetworkBroker(signer);
        setBroker(newBroker);

        // Must acknowledge provider once per user before using the service
        try {
          await newBroker.inference.acknowledgeProviderSigner(providerAddress);
        } catch (_) {
          // ignore if already acknowledged
        }

        const meta = await newBroker.inference.getServiceMetadata(
          providerAddress
        );
        setEndpoint(meta.endpoint);
        setModelId(meta.model);
        await refreshBalance(newBroker);
      } catch (e) {
        console.error(e);
        setError(
          "Failed to initialize chat. Ensure wallet is connected and funded."
        );
      } finally {
        setInitializing(false);
      }
    })();
  }, [isConnected, signer, providerAddress]);

  useEffect(() => {
    // auto scroll to bottom
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const canSend = useMemo(
    () =>
      !!broker &&
      !!endpoint &&
      !!modelId &&
      input.trim().length > 0 &&
      !needsAccount,
    [broker, endpoint, modelId, input, needsAccount]
  );

  async function refreshBalance(activeBroker?: ZGComputeNetworkBroker | null) {
    const b = activeBroker ?? broker;
    if (!b) return;
    try {
      const ledger = await b.ledger.getLedger();
      const bal = (ledger as any).balance ?? BigInt(0);
      const lck = (ledger as any).locked ?? BigInt(0);
      const avail = bal - lck;
      setBalanceInfo({
        balance: ethers.formatEther(bal),
        locked: ethers.formatEther(lck),
        available: ethers.formatEther(avail),
      });
    } catch (_) {
      // Account may not exist yet
      setBalanceInfo(null);
    }
  }

  const handleSend = async () => {
    if (!canSend || !broker || !endpoint || !modelId) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    console.log(providerAddress, question);
    try {
      const headers = await broker.inference.getRequestHeaders(
        providerAddress,
        question
      );
      console.log("header:", headers);

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          model: modelId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      console.log(data);
      const answer: string = data.choices?.[0]?.message?.content ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);

      // Optional: verify response if supported by provider
      try {
        await broker.inference.processResponse(providerAddress, answer);
      } catch (_) {
        // ignore verification errors in MVP
      }
    } catch (e: any) {
      console.log(e);
      const msg = String(e?.message ?? e);
      if (msg.includes("AccountNotExists")) {
        setNeedsAccount(true);
        await refreshBalance();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "No 0G account found. Please create and fund your 0G account to continue.",
          },
        ]);
        return;
      }
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "There was an error processing your request. Please try again.",
        },
      ]);
    }
  };

  async function handleCreateAccount() {
    if (!broker) return;
    try {
      setLedgerLoading(true);
      const initial = 0.01;
      await broker.ledger.addLedger(initial as unknown as any);
      setNeedsAccount(false);
      await refreshBalance();
    } catch (e) {
      console.error(e);
    } finally {
      setLedgerLoading(false);
    }
  }

  async function handleDeposit() {
    if (!broker || !depositAmount) return;
    try {
      setLedgerLoading(true);
      const amountNum = Number(depositAmount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error("Enter a valid amount > 0");
      }
      await broker.ledger.addLedger(amountNum);
      await refreshBalance();
      if (needsAccount) setNeedsAccount(false);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Deposit failed. Please check the amount and try again.",
        },
      ]);
    } finally {
      setLedgerLoading(false);
    }
  }

  if (initializing) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Connecting to Service…</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          Setting up broker and fetching service metadata
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Unable to Start Chat</CardTitle>
        </CardHeader>
        <CardContent className="text-red-300">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Chat</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Ledger / Funding Section */}
        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-white/90 font-semibold">0G Account</div>
              <div className="text-xs text-gray-400 break-all">{address}</div>
              {balanceInfo ? (
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-gray-400">Balance</div>
                    <div className="text-white/90">
                      {balanceInfo.balance} OG
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Locked</div>
                    <div className="text-white/90">{balanceInfo.locked} OG</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Available</div>
                    <div className="text-white/90">
                      {balanceInfo.available} OG
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-yellow-300">Account not found</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {needsAccount && (
                <Button
                  onClick={handleCreateAccount}
                  disabled={ledgerLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {ledgerLoading ? "Creating…" : "Create Account (0.1 OG)"}
                </Button>
              )}
              <Input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount (OG)"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 w-36"
              />
              <Button
                onClick={handleDeposit}
                disabled={ledgerLoading || !depositAmount}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {ledgerLoading ? "Processing…" : "Deposit"}
              </Button>
              <Button
                variant="ghost"
                className="text-white/80 hover:bg-white/10"
                onClick={() => refreshBalance()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-[60vh]">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-3 pr-2"
          >
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === "user" ? "text-right" : "text-left"}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "inline-block bg-blue-600 text-white px-3 py-2 rounded-lg max-w-[80%]"
                          : "inline-block bg-white/10 text-white px-3 py-2 rounded-lg max-w-[80%]"
                      }
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something…"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={handleSend}
              disabled={!canSend}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
