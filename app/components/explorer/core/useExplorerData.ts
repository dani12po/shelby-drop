"use client";

import { useEffect, useState } from "react";
import type { ExplorerItem } from "@/types/explorer";
import type { FolderItem, FileItemData } from "@/lib/data";
import { loadWalletFilesFromShelby } from "../adapters/shelbyAdapter";

/* ===============================
   STATE
================================ */
type State = {
  loading: boolean;
  error: string | null;
  items: ExplorerItem[];
  rawItems: (FileItemData | FolderItem)[];
};

/* ===============================
   HOOK
================================ */
export function useExplorerData(
  wallet: string,
  path: string[],
  network?: string
) {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    items: [],
    rawItems: [],
  });

  /* ===============================
     🔄 AUTO REFRESH SIGNAL
  ================================ */
  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    const handler = () =>
      setRefreshKey((k) => k + 1);

    // SSR-safe: only use window APIs on client
    if (typeof window !== "undefined") {
      window.addEventListener(
        "explorer:refresh",
        handler
      );

      return () => {
        window.removeEventListener(
          "explorer:refresh",
          handler
        );
      };
    }
  }, []);

  /* ===============================
     DATA LOADER
  ================================ */
  useEffect(() => {
    /**
     * Wallet not connected → empty explorer
     */
    if (!wallet) {
      setState({
        loading: false,
        error: null,
        items: [],
        rawItems: [],
      });
      return;
    }

    let cancelled = false;

    async function load() {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        // Load files directly from Shelby Explorer
        const shelbyData = await loadWalletFilesFromShelby(wallet, network);
        
        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            items: shelbyData.items,
            rawItems: shelbyData.rawItems,
          });
        }
      } catch (err) {
        if (!cancelled) {
          // Log error for debugging but don't show to user
          console.warn("Could not load from Shelby Network:", err);
          // Show empty state instead of error
          setState({
            loading: false,
            error: null,
            items: [],
            rawItems: [],
          });
        }
      }
    }

    if (!cancelled) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [wallet, path, refreshKey, network]);

  return state;
}
