/**
 * Shelby Network Configuration
 *
 * Two active networks:
 * - testnet  : Early Access (April 2026), runs on standard Aptos testnet
 * - shelbynet: Devnet (older), runs on Shelby's own isolated Aptos validator
 */

// ── Network types ──────────────────────────────────────────────────────────

export type ShelbyNetwork = "testnet" | "shelbynet";

export interface NetworkConfig {
  label: string;
  aptosNetwork: string;
  aptosNodeUrl: string;
  aptosIndexerUrl: string;
  shelbyExplorerBase: string;
  aptosExplorerBase: string;
  aptosExplorerNetwork: string;
  faucetUrl?: string;
  /** Which Network enum value to pass to ShelbyNodeClient */
  sdkNetwork: "testnet" | "shelbynet";
}

// ── Per-network configs ────────────────────────────────────────────────────

export const NETWORK_CONFIGS: Record<ShelbyNetwork, NetworkConfig> = {
  testnet: {
    label:                "Testnet (Early Access)",
    aptosNetwork:         "testnet",
    aptosNodeUrl:         "https://api.testnet.aptoslabs.com/v1",
    aptosIndexerUrl:      "https://api.testnet.aptoslabs.com/v1/graphql",
    shelbyExplorerBase:   "https://explorer.shelby.xyz/testnet",
    aptosExplorerBase:    "https://explorer.aptoslabs.com",
    aptosExplorerNetwork: "testnet",
    faucetUrl:            "https://aptos.dev/en/network/faucet",
    sdkNetwork:           "testnet",
  },
  shelbynet: {
    label:                "Shelbynet (Devnet)",
    aptosNetwork:         "shelbynet",
    aptosNodeUrl:         "https://api.shelbynet.shelby.xyz/v1",
    aptosIndexerUrl:      "https://api.shelbynet.shelby.xyz/v1/graphql",
    shelbyExplorerBase:   "https://explorer.shelby.xyz/shelbynet",
    aptosExplorerBase:    "https://explorer.aptoslabs.com",
    aptosExplorerNetwork: "shelbynet",
    faucetUrl:            "https://faucet.shelbynet.shelby.xyz",
    sdkNetwork:           "shelbynet",
  },
};

/** Returns the NetworkConfig for the given network name (defaults to testnet) */
export function getNetworkConfig(network?: string | null): NetworkConfig {
  const key = (network || process.env.SHELBY_NETWORK || "testnet") as ShelbyNetwork;
  return NETWORK_CONFIGS[key] ?? NETWORK_CONFIGS.testnet;
}

// ── Legacy shelbyConfig (kept for backward compat) ─────────────────────────

export const shelbyConfig = {
  // Fallback values read from env (used server-side where no network param is available)
  aptosNetwork:       process.env.APTOS_NETWORK       || "testnet",
  shelbyNetwork:      process.env.SHELBY_NETWORK      || "testnet",
  accountAddress:     process.env.SHELBY_ACCOUNT_ADDRESS  || "",
  accountPrivateKey:  process.env.SHELBY_ACCOUNT_PRIVATE_KEY || "",
  apiKey:             process.env.SHELBY_API_KEY       || "",
  aptosNodeUrl:       process.env.APTOS_NODE_URL       || "https://api.testnet.aptoslabs.com/v1",
  aptosIndexerUrl:    process.env.APTOS_INDEXER_URL    || "https://api.testnet.aptoslabs.com/v1/graphql",
  aptosExplorerBase:  process.env.APTOS_EXPLORER_BASE  || "https://explorer.aptoslabs.com",
  shelbyExplorerBase: process.env.SHELBY_EXPLORER_BASE || "https://explorer.shelby.xyz/testnet",
  signingSecret:      process.env.SHELBY_SIGNING_SECRET || "",
  endpoint:           process.env.SHELBY_ENDPOINT      || "https://gateway.shelby.xyz",
  bucket:             process.env.SHELBY_BUCKET        || "shelby-drop",
  origin:             process.env.SHELBY_ORIGIN        || "https://explorer.shelby.xyz",

  /** Aptos Explorer tx link — network-aware */
  getTransactionUrl: (txHash: string, network?: string) => {
    const cfg = getNetworkConfig(network);
    return `${cfg.aptosExplorerBase}/txn/${txHash}?network=${cfg.aptosExplorerNetwork}`;
  },

  /** Shelby Explorer account page — network-aware */
  getExplorerUrl: (walletAddress: string, network?: string) => {
    const cfg = getNetworkConfig(network);
    return `${cfg.shelbyExplorerBase}/account/${walletAddress}`;
  },

  getShelbyTransactionUrl: (txHash: string, network?: string) => {
    const cfg = getNetworkConfig(network);
    return `${cfg.shelbyExplorerBase}/tx/${txHash}`;
  },

  getFileUrl: (wallet: string, filename: string) => {
    const gateway = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://gateway.shelby.xyz";
    return `${gateway}/${wallet}/${filename}`;
  },
};

export const validateConfig = () => {
  const required = ["SHELBY_ACCOUNT_ADDRESS", "SHELBY_ACCOUNT_PRIVATE_KEY", "SHELBY_API_KEY"];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) { console.error("Missing env vars:", missing); return false; }
  return true;
};

export default shelbyConfig;
