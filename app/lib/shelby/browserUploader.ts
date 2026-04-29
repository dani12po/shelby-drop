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
}

export interface BrowserUploadResult {
  success: boolean;
  txHash?: string;
  blobName?: string;
  uploadedAt?: string;
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

    const sdkNetwork =
      args.network === "shelbynet" ? Network.SHELBYNET : Network.TESTNET;

    // Dynamic import to avoid SSR issues
    const {
      ShelbyBlobClient,
      ShelbyRPCClient,
      generateCommitments,
      createDefaultErasureCodingProvider,
      SHELBY_DEPLOYER,
    } = await import("@shelby-protocol/sdk/browser");

    const fileBuffer = await args.file.arrayBuffer();
    const blobData = new Uint8Array(fileBuffer);

    // Step 1: Generate erasure coding commitments (runs WASM in browser)
    console.log("🔧 Generating commitments...");
    const erasureProvider = await createDefaultErasureCodingProvider();
    const commitments = await generateCommitments(erasureProvider, blobData);

    console.log("✅ Commitments generated:", {
      merkleRoot: commitments.blob_merkle_root,
      size: blobData.length,
      chunksets: commitments.chunkset_commitments.length,
    });

    // Step 2: Build the Move transaction payload (no signing needed)
    const accountAddr = AccountAddress.fromString(args.accountAddress);
    const payload = ShelbyBlobClient.createRegisterBlobPayload({
      deployer: AccountAddress.fromString(SHELBY_DEPLOYER),
      account: accountAddr,
      blobName: args.blobName,
      blobSize: blobData.length,
      blobMerkleRoot: commitments.blob_merkle_root,
      expirationMicros: args.expirationMicros,
      numChunksets: commitments.chunkset_commitments.length,
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
    // IMPORTANT: Use the Shelby network node, not standard Aptos testnet
    console.log("⏳ Waiting for L1 confirmation...");
    const { Aptos, AptosConfig, Network: AptosNetwork } = await import("@aptos-labs/ts-sdk");
    
    // Use the correct node URL for the network
    const nodeUrl = args.network === "shelbynet"
      ? "https://api.shelbynet.shelby.xyz/v1"
      : "https://api.testnet.aptoslabs.com/v1";
    
    const aptosConfig = new AptosConfig({
      network: AptosNetwork.CUSTOM,
      fullnode: nodeUrl,
    });
    const aptos = new Aptos(aptosConfig);
    
    await aptos.waitForTransaction({
      transactionHash: txHash,
      options: { timeoutSecs: 60 },
    });
    console.log("✅ Transaction confirmed on L1");

    // Step 4: Upload actual blob data to RPC storage nodes
    console.log("📤 Uploading blob data to storage nodes...");
    // Signal to UI that we're now uploading
    // (the signAndSubmitTransaction callback already set step to "confirming")
    const rpcClient = new ShelbyRPCClient({
      network: sdkNetwork,
      apiKey,
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
    };
  } catch (error) {
    console.error("[browserUploader] Upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
