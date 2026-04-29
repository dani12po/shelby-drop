/**
 * Browser-Side Shelby Upload
 *
 * Uses ShelbyClient from the browser SDK.
 * Upload happens in the user's browser — transaction signed by user's wallet.
 * clay.wasm runs in the browser, NOT on Vercel server → fixes the wasm issue entirely.
 */

import { Network, AccountAddress } from "@aptos-labs/ts-sdk";

export interface BrowserUploadArgs {
  file: File;
  blobName: string;
  expirationMicros: number;
  /** The wallet's account address (hex string) */
  accountAddress: string;
  /** Wallet adapter's signAndSubmitTransaction function */
  signAndSubmitTransaction: (transaction: unknown) => Promise<{ hash: string }>;
  network?: "testnet" | "shelbynet";
  /** Optional API key override */
  apiKey?: string;
}

export interface BrowserUploadResult {
  success: boolean;
  txHash?: string;
  blobName?: string;
  uploadedAt?: string;
  error?: string;
}

/**
 * Creates a signer-compatible object that wraps the wallet adapter.
 * The Shelby SDK expects an Account object with accountAddress + signing methods.
 */
function createWalletSigner(
  address: string,
  signAndSubmitTransaction: (tx: unknown) => Promise<{ hash: string }>
) {
  const accountAddress = AccountAddress.fromString(address);

  return {
    accountAddress,
    // The SDK calls signer.signAndSubmitTransaction internally
    signAndSubmitTransaction: async (tx: unknown) => {
      const result = await signAndSubmitTransaction(tx);
      return result;
    },
    // Stub other Account methods the SDK might call
    publicKey: {
      toUint8Array: () => new Uint8Array(32),
      toString: () => address,
    },
    sign: async (data: Uint8Array) => ({ data }),
    signTransaction: async (tx: unknown) => tx,
    verifySignature: () => true,
  };
}

export async function uploadWithBrowserWallet(
  args: BrowserUploadArgs
): Promise<BrowserUploadResult> {
  try {
    const apiKey = args.apiKey || process.env.NEXT_PUBLIC_SHELBY_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Shelby API key is not configured. Contact support."
      );
    }

    const { ShelbyClient } = await import("@shelby-protocol/sdk/browser");

    const sdkNetwork =
      args.network === "shelbynet" ? Network.SHELBYNET : Network.TESTNET;

    const shelbyClient = new ShelbyClient({
      network: sdkNetwork,
      apiKey,
    });

    const fileBuffer = await args.file.arrayBuffer();
    const signer = createWalletSigner(
      args.accountAddress,
      args.signAndSubmitTransaction
    );

    // This triggers the wallet popup for user confirmation
    const result = await shelbyClient.upload({
      blobData: new Uint8Array(fileBuffer),
      signer: signer as any,
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
