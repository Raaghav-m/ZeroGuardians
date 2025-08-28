"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnectorClient } from "wagmi";
import { clientToSigner } from "@/lib/ethers";
import {
  createZGComputeNetworkBroker,
  ZGComputeNetworkBroker,
} from "@0glabs/0g-serving-broker";
import { ethers, JsonRpcSigner } from "ethers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ModelCard, MarketplaceModel } from "./ModelCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function BaseModels() {
  const { isConnected } = useAccount();
  const { data: client } = useConnectorClient();
  const router = useRouter();

  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [broker, setBroker] = useState<ZGComputeNetworkBroker | null>(null);
  const [models, setModels] = useState<MarketplaceModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      const newSigner = clientToSigner(client);
      setSigner(newSigner);
    }
  }, [client]);

  useEffect(() => {
    if (!isConnected || !signer) return;
    (async () => {
      try {
        setIsLoading(true);
        const provider = new ethers.JsonRpcProvider(
          "https://rpc.ankr.com/0g_galileo_testnet_evm"
        );
        const wallet = new ethers.Wallet(
          "540767f0b1c5ae3d5a5d2d5b8d0664fe7b93e0ccbe8eff9fafced901abd69d3b",
          provider
        );
        const newBroker = await createZGComputeNetworkBroker(wallet);
        setBroker(newBroker);
        const services = await newBroker.inference.listService();
        setModels(services as unknown as MarketplaceModel[]);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load base models");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isConnected, signer]);

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Base Models</CardTitle>
          <CardDescription className="text-gray-300">
            Sourced directly from 0g SDK
          </CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">Loading models…</CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Base Models</CardTitle>
          <CardDescription className="text-gray-300">
            Sourced directly from 0g SDK
          </CardDescription>
        </CardHeader>
        <CardContent className="text-red-300">{errorMessage}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Base Models</CardTitle>
        <CardDescription className="text-gray-300">
          Sourced directly from 0g SDK
        </CardDescription>
      </CardHeader>
      <CardContent>
        {models.length === 0 ? (
          <div className="text-gray-300">No models available.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {models.map((m, idx) => (
              <div key={`${m.provider}-${m.name}-${idx}`} className="space-y-2">
                <ModelCard model={m} />
                <div className="flex justify-end">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() =>
                      router.push(`/marketplace/chat?provider=${m.provider}`)
                    }
                  >
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
