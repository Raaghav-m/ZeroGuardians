import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";
import { Model } from "./ModelSelectionForm";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: Model | null;
  broker: ZgServingUserBrokerConfig | null;
  address: string | undefined;
  onSuccess?: () => void;
}

export function AccountDialog({
  open,
  onOpenChange,
  model,
  broker,
  address,
  onSuccess,
}: AccountDialogProps) {
  const [userAddress, setUserAddress] = useState<string>();
  const [initialBalance, setInitialBalance] = useState(0.01);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUserAddress(address);
  }, [address]);

  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCreateAccount = async () => {
    if (!broker || !model?.provider) return;

    setIsCreating(true);
    try {
      await broker.addAccount(model.provider, initialBalance);
      setSuccess(true);

      // Auto close and switch to chat after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader className="text-center">
          <DialogTitle>Create Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <div className="text-sm space-y-2">
            <p className="font-medium">Model Name: {model?.name}</p>
            <p className="text-gray-400">
              User: {userAddress ? shortenAddress(userAddress) : ""}
            </p>
            <p className="text-gray-400">
              Provider Address:{" "}
              {model?.provider ? shortenAddress(model.provider) : ""}
            </p>
            <p className="text-blue-400">
              Amount per request:{" "}
              {model ? (Number(model.inputPrice) / 1e18).toFixed(18) : ""} A0GI
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium block">
                Pay Initial Balance Of:
              </label>
              <Input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
                min={0.01}
                step={0.01}
                className="bg-gray-700 border-gray-600 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
              />
              <p className="text-xs text-gray-400">Minimum: 0.0000001 A0GI</p>
            </div>
          </div>
          <div className="space-y-4">
            {success ? (
              <div className="text-green-400 animate-fade-in">
                Account created successfully! Redirecting to chat...
              </div>
            ) : (
              <Button
                onClick={handleCreateAccount}
                disabled={isCreating}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isCreating ? (
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account & Pay"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
