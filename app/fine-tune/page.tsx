"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnectorClient } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Upload,
  FileText,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Providers } from "../providers";
import { WalletButton } from "@/components/WalletButton";
import { clientToSigner } from "@/lib/ethers";
import {
  createZGComputeNetworkBroker,
  ZGComputeNetworkBroker,
} from "@0glabs/0g-serving-broker";
import { ethers, JsonRpcSigner } from "ethers";

export interface Model {
  provider: string;
  name: string;
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  updatedAt: bigint;
  model: string;
}

export default function FineTunePage() {
  return (
    <Providers>
      <FineTuneContent />
    </Providers>
  );
}

function FineTuneContent() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { data: client } = useConnectorClient();

  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [broker, setBroker] = useState<ZGComputeNetworkBroker | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(
    null
  );
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<
    "select-model" | "upload-files"
  >("select-model");
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize signer and broker
  useEffect(() => {
    if (client) {
      const newSigner = clientToSigner(client);
      setSigner(newSigner);
    }
  }, [client]);

  useEffect(() => {
    if (signer && isConnected) {
      (async () => {
        try {
          setIsModelLoading(true);
          const provider = new ethers.JsonRpcProvider(
            "https://rpc.ankr.com/0g_galileo_testnet_evm"
          );
          const wallet = new ethers.Wallet(
            "540767f0b1c5ae3d5a5d2d5b8d0664fe7b93e0ccbe8eff9fafced901abd69d3b",
            provider
          );
          const newBroker = await createZGComputeNetworkBroker(wallet);
          setBroker(newBroker);

          const services = await newBroker.inference.listService();
          setModels(services);
        } catch (error) {
          console.error("Error initializing:", error);
          setErrorMessage("Unable to load AI models. Please refresh the page.");
        } finally {
          setIsModelLoading(false);
        }
      })();
    }
  }, [signer, isConnected]);

  const handleDataFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDataFile(file);
    }
  };

  const handleConfigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConfigFile(file);
    }
  };

  const handleStartFineTuning = async () => {
    if (!dataFile || !configFile) {
      alert("Please upload both data and config files");
      return;
    }

    setIsLoading(true);

    // Simulate fine-tuning process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert(
      "Fine-tuning started! This is a placeholder - in a real app, this would trigger the actual fine-tuning process."
    );
    setIsLoading(false);
  };

  const handleBack = () => {
    if (currentStep === "upload-files") {
      setCurrentStep("select-model");
    } else {
      router.push("/");
    }
  };

  const handleModelSelect = () => {
    if (selectedModelIndex !== null) {
      setCurrentStep("upload-files");
    }
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
              Please connect your wallet to access fine-tuning features
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
            <h1 className="text-xl font-bold text-white">
              {currentStep === "select-model"
                ? "Select Model to Fine-tune"
                : "Fine-tune Model"}
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        {currentStep === "select-model" ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose Your Base Model
              </h2>
              <p className="text-gray-300">
                Select a pre-trained model to fine-tune with your custom data
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Available Models</CardTitle>
                <CardDescription className="text-gray-300">
                  Choose the model you want to fine-tune
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isModelLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-700/70 rounded-2xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {models?.map((model, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedModelIndex(index)}
                        className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 ${
                          selectedModelIndex === index
                            ? "bg-blue-500/70 backdrop-blur-xl"
                            : "bg-gray-700/70 backdrop-blur-xl hover:bg-gray-600/70"
                        } border border-gray-700/20`}
                      >
                        <div className="flex-1 flex items-center justify-between px-2">
                          <div className="text-left">
                            <span className="text-lg font-medium text-gray-200 truncate block max-w-[300px]">
                              {model.name}
                            </span>
                            <span className="text-sm text-gray-400">
                              Provider: {model.provider.slice(0, 6)}...
                              {model.provider.slice(-4)}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl shrink-0 ml-4">
                            ${(Number(model.inputPrice) / 1e18).toFixed(6)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {errorMessage && (
                  <div className="text-red-400 text-center p-4 bg-red-500/10 rounded-lg">
                    {errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedModelIndex !== null && (
              <div className="mt-6">
                <Button
                  onClick={handleModelSelect}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                >
                  Continue with {models[selectedModelIndex]?.name}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Fine-tune Your Model
              </h2>
              <p className="text-gray-300">
                Upload your training data and configuration to fine-tune:{" "}
                <span className="text-blue-400 font-semibold">
                  {models[selectedModelIndex!]?.name}
                </span>
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Upload Files</CardTitle>
                <CardDescription className="text-gray-300">
                  Select your training data and configuration files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data File Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="data-file"
                    className="text-white flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Training Data File
                  </Label>
                  <div className="relative">
                    <Input
                      id="data-file"
                      type="file"
                      accept=".csv,.zip,.json,.txt"
                      onChange={handleDataFileChange}
                      className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                  {dataFile && (
                    <p className="text-sm text-green-400">
                      ✓ Selected: {dataFile.name} (
                      {(dataFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Supported formats: CSV, ZIP, JSON, TXT (max 100MB)
                  </p>
                </div>

                {/* Config File Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="config-file"
                    className="text-white flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configuration File
                  </Label>
                  <div className="relative">
                    <Input
                      id="config-file"
                      type="file"
                      accept=".json"
                      onChange={handleConfigFileChange}
                      className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                  {configFile && (
                    <p className="text-sm text-green-400">
                      ✓ Selected: {configFile.name} (
                      {(configFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    JSON configuration file with model parameters
                  </p>
                </div>

                {/* Start Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleStartFineTuning}
                    disabled={!dataFile || !configFile || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Starting Fine-tuning...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Start Fine-tuning
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20">
              <CardContent className="pt-6">
                <div className="text-blue-300 text-sm">
                  <h4 className="font-semibold mb-2">What happens next?</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Your files will be validated and processed</li>
                    <li>• The model will be fine-tuned using your data</li>
                    <li>• You'll receive notifications on progress</li>
                    <li>
                      • The final model will be available in your dashboard
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
