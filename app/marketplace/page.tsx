"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Store, Package, Users, Star } from "lucide-react";
import { Providers } from "../providers";
import { WalletButton } from "@/components/WalletButton";
import { BaseModels } from "@/components/marketplace/BaseModels";
import { UserModels } from "@/components/marketplace/UserModels";

export default function MarketplacePage() {
  return (
    <Providers>
      <MarketplaceContent />
    </Providers>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const handleBack = () => {
    router.push("/");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Connect Wallet
            </CardTitle>
            <CardDescription className="text-gray-300">
              Please connect your wallet to access the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
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
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">Marketplace</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-6">
            <Store className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Explore Models</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse base models from 0g and, soon, your own uploaded models.
          </p>
        </div>

        {/* New Components */}
        <div className="grid gap-8">
          <BaseModels />
          <UserModels />
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Pre-trained Models</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Browse thousands of pre-trained models ready for your use case
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Connect with AI researchers and developers worldwide
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <CardTitle className="text-white">Quality Assurance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                All models are verified and tested for quality and performance
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Stay Updated
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Get notified when the marketplace launches and receive early
              access
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Notify Me
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
