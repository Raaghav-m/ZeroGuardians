"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  useAccount,
  useConnectorClient,
  useConfig,
  useSwitchChain,
} from "wagmi";
import { clientToSigner } from "@/lib/ethers";
import {
  createZGServingNetworkBroker,
  ZgServingUserBrokerConfig,
} from "@0glabs/0g-serving-broker";
import { JsonRpcSigner } from "ethers";

import { AccountDialog } from "@/components/AccountDialog";
import { ChatWindow } from "@/components/ChatWindow";
import { setGlobalBroker, getBroker } from "@/lib/broker";

export type Model = {
  provider: string; // Provider's wallet address, which is the unique identifier for the provider.
  name: string;
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  updatedAt: bigint;
  model: string;
};

export function ModelSelectionForm() {
  const [models, setModels] = useState<Model[]>([]);
  const [broker, setBroker] = useState<ZgServingUserBrokerConfig | null>(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get signer
  const { data: client } = useConnectorClient();

  const { isConnected } = useAccount();
  const { chains } = useConfig();
  const { switchChain } = useSwitchChain();

  const [showAccountDialog, setShowAccountDialog] = useState(false);

  // Add state for address
  const [userAddress, setUserAddress] = useState<string>("");

  // Add loading state
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Add new states
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  // Add state for chat view
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (client) {
      const newSigner = clientToSigner(client);
      setSigner(newSigner);
    }
  }, [client]);

  useEffect(() => {
    if (signer) {
      signer.getAddress().then(setUserAddress);
      (async () => {
        try {
          setIsModelLoading(true); // Start loading
          const newProcessor = await createZGServingNetworkBroker(signer);
          setGlobalBroker(newProcessor);
          console.log(await getBroker());
          setBroker(newProcessor);
          if (isConnected) {
            const services = await newProcessor.listService();
            setModels(services);
          }
        } catch (error) {
          console.error("Error initializing:", error);
        } finally {
          setIsModelLoading(false); // End loading
        }
      })();
    }
  }, [signer, isConnected]);

  async function fetchModels() {
    setIsLoading(true);
    setError(null);
    try {
      if (!broker) return;
      const response = await broker.listService();
      setModels(response);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch models"
      );
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChatNow() {
    if (!signer || selectedModelIndex === null || !broker) return;

    setIsCheckingAccount(true);
    try {
      const balance = await broker.getAccount(
        models[selectedModelIndex].provider
      );
      setBalance(balance);

      // If account exists, navigate to chat
      if (balance) {
        setShowChat(true);
      } else {
        setShowAccountDialog(true);
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      setShowAccountDialog(true);
    } finally {
      setIsCheckingAccount(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center text-2xl text-blue-400">
        Please connect your wallet first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-2xl text-blue-400 animate-pulse">
        Loading models...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-2xl text-red-400">Error: {error}</div>
    );
  }

  return showChat && signer ? (
    <ChatWindow
      broker={broker!}
      aiModel={models[selectedModelIndex!]}
      signer={signer}
      client={client}
    />
  ) : (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800/40 backdrop-blur-xl border border-gray-700/20 rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <CardContent className="pt-6 space-y-4 px-6">
        {isModelLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700/70 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {models?.map((model, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedModelIndex(index);
                }}
                className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  selectedModelIndex === index && selectedModelIndex !== null
                    ? "bg-blue-500/70 backdrop-blur-xl"
                    : "bg-gray-700/70 backdrop-blur-xl hover:bg-gray-600/70"
                } border border-gray-700/20`}
              >
                <div className="flex-1 flex items-center justify-between px-2">
                  <div>
                    <span className="text-lg font-medium text-gray-200 truncate block max-w-[300px]">
                      {model.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl shrink-0 ml-4">
                    ${(Number(model.inputPrice) / 1e18).toFixed(18)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-gray-900/40">
        <Button
          onClick={handleChatNow}
          disabled={selectedModelIndex === null || !signer || isCheckingAccount}
          className="w-full bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-xl hover:from-purple-500/40 hover:to-blue-500/40 rounded-xl py-3"
        >
          {isCheckingAccount ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Checking Account...
            </div>
          ) : (
            "Chat Now"
          )}
        </Button>
      </CardFooter>
      <AccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
        model={selectedModelIndex !== null ? models[selectedModelIndex] : null}
        broker={broker}
        address={userAddress}
        onSuccess={() => setShowChat(true)}
      />
    </Card>
  );
}
