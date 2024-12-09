import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "@/components/ui/button";
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";
import { Model } from "./ModelSelectionForm";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ErrorToast } from "./ui/toast";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage(
        "Failed to create account. Please check your balance and try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-800/40 backdrop-blur-xl text-white rounded-[32px] border border-gray-700/20">
          <DialogHeader className="border-b border-gray-700/20 pb-4">
            <DialogTitle className="text-blue-400 text-lg">
              Account Setup Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-gray-700/30 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Provider</p>
                  <p className="text-lg font-medium text-white">
                    {model?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-xs font-mono text-gray-300">
                    {shortenAddress(model?.provider || "")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Please add funds to your account to start chatting with this
                model.
              </p>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount (A0GI)</label>
                <Input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  min={0.01}
                  step={0.01}
                  placeholder="Enter amount..."
                  className="bg-gray-700/30 backdrop-blur-xl text-white rounded-xl border-gray-600/20 focus:border-blue-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-xs text-gray-400">
                  Minimum amount:{" "}
                  {(Number(model?.inputPrice) / 1e18).toFixed(18)} A0GI
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreateAccount}
              className="w-full bg-blue-500/40 hover:bg-blue-600/40 backdrop-blur-xl rounded-xl py-3"
              disabled={
                isCreating || initialBalance < Number(model?.inputPrice) / 1e18
              }
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Account...
                </div>
              ) : (
                "Add Account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {errorMessage && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </>
  );
}
