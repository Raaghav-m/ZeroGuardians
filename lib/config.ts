import { http, createConfig } from "wagmi";
import { type Chain } from "viem";
import { mainnet, sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const ZGChain = {
  id: 16601,
  name: "0G-Galileo-Testnet",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/0g_galileo_testnet_evm"] },
  },
} as const satisfies Chain;

export const config = createConfig({
  chains: [ZGChain],
  connectors: [metaMask()],
  transports: {
    [ZGChain.id]: http("https://rpc.ankr.com/0g_galileo_testnet_evm"),
  },
});

// Define your custom chain
