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

  return showChat ? (
    <ChatWindow broker={broker!} aiModel={models[selectedModelIndex!]} />
  ) : (
    <Card className="w-full max-w-md mx-auto bg-gray-800 shadow-2xl rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
      <CardContent className="pt-6">
        {isModelLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700/50 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {models?.map((model, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log("Selected index:", index);
                  setSelectedModelIndex(index);
                }}
                className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 hover:bg-gray-700/50 border text-left ${
                  selectedModelIndex === index && selectedModelIndex !== null
                    ? "border-blue-500 bg-gray-700/30"
                    : "border-gray-700"
                }`}
                type="button"
                role="radio"
                aria-checked={selectedModelIndex === index}
              >
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-200">
                    {model.name}
                  </span>
                  <span className="text-lg font-bold text-blue-400">
                    ${(Number(model.inputPrice) / 1e18).toFixed(18)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleChatNow}
          disabled={selectedModelIndex === null || !signer || isCheckingAccount}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500"
        >
          {isCheckingAccount ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
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
