"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WalletButton } from "@/components/WalletButton";
import { useRouter } from "next/navigation";
import { Providers } from "./providers";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFineTune = () => {
    router.push("/fine-tune");
  };

  const handleMarketplace = () => {
    router.push("/marketplace");
  };

  return (
    <Providers>
      <AppContent
        isLoading={isLoading}
        onFineTune={handleFineTune}
        onMarketplace={handleMarketplace}
      />
    </Providers>
  );
}

function AppContent({
  isLoading,
  onFineTune,
  onMarketplace,
}: {
  isLoading: boolean;
  onFineTune: () => void;
  onMarketplace: () => void;
}) {
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome to NeuraForge
            </CardTitle>
            <CardDescription className="text-gray-300">
              AI Model Fine-tuning Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              Connect your wallet to access the platform
            </p>
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">NeuraForge</h1>
          <div className="flex items-center gap-4">
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome back!</h2>
          <p className="text-gray-300 text-lg">
            What would you like to do today?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card
            className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            onClick={onFineTune}
          >
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Fine-tune a Model
              </CardTitle>
              <CardDescription className="text-gray-300">
                Upload your data and configuration to create a custom AI model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-blue-400 text-sm">
                Upload CSV/ZIP data files and JSON config files to start
                fine-tuning
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            onClick={onMarketplace}
          >
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Explore Marketplace
              </CardTitle>
              <CardDescription className="text-gray-300">
                Browse and discover pre-trained models and datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-blue-400 text-sm">
                Find ready-to-use models and datasets from the community
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
