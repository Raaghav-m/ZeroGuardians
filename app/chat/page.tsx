"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useSearchParams } from "next/navigation";
import { JsonRpcSigner } from "ethers";
import { useConnectorClient } from "wagmi";
import { clientToSigner } from "@/lib/ethers";
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";
import { Model } from "@/components/ModelSelectionForm";

export default function ChatPage() {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [broker, setBroker] = useState<ZgServingUserBrokerConfig | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const { data: client } = useConnectorClient();

  useEffect(() => {
    if (client) {
      setSigner(clientToSigner(client));
    }
  }, [client]);

  if (!broker || !model || !signer) return null;

  return <ChatWindow broker={broker} aiModel={model} signer={signer} />;
}
