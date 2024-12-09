"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

export const WalletButton = () => {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect({ connector: connectors[0] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="mt-4">
      {isConnected ? (
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="text-sm bg-gray-800/40 backdrop-blur-xl border-gray-700/20 hover:bg-gray-700/40"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Disconnecting...
            </div>
          ) : (
            `${address?.slice(0, 6)}...${address?.slice(-4)}`
          )}
        </Button>
      ) : (
        <Button
          onClick={handleConnect}
          variant="outline"
          className="text-sm bg-gray-800/40 backdrop-blur-xl border-gray-700/20 hover:bg-gray-700/40"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Connecting...
            </div>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      )}
    </div>
  );
};
