import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Providers } from "./providers";
import { WalletButton } from "@/components/WalletButton";

export default function Home() {
  return (
    <Providers>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
        <main className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
          <div className="flex justify-end w-full mb-4">
            <WalletButton />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
            Chat with AI Models
          </h1>
          <p className="text-xl mb-8 text-gray-300 animate-fade-in-down">
            Choose your model and start your AI conversation.
          </p>
          <Link href="/select-model">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 text-white shadow-lg hover:shadow-xl"
            >
              Start Now
            </Button>
          </Link>
        </main>
      </div>
    </Providers>
  );
}
