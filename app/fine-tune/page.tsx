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
  ChevronRight,
  Wallet,
  Database,
  Cpu,
  Monitor,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  DollarSign,
  Hash,
  Copy,
  ExternalLink,
  Info,
  Users,
  Zap,
  Shield,
  BarChart3,
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

interface Provider {
  address: string;
  available: boolean;
  pricePerByte: string;
}

interface FineTuneTask {
  id: string;
  status: string;
  progress: string;
  createdAt: string;
  modelHash: string;
  datasetHash: string;
  fee: string;
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Account Management
  const [accountBalance, setAccountBalance] = useState("0");
  const [lockedBalance, setLockedBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("0.1");

  // Provider & Model Selection
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Dataset & Configuration
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [configFile, setConfigFile] = useState<File | null>(null);
  const [datasetHash, setDatasetHash] = useState<string>("");
  const [datasetSize, setDatasetSize] = useState<string>("");

  // Task Management
  const [currentTask, setCurrentTask] = useState<FineTuneTask | null>(null);
  const [taskLogs, setTaskLogs] = useState<string[]>([]);
  const [tasks, setTasks] = useState<FineTuneTask[]>([]);

  // Initialize signer and broker
  useEffect(() => {
    if (client) {
      const newSigner = clientToSigner(client);
      setSigner(newSigner);
    }
  }, [client]);

  useEffect(() => {
    if (signer && isConnected) {
      initializeBroker();
    }
  }, [signer, isConnected]);

  const initializeBroker = async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider(
        "https://rpc.ankr.com/0g_galileo_testnet_evm"
      );
      const wallet = new ethers.Wallet(
        "540767f0b1c5ae3d5a5d2d5b8d0664fe7b93e0ccbe8eff9fafced901abd69d3b",
        provider
      );
      const newBroker = await createZGComputeNetworkBroker(wallet);
      setBroker(newBroker);

      // Load initial data
      await loadAccountInfo();
      await loadProviders();
      await loadModels();
      await loadTasks();
    } catch (error) {
      console.error("Error initializing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountInfo = async () => {
    // Mock data - replace with actual API calls
    setAccountBalance("0.999999999820331942");
    setLockedBalance("0.000000000179668154");
  };

  const loadProviders = async () => {
    // Mock data - replace with actual API calls
    setProviders([
      {
        address: "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
        available: true,
        pricePerByte: "0.000000000000000001",
      },
      {
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        available: true,
        pricePerByte: "0.000000000000000002",
      },
    ]);
  };

  const loadModels = async () => {
    try {
      const services = await broker?.inference.listService();
      setModels(services || []);
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const loadTasks = async () => {
    // Mock data - replace with actual API calls
    setTasks([
      {
        id: "beb6f0d8-4660-4c62-988d-00246ce913d2",
        status: "Delivered",
        progress: "100%",
        createdAt: "2025-03-11T01:20:07.644Z",
        modelHash: "0xcb42b5ca9e998c82dd239ef2d20d22a4ae16b3dc0ce0a855c93b52c7c2bab6dc",
        datasetHash: "0xaae9b4e031e06f84b20f10ec629f36c57719ea512992a6b7e2baea93f447a5fa",
        fee: "179668154",
      },
    ]);
  };

  const handleDeposit = async () => {
    setIsLoading(true);
    // Mock deposit - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadAccountInfo();
    setIsLoading(false);
  };

  const handleDatasetUpload = async () => {
    if (!datasetFile) return;
    
    setIsLoading(true);
    // Mock upload - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setDatasetHash("0xabc123def456789...");
    setDatasetSize("1.2 MB");
    setIsLoading(false);
  };

  const handleCreateTask = async () => {
    if (!selectedProvider || !selectedModel || !datasetHash || !configFile) return;
    
    setIsLoading(true);
    // Mock task creation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newTask: FineTuneTask = {
      id: "new-task-id-" + Date.now(),
      status: "Init",
      progress: "0%",
      createdAt: new Date().toISOString(),
      modelHash: "0xmodelhash...",
      datasetHash: datasetHash,
      fee: "150000000",
    };
    
    setCurrentTask(newTask);
    setTasks([newTask, ...tasks]);
    setCurrentStep(5); // Move to monitoring
    setIsLoading(false);
  };

  const handleMonitorTask = async () => {
    if (!currentTask) return;
    
    setIsLoading(true);
    // Mock monitoring - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate progress updates
    const progressSteps = ["Init", "SettingUp", "SetUp", "Training", "Trained", "Delivering", "Delivered"];
    const currentIndex = progressSteps.indexOf(currentTask.status);
    if (currentIndex < progressSteps.length - 1) {
      const updatedTask = {
        ...currentTask,
        status: progressSteps[currentIndex + 1],
        progress: `${Math.round(((currentIndex + 1) / (progressSteps.length - 1)) * 100)}%`,
      };
      setCurrentTask(updatedTask);
      setTasks(tasks.map(t => t.id === currentTask.id ? updatedTask : t));
    }
    
    setIsLoading(false);
  };

  const handleDownloadModel = async () => {
    if (!currentTask) return;
    
    setIsLoading(true);
    // Mock download - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleDecryptModel = async () => {
    setIsLoading(true);
    // Mock decryption - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const steps = [
    { id: 1, title: "Account Setup", icon: Wallet },
    { id: 2, title: "Select Provider", icon: Users },
    { id: 3, title: "Choose Model", icon: Cpu },
    { id: 4, title: "Upload Data", icon: Database },
    { id: 5, title: "Monitor Progress", icon: Monitor },
    { id: 6, title: "Download Results", icon: Download },
  ];

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
              onClick={() => router.push("/")}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-xl font-bold text-white">Fine-tune AI Models</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-300">Balance</div>
              <div className="text-white font-semibold">{accountBalance} OG</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-600 text-gray-400"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <div
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-white" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        {currentStep === 1 && (
          <AccountSetupStep
            accountBalance={accountBalance}
            lockedBalance={lockedBalance}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            onDeposit={handleDeposit}
            onNext={() => setCurrentStep(2)}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <ProviderSelectionStep
            providers={providers}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <ModelSelectionStep
            models={models}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedProvider={selectedProvider}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <DataUploadStep
            datasetFile={datasetFile}
            setDatasetFile={setDatasetFile}
            configFile={configFile}
            setConfigFile={setConfigFile}
            datasetHash={datasetHash}
            datasetSize={datasetSize}
            onUpload={handleDatasetUpload}
            onCreateTask={handleCreateTask}
            onBack={() => setCurrentStep(3)}
            isLoading={isLoading}
            selectedModel={selectedModel}
            selectedProvider={selectedProvider}
          />
        )}

        {currentStep === 5 && (
          <MonitoringStep
            currentTask={currentTask}
            taskLogs={taskLogs}
            onMonitor={handleMonitorTask}
            onNext={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
            isLoading={isLoading}
          />
        )}

        {currentStep === 6 && (
          <DownloadStep
            currentTask={currentTask}
            onDownload={handleDownloadModel}
            onDecrypt={handleDecryptModel}
            onBack={() => setCurrentStep(5)}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Task History Sidebar */}
      <div className="fixed right-4 top-24 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Task History
        </h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-gray-700/50"
              onClick={() => setCurrentTask(task)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-gray-400">ID: {task.id.slice(0, 8)}...</div>
                <div className={`text-xs px-2 py-1 rounded ${
                  task.status === "Delivered" ? "bg-green-500/20 text-green-400" :
                  task.status === "Failed" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {task.status}
                </div>
              </div>
              <div className="text-sm text-white">{task.progress}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step Components
function AccountSetupStep({ accountBalance, lockedBalance, depositAmount, setDepositAmount, onDeposit, onNext, isLoading }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Account Setup</h2>
        <p className="text-gray-300">Set up your account and add funds for fine-tuning</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Balance</span>
              <span className="text-white font-semibold">{accountBalance} OG</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Locked Balance</span>
              <span className="text-yellow-400">{lockedBalance} OG</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Available</span>
              <span className="text-green-400">
                {(parseFloat(accountBalance) - parseFloat(lockedBalance)).toFixed(18)} OG
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-white">Amount (OG)</Label>
              <Input
                id="deposit-amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="0.1"
                step="0.1"
              />
            </div>
            <Button
              onClick={onDeposit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Depositing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Deposit Funds
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ProviderSelectionStep({ providers, selectedProvider, setSelectedProvider, onNext, onBack }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Select Provider</h2>
        <p className="text-gray-300">Choose a GPU service provider for your fine-tuning task</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Available Providers</CardTitle>
          <CardDescription className="text-gray-300">
            Select a provider based on availability and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {providers.map((provider) => (
              <button
                key={provider.address}
                onClick={() => setSelectedProvider(provider.address)}
                className={`w-full p-4 rounded-lg border transition-all ${
                  selectedProvider === provider.address
                    ? "bg-blue-500/20 border-blue-500"
                    : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-white font-medium">
                      Provider {provider.address.slice(0, 6)}...{provider.address.slice(-4)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Price: {provider.pricePerByte} OG per byte
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      provider.available ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className="text-sm text-gray-300">
                      {provider.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-white/20 text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedProvider}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ModelSelectionStep({ models, selectedModel, setSelectedModel, selectedProvider, onNext, onBack }: any) {
  const predefinedModels = [
    {
      name: "distilbert-base-uncased",
      type: "Text Classification",
      description: "DistilBERT is a transformers model, smaller and faster than BERT"
    },
    {
      name: "cocktailsgd-opt-1.3b",
      type: "Language Generation",
      description: "CocktailSGD-opt-1.3B finetunes the Opt-1.3B language model"
    },
    {
      name: "deepseek-r1-distill-qwen-1.5b",
      type: "Reasoning Tasks",
      description: "DeepSeek-R1-Zero, trained via large-scale reinforcement learning"
    },
    {
      name: "mobilenet_v2",
      type: "Image Classification",
      description: "MobileNet V2 model pre-trained on ImageNet-1k"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Model</h2>
        <p className="text-gray-300">Select a pre-trained model to fine-tune</p>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Available Models</CardTitle>
          <CardDescription className="text-gray-300">
            Choose from predefined models or provider-specific models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Predefined Models</h3>
              <div className="grid gap-3">
                {predefinedModels.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => setSelectedModel(model.name)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedModel === model.name
                        ? "bg-blue-500/20 border-blue-500"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="text-white font-medium">{model.name}</div>
                    <div className="text-sm text-blue-400">{model.type}</div>
                    <div className="text-sm text-gray-400 mt-1">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {models.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Provider Models</h3>
                <div className="grid gap-3">
                  {models.map((model, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedModel(model.name)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedModel === model.name
                          ? "bg-blue-500/20 border-blue-500"
                          : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="text-white font-medium">{model.name}</div>
                      <div className="text-sm text-blue-400">{model.serviceType}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Price: ${(Number(model.inputPrice) / 1e18).toFixed(6)} per input
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-white/20 text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedModel}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function DataUploadStep({ datasetFile, setDatasetFile, configFile, setConfigFile, datasetHash, datasetSize, onUpload, onCreateTask, onBack, isLoading, selectedModel, selectedProvider }: any) {
  const handleDatasetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDatasetFile(file);
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setConfigFile(file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Upload Data</h2>
        <p className="text-gray-300">
          Upload your training dataset and configuration files
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Training Dataset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dataset-file" className="text-white">Dataset File</Label>
              <Input
                id="dataset-file"
                type="file"
                accept=".csv,.json,.txt,.zip"
                onChange={handleDatasetChange}
                className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
            {datasetFile && (
              <div className="text-sm text-green-400">
                ✓ Selected: {datasetFile.name} ({(datasetFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            {datasetHash && (
              <div className="text-sm text-blue-400">
                ✓ Uploaded: {datasetHash.slice(0, 20)}... ({datasetSize})
              </div>
            )}
            <Button
              onClick={onUpload}
              disabled={!datasetFile || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Uploading..." : "Upload Dataset"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="config-file" className="text-white">Config File</Label>
              <Input
                id="config-file"
                type="file"
                accept=".json"
                onChange={handleConfigChange}
                className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
            {configFile && (
              <div className="text-sm text-green-400">
                ✓ Selected: {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
            <div className="text-xs text-gray-400">
              Download configuration templates from the releases page
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-blue-300 text-sm">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Dataset Requirements
            </h4>
            <ul className="space-y-1 text-xs">
              <li>• Download dataset format specification from releases page</li>
              <li>• Ensure your dataset complies with the requirements</li>
              <li>• Supported formats: CSV, JSON, TXT, ZIP</li>
              <li>• Maximum file size: 100MB</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-white/20 text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onCreateTask}
          disabled={!datasetHash || !configFile || isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? "Creating Task..." : "Create Fine-tuning Task"}
        </Button>
      </div>
    </div>
  );
}

function MonitoringStep({ currentTask, taskLogs, onMonitor, onNext, onBack, isLoading }: any) {
  if (!currentTask) return null;

  const statusColors = {
    Init: "text-yellow-400",
    SettingUp: "text-blue-400",
    SetUp: "text-blue-400",
    Training: "text-purple-400",
    Trained: "text-green-400",
    Delivering: "text-blue-400",
    Delivered: "text-green-400",
    UserAcknowledged: "text-green-400",
    Finished: "text-green-400",
    Failed: "text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Monitor Progress</h2>
        <p className="text-gray-300">Track your fine-tuning task progress</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Task Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Task ID</span>
                <span className="text-white font-mono text-sm">{currentTask.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className={`font-semibold ${statusColors[currentTask.status as keyof typeof statusColors]}`}>
                  {currentTask.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Progress</span>
                <span className="text-white">{currentTask.progress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Created</span>
                <span className="text-white text-sm">
                  {new Date(currentTask.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Fee</span>
                <span className="text-white">{currentTask.fee} neurons</span>
              </div>
            </div>
            
            <Button
              onClick={onMonitor}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Refreshing..." : "Refresh Status"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Task Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-gray-300 text-sm">Model Hash</div>
                <div className="text-white font-mono text-xs break-all">
                  {currentTask.modelHash}
                </div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Dataset Hash</div>
                <div className="text-white font-mono text-xs break-all">
                  {currentTask.datasetHash}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentTask.status === "Delivered" && (
        <Card className="bg-green-500/10 backdrop-blur-xl border border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-green-300 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Task Completed!</h4>
              <p className="text-sm">Your model has been fine-tuned and is ready for download.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-white/20 text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {currentTask.status === "Delivered" && (
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Download Model
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DownloadStep({ currentTask, onDownload, onDecrypt, onBack, isLoading }: any) {
  if (!currentTask) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Download Results</h2>
        <p className="text-gray-300">Download and decrypt your fine-tuned model</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300">
              Download the encrypted model file from storage
            </div>
            <Button
              onClick={onDownload}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Downloading..." : "Download Encrypted Model"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Decrypt Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300">
              Decrypt the model using your private key
            </div>
            <Button
              onClick={onDecrypt}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Decrypting..." : "Decrypt Model"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20">
        <CardContent className="pt-6">
          <div className="text-blue-300 text-sm">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Download Process
            </h4>
            <ul className="space-y-1 text-xs">
              <li>• First, download the encrypted model file</li>
              <li>• The provider will upload the decryption key to the contract</li>
              <li>• Use your private key to decrypt the model</li>
              <li>• The decrypted model will be saved as a ZIP file</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="border-white/20 text-white">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => window.location.href = "/marketplace"}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Go to Marketplace
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
