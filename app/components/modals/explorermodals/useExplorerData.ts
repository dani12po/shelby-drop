"use client";

import { useEffect, useState } from "react";
import type { ExplorerItem } from "./ExplorerFileRowAdapter";

/* ===============================
   STATE
================================ */
type State = {
  loading: boolean;
  error: string | null;
  items: ExplorerItem[];
};

/* ===============================
   HOOK
================================ */
export function useExplorerData(
  wallet: string,
  path: string[]
) {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    items: [],
  });

  useEffect(() => {
    if (!wallet) return;

    let cancelled = false;

    async function load() {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        /* ===============================
           BUILD QUERY
           - path kosong = root
        ================================ */
        const query = new URLSearchParams({
          wallet,
        });

        if (path.length > 0) {
          query.set("path", path.join("/"));
        }

        const res = await fetch(
          `/api/shelby/list?${query.toString()}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error(
            `Shelby list failed (${res.status})`
          );
        }

        const items: ExplorerItem[] = await res.json();

        if (cancelled) return;

        setState({
          loading: false,
          error: null,
          items,
        });
      } catch (err) {
        if (cancelled) return;

        setState({
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to load explorer data",
          items: [],
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [wallet, path.join("/")]);

  return state;
}
