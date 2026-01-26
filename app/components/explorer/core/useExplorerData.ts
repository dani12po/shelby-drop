"use client";

import { useEffect, useState } from "react";
import type { ExplorerItem } from "@/types/explorer";
import type { FolderItem, FileItemData } from "@/lib/data";
import { adaptApiItemToExplorerItem } from "../adapters/apiToExplorerItem";

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
   INDEX METADATA SHAPE
   (source: public/uploads/<wallet>/index.json)
================================ */
type IndexedFile = {
  blob_name: string; // path relatif file
  size?: number;
  createdAt?: string;
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
        /**
         * Load index.json
         * public/uploads/<wallet>/index.json
         */
        const res = await fetch(
          `/uploads/${wallet}/index.json`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          if (!cancelled) {
            setState({
              loading: false,
              error: null,
              items: [],
              rawItems: [],
            });
          }
          return;
        }

        const indexedFiles: IndexedFile[] =
          await res.json();

        if (cancelled) return;

        /**
         * Virtual folder path
         * []      → root
         * ["a"]   → a/
         * ["a/b"] → a/b/
         */
        const currentPrefix =
          path.length > 0
            ? path.join("/") + "/"
            : "";

        /**
         * Files under current virtual folder
         */
        const visibleFiles = indexedFiles.filter(
          (file) =>
            file.blob_name.startsWith(
              currentPrefix
            )
        );

        /**
         * Build explorer items
         */
        const itemsMap =
          new Map<string, ExplorerItem>();
        const rawItemsMap =
          new Map<string, FileItemData | FolderItem>();

        for (const file of visibleFiles) {
          const rest = file.blob_name.slice(
            currentPrefix.length
          );

          if (!rest) continue;

          const [segment, ...remaining] =
            rest.split("/");

          /* ===============================
             FOLDER (virtual)
          ================================ */
          if (remaining.length > 0) {
            if (!itemsMap.has(segment)) {
              const folder: FolderItem = {
                id: [...path, segment].join("/"),
                name: segment,
                type: "folder",
                path: [...path, segment],
                children: [],
              };

              itemsMap.set(segment, adaptApiItemToExplorerItem(folder));
              rawItemsMap.set(segment, folder);
            }
          }

          /* ===============================
             FILE
          ================================ */
          else {
            const fileItem: FileItemData = {
              id: file.blob_name, // ← single source of truth
              blobId: file.blob_name,
              name: segment,
              type: "file",
              size:
                typeof file.size === "number"
                  ? file.size
                  : 0,
              path: [...path],
              uploader: wallet,
              uploadedAt: file.createdAt,
            };

            itemsMap.set(segment, adaptApiItemToExplorerItem(fileItem));
            rawItemsMap.set(segment, fileItem);
          }
        }

        setState({
          loading: false,
          error: null,
          items: Array.from(
            itemsMap.values()
          ),
          rawItems: Array.from(
            rawItemsMap.values()
          ),
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
          rawItems: [],
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    wallet,
    path.join("/"),
    refreshKey,
  ]);

  return state;
}
