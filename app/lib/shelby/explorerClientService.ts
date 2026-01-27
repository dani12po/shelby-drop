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
 * Fetches wallet files from Shelby Explorer via API route
 * Client-side version that calls our server proxy
 */
export async function searchWalletFilesClient(wallet: string): Promise<ExplorerSearchResult> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  try {
    console.log("🔍 CLIENT: Fetching wallet files via API route");
    
    const response = await fetch(`/api/shelby/explorer?wallet=${encodeURIComponent(wallet)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    console.log("✅ CLIENT: Wallet search successful", {
      fileCount: result.data.files.length,
      wallet: result.data.wallet,
    });

    return result.data;

  } catch (error) {
    console.error("❌ CLIENT: Wallet search failed:", error);
    throw error;
  }
}
