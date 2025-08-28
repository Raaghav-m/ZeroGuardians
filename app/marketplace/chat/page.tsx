"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Providers } from "../../providers";
import { WalletButton } from "@/components/WalletButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <Providers>
      <ChatContent />
    </Providers>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const router = useRouter();
  const { isConnected } = useAccount();

  const handleBack = () => router.push("/marketplace");

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <WalletButton />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
        <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">Chat</h1>
          </div>
        </nav>
        <div className="max-w-5xl mx-auto p-6 text-white">
          Missing provider address.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">Chat</h1>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto p-6">
        <ChatWindow providerAddress={provider} />
      </main>
    </div>
  );
}
