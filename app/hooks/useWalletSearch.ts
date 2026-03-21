"use client";

import { useState, useCallback } from "react";

export type WalletSearchState = "idle" | "loading" | "found" | "empty" | "error";

export type SearchFile = {
  id: string;
  name: string;
  size?: string;
  type?: string;
  blobId?: string;
  createdAt?: string;
};

export type SearchResult = {
  wallet: string;
  files: SearchFile[];
  total: number;
};

export function useWalletSearch() {
  const [state, setState] = useState<WalletSearchState>("idle");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchWallet = useCallback(async (walletAddress: string) => {
    setState("loading");
    setError(null);
    setResult(null);

    try {
      // Fetch dari API route kita sendiri
      const res = await fetch(
        `/api/shelby/list?wallet=${encodeURIComponent(walletAddress)}`
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch wallet files");
      }

      const data = await res.json();
      
      const searchResult: SearchResult = {
        wallet: walletAddress,
        files: (data.files || []).map((f: any) => ({
          id: f.id || f.blob_id || Math.random().toString(),
          name: f.name || "Unknown",
          size: f.size ? formatSize(f.size) : undefined,
          type: f.file_type?.toLowerCase() || "other",
          blobId: f.blob_id,
          createdAt: f.created_at,
        })),
        total: data.total || 0,
      };

      setResult(searchResult);
      setState(searchResult.files.length === 0 ? "empty" : "found");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    state, result, error, searchWallet, reset,
    isLoading: state === "loading",
    hasResults: state === "found",
    isEmpty: state === "empty",
    hasError: state === "error",
  };
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
