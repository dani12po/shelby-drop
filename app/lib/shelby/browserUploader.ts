/**
 * Browser-Side Shelby Upload — Correct Implementation
 *
 * Uses the low-level Shelby SDK API to support browser wallet signing:
 * 1. generateCommitments() — compute erasure coding + merkle root (browser WASM)
 * 2. ShelbyBlobClient.createRegisterBlobPayload() — build Move tx payload (no signing needed)
 * 3. signAndSubmitTransaction(payload) — wallet signs + submits (shows Petra popup!)
 * 4. ShelbyRPCClient.putBlob() — upload actual data to storage nodes
 *
 * This bypasses the SDK's upload() method which requires a full Account object.
 */

import { Network, AccountAddress } from "@aptos-labs/ts-sdk";

export interface BrowserUploadArgs {
  file: File;
  blobName: string;
  expirationMicros: number;
  accountAddress: string;
  signAndSubmitTransaction: (transaction: unknown) => Promise<{ hash: string }>;
  network?: "testnet" | "shelbynet";
  apiKey?: string;
  origin?: string;
}

export interface BrowserUploadResult {
  success: boolean;
  txHash?: string;
  blobName?: string;
  uploadedAt?: string;
  /** The network where the transaction was actually confirmed */
  confirmedNetwork?: "testnet" | "shelbynet";
  error?: string;
}

export async function uploadWithBrowserWallet(
  args: BrowserUploadArgs
): Promise<BrowserUploadResult> {
  try {
    const apiKey = args.apiKey || process.env.NEXT_PUBLIC_SHELBY_API_KEY;
    if (!apiKey) {
      throw new Error("Shelby API key is not configured.");
    }

    // Dynamic import to avoid SSR issues
    const {
      ShelbyBlobClient,
      ShelbyRPCClient,
      generateCommitments,
      createDefaultErasureCodingProvider,
      expectedTotalChunksets,
    } = await import("@shelby-protocol/sdk/browser");

    // Step 1: Generate commitments (erasure coding + merkle root)
    console.log("📦 Generating commitments for:", args.file.name);
    const fileBuffer = await args.file.arrayBuffer();
    const blobData = new Uint8Array(fileBuffer);

    const erasureProvider = await createDefaultErasureCodingProvider();
    // Correct signature: generateCommitments(provider, data, onChunk?, options?)
    const commitments = await generateCommitments(erasureProvider, blobData);

    // Step 2: Build the registration payload
    console.log("🔨 Building registration payload...");
    
    const numChunksets = expectedTotalChunksets(blobData.length);
    const accountAddr = AccountAddress.fromString(args.accountAddress);

    // createRegisterBlobPayload is a STATIC method
    const payload = ShelbyBlobClient.createRegisterBlobPayload({
      account: accountAddr,
      blobName: args.blobName,
      blobSize: blobData.length,
      blobMerkleRoot: commitments.blob_merkle_root,
      expirationMicros: args.expirationMicros,
      numChunksets,
      encoding: 0, // default encoding
    });

    console.log("📝 Transaction payload built, requesting wallet signature...");

    // Step 3: Submit via wallet adapter — this triggers the Petra popup!
    const txResult = await args.signAndSubmitTransaction({
      data: payload,
    });

    const txHash = txResult.hash;
    console.log("✅ Transaction submitted:", txHash);

    // Step 3.5: Wait for transaction to be confirmed on L1
    // IMPORTANT: The wallet may be on a different network than the app's selected network.
    // Strategy: try the app's selected network first, then try the other one as fallback.
    // This handles the case where the wallet is on Shelbynet but the app shows Testnet.
    console.log("⏳ Waiting for L1 confirmation...");
    const { Aptos, AptosConfig, Network: AptosNetwork } = await import("@aptos-labs/ts-sdk");
    const { NETWORK_CONFIGS } = await import("@/config/shelby");

    const SHELBYNET_URL = NETWORK_CONFIGS.shelbynet.aptosNodeUrl;
    const TESTNET_URL   = NETWORK_CONFIGS.testnet.aptosNodeUrl;

    // Ordered list: try the app-selected network first, then the other
    const nodeUrls = args.network === "shelbynet"
      ? [SHELBYNET_URL, TESTNET_URL]
      : [TESTNET_URL, SHELBYNET_URL];

    let confirmed = false;
    let confirmedNetwork = args.network ?? "testnet";

    for (const nodeUrl of nodeUrls) {
      try {
        console.log(`⏳ Trying node: ${nodeUrl}`);
        const aptosConfig = new AptosConfig({
          network: AptosNetwork.CUSTOM,
          fullnode: nodeUrl,
        });
        const aptos = new Aptos(aptosConfig);
        await aptos.waitForTransaction({
          transactionHash: txHash,
          options: { timeoutSecs: 30 },
        });
        confirmedNetwork = nodeUrl.includes("shelbynet") ? "shelbynet" : "testnet";
        confirmed = true;
        console.log(`✅ Transaction confirmed on ${confirmedNetwork} (${nodeUrl})`);
        break;
      } catch {
        console.warn(`⚠️ Not found on ${nodeUrl}, trying next...`);
      }
    }

    if (!confirmed) {
      throw new Error(
        `Transaction ${txHash} not found on either network after 60s. ` +
        `Check: https://explorer.aptoslabs.com/txn/${txHash}`
      );
    }

    // Use the confirmed network for putBlob (override sdkNetwork if needed)
    const resolvedSdkNetwork = confirmedNetwork === "shelbynet"
      ? Network.SHELBYNET
      : Network.TESTNET;

    // Step 4: Upload actual blob data to RPC storage nodes
    console.log("📤 Uploading blob data to storage nodes...");

    // PROXY FIX: In development (localhost), the Shelby RPC server rejects requests with 401
    // because the browser's Origin header (localhost) doesn't match the API key's allowed origin.
    // We use a local proxy to override the Origin header.
    const isLocal = typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
       window.location.hostname === "127.0.0.1" ||
       window.location.hostname.startsWith("192.168.") ||
       window.location.hostname.startsWith("10."));
       
    const proxyNetwork = confirmedNetwork === "shelbynet" ? "shelbynet" : "testnet";
    // IMPORTANT: Must end with a slash so the SDK's URL joining works correctly
    const proxyBaseUrl = isLocal ? `${window.location.origin}/api/shelby/proxy/${proxyNetwork}/` : undefined;

    if (isLocal) {
      console.log("🛠️ Local development detected, using Shelby Proxy:", proxyBaseUrl);
    }

    const rpcClient = new ShelbyRPCClient({
      network: resolvedSdkNetwork,
      apiKey,
      // @ts-ignore - custom baseUrl to use our proxy in development
      rpc: proxyBaseUrl ? { baseUrl: proxyBaseUrl } : undefined,
    });

    await rpcClient.putBlob({
      account: args.accountAddress,
      blobName: args.blobName,
      blobData,
    });

    console.log("✅ Blob data uploaded to storage nodes");

    return {
      success: true,
      txHash,
      blobName: args.blobName,
      uploadedAt: new Date().toISOString(),
      confirmedNetwork: confirmedNetwork as "testnet" | "shelbynet",
    };
  } catch (error) {
    console.error("[browserUploader] Upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
