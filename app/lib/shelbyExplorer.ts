// BUG #1 FIX: Correct fallback endpoints — use testnet, not shelbynet
export const SHELBY_EXPLORER_BASE =
  process.env.APTOS_NODE_URL ?? 
  "https://api.testnet.shelby.xyz/v1";

export const SHELBY_INDEXER_BASE =
  process.env.APTOS_INDEXER_URL ??
  "https://api.testnet.shelby.xyz/v1/graphql";

export const SHELBY_GATEWAY_BASE =
  process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN ??
  "https://api.testnet.shelby.xyz/shelby/v1/blobs";
