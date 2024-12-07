"use client";

import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

export const WalletButton = () => {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  return (
    <div className="mt-4">
      {isConnected ? (
        <Button
          onClick={() => disconnect()}
          variant="outline"
          className="text-sm"
        >
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
      ) : (
        <Button
          onClick={() => connect({ connector: connectors[0] })}
          variant="outline"
          className="text-sm"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};
