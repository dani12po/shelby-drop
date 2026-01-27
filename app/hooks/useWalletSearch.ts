"use client";

import { useState } from "react";
import { searchWalletFiles, isValidWalletAddress, type ExplorerSearchResult } from "@/lib/shelby/explorerService";

export type WalletSearchState = "idle" | "loading" | "found" | "empty" | "error";

export function useWalletSearch() {
  const [state, setState] = useState<WalletSearchState>("idle");
  const [result, setResult] = useState<ExplorerSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchWallet = async (walletAddress: string) => {
    // Reset state
    setState("loading");
    setError(null);
    setResult(null);

    try {
      // Validate wallet address format
      if (!isValidWalletAddress(walletAddress)) {
        throw new Error("Invalid wallet address format. Please enter a valid Aptos address.");
      }

      // Search for files
      const searchResult = await searchWalletFiles(walletAddress);
      
      setResult(searchResult);
      
      if (searchResult.files.length === 0) {
        setState("empty");
      } else {
        setState("found");
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search wallet";
      setError(errorMessage);
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setError(null);
  };

  return {
    state,
    result,
    error,
    searchWallet,
    reset,
    isLoading: state === "loading",
    hasResults: state === "found" && result !== null,
    isEmpty: state === "empty",
    hasError: state === "error",
  };
}
