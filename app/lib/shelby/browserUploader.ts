/**
 * Browser-Side Shelby Upload
 *
 * Uses ShelbyClient from the browser SDK.
 * Upload happens in the user's browser — transaction signed by user's wallet.
 * clay.wasm runs in the browser, NOT on Vercel server → fixes the wasm issue entirely.
 *
 * Trade-offs vs server wallet:
 * ✓ File registered under user's own wallet address
 * ✓ No clay.wasm needed on server
 * ✓ User controls their own keys
 * ✗ User needs APT for gas fee
 * ✗ Extra wallet confirmation step
 */

import { Network } from "@aptos-labs/ts-sdk";

export interface BrowserUploadArgs {
  file: File;
  blobName: string;
  expirationMicros: number;
  signAndSubmitTransaction: (transaction: unknown) => Promise<{ hash: string }>;
  network?: "testnet" | "shelbynet";
  /** Optional API key override — if not provided, reads NEXT_PUBLIC_SHELBY_API_KEY */
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
      // Fallback: fetch from our own API endpoint (server has the key)
      throw new Error(
        "NEXT_PUBLIC_SHELBY_API_KEY is not configured. " +
        "Add it to your Vercel environment variables and redeploy."
      );
    }

    // Dynamically import browser SDK to avoid SSR issues
    // ShelbyClient (not ShelbyNodeClient) runs WASM in the browser
    const { ShelbyClient } = await import("@shelby-protocol/sdk");

    const sdkNetwork =
      args.network === "shelbynet" ? Network.SHELBYNET : Network.TESTNET;

    const shelbyClient = new ShelbyClient({
      network: sdkNetwork,
      apiKey,
    });

    const fileBuffer = await args.file.arrayBuffer();

    // This triggers the wallet popup for user confirmation
    const result = await shelbyClient.upload({
      blobData: new Uint8Array(fileBuffer),
      signer: {
        signAndSubmitTransaction: args.signAndSubmitTransaction,
      } as any,
      blobName: args.blobName,
      expirationMicros: args.expirationMicros,
    });

    const txHash =
      (result as any)?.hash ||
      (result as any)?.txHash ||
      "";

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
