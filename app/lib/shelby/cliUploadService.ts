/**
 * Shelby Upload Service (CLI-Compatible)
 * 
 * This service provides a unified interface for uploading files
 * using the CLI-compatible method that ensures proper Explorer indexing.
 */

import type { UploadMetadata } from "../uploadService";

export type CliUploadArgs = {
  file: File;
  wallet: string;
  blobName?: string;
  retentionDays?: number;
};

export type CliUploadResult = {
  success: boolean;
  data?: {
    blobName: string;
    txHash: string;
    uploadedAt: string;
    userWallet: string;
    retentionDays: number;
    expiresAt: string;
    explorerUrls: {
      aptos: string;
      shelby: string;
    };
  };
  error?: string;
  message?: string;
};

/**
 * Upload file using CLI-compatible method
 * This ensures the file is properly registered in Shelby Explorer
 */
export async function uploadToShelbyCli({
  file,
  wallet,
  blobName,
  retentionDays = 7,
}: CliUploadArgs): Promise<CliUploadResult> {
  try {
    // Generate blob name if not provided (use original filename)
    const finalBlobName = blobName || `files/${file.name}`;
    
    // Create form data for CLI-compatible upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("blobName", finalBlobName);
    formData.append("wallet", wallet);
    formData.append("retentionDays", String(retentionDays));

    // Call CLI-compatible upload endpoint
    const response = await fetch("/api/upload/cli", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Upload failed",
        message: result.message || "Upload request failed",
      };
    }

    return result as CliUploadResult;

  } catch (error) {
    console.error("CLI Upload Service Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to upload file to Shelby network",
    };
  }
}

/**
 * Convert CLI upload result to legacy UploadMetadata format
 * This maintains compatibility with existing UI components
 */
export function cliResultToMetadata(
  result: CliUploadResult,
  originalFile: File,
  wallet: string
): UploadMetadata | null {
  if (!result.success || !result.data) {
    return null;
  }

  const { data } = result;
  
  return {
    wallet,
    originalName: originalFile.name,
    storedName: originalFile.name, // CLI uses original name
    blob_name: data.blobName,
    size: originalFile.size,
    mime: originalFile.type,
    hash: "", // CLI doesn't provide hash in response
    retentionDays: data.retentionDays,
    expiresAt: data.expiresAt,
    uploadedAt: data.uploadedAt,
  };
}

/**
 * Check if upload is using CLI-compatible method
 * This helps with tracking and debugging
 */
export function isCliCompatibleUpload(metadata: UploadMetadata): boolean {
  // CLI uploads typically use the "files/" prefix
  return metadata.blob_name.startsWith("files/");
}

/**
 * Get Explorer URL for uploaded file
 */
export function getExplorerUrl(wallet: string, blobName: string): string {
  return `https://explorer.shelby.xyz/shelbynet/account/${wallet}`;
}

/**
 * Get Aptos transaction URL
 */
export function getAptosExplorerUrl(txHash: string): string {
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=shelbynet`;
}
