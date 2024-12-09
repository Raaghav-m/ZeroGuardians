import { http, createConfig } from "wagmi";
import { type Chain } from "viem";
import { mainnet, sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const ZGChain = {
  id: 16600,
  name: "0G",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai/"] },
  },
  blockExplorers: {
    default: { name: "0G Scan", url: "https://chainscan-newton.0g.ai/" },
  },
} as const satisfies Chain;

export const config = createConfig({
  chains: [mainnet, sepolia, ZGChain],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [ZGChain.id]: http("https://evmrpc-testnet.0g.ai/"),
  },
});

// Define your custom chain
