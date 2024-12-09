"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Providers } from "./providers";
import { WalletButton } from "@/components/WalletButton";
import { ErrorToast } from "@/components/ui/toast";
import { LoadingScreen } from "@/components/ui/loading";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setIsLoading(true);
    router.push("/select-model");
  };

  return (
    <Providers>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <div className="fixed top-4 left-4 bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-4 max-w-md">
          <div className="flex items-center gap-2 text-yellow-300">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Please ensure the 0G Network is selected in your MetaMask wallet
            </p>
          </div>
        </div>
        <main className="text-center p-8 bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/20 shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex justify-end w-full mb-4">
            <WalletButton />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Chat with AI Models
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Choose your model and start your AI conversation.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="bg-gradient-to-r from-blue-500/40 to-purple-500/40 backdrop-blur-xl hover:from-purple-500/40 hover:to-blue-500/40 transition-all duration-300 text-white shadow-lg hover:shadow-xl rounded-xl"
          >
            Start Now
          </Button>
          {isLoading && <LoadingScreen />}
        </main>
        {errorMessage && (
          <ErrorToast
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}
      </div>
    </Providers>
  );
}
