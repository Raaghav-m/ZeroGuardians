"use client";

import { useSearchParams } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";
import { useEffect, useState } from "react";
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";
import { Model } from "@/components/ModelSelectionForm";

export default function ChatPage() {
  const [broker, setBroker] = useState<ZgServingUserBrokerConfig | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get broker and model from previous page
    const modelIndex = searchParams.get("modelIndex");
    if (modelIndex) {
      // Re-initialize broker and fetch model data
    }
  }, [searchParams]);

  if (!broker || !model) return null;

  return <ChatWindow broker={broker} aiModel={model} />;
}
