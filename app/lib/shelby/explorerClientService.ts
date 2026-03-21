/**
 * Client-Side Shelby Explorer Service
 * 
 * Service for fetching data from Shelby Explorer via API route
 * Avoids CORS issues by using server-side proxy
 */

import type { ExplorerFile, ExplorerSearchResult } from "./explorerService";

// Re-export types for convenience
export type { ExplorerFile, ExplorerSearchResult };

/**
 * Validates wallet address format (Aptos)
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address) return false;
  // Aptos addresses are 0x + 64 hex chars
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Formats bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Maps Shelby file type to explorer type
 */
function mapFileType(fileType?: string): string {
  const map: Record<string, string> = {
    PDF: 'document',
    IMG: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    TEXT: 'code',
    OTHER: 'file',
  };
  return map[fileType?.toUpperCase() || ''] || 'file';
}

/**
 * Fetches wallet files from Shelby Explorer via API route
 * Client-side version that calls our server proxy
 */
export async function searchWalletFilesClient(wallet: string): Promise<ExplorerSearchResult> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  try {
    console.log("🔍 CLIENT: Fetching wallet files via API route /api/shelby/list");
    
    const response = await fetch(`/api/shelby/list?wallet=${encodeURIComponent(wallet)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // /api/shelby/list returns { wallet, files, folders, total }
    // Map to ExplorerSearchResult format { files, total, wallet }
    const result: ExplorerSearchResult = {
      wallet: data.wallet,
      total: data.total || 0,
      files: (data.files || []).map((f: any) => ({
        name: f.name || 'Unknown',
        size: f.size
          ? typeof f.size === 'number'
            ? formatBytes(f.size)
            : f.size
          : undefined,
        type: mapFileType(f.file_type),
        url: undefined,
        modified: f.created_at,
      })),
    };

    console.log("✅ CLIENT: Wallet search successful", {
      fileCount: result.files.length,
      wallet: result.wallet,
    });

    return result;

  } catch (error) {
    console.error("❌ CLIENT: Wallet search failed:", error);
    throw error;
  }
}
