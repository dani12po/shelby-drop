"use client";

import { useEffect, useState, useCallback } from "react";

import WalletSearchModal, {
  WalletModalState,
} from "@/components/modals/WalletSearchModal";

import { useExplorerModalController } from "./core/useExplorerModalController";

/* ======================================================
   TYPES
====================================================== */

type WalletFileItem = {
  id: string;
  name: string;
  path: string[];
};

/* ======================================================
   PROPS
====================================================== */

type Props = {
  wallet: string | null;
  onClose: () => void;
};

/* ======================================================
   COMPONENT
====================================================== */

export default function WalletSearchController({
  wallet,
  onClose,
}: Props) {
  const [state, setState] =
    useState<WalletModalState>("LOADING");

  const [files, setFiles] = useState<WalletFileItem[]>([]);

  const {
    openExplorer,
  } = useExplorerModalController();

  /* ===============================
     FETCH WALLET FILES
  ================================ */
  useEffect(() => {
    if (!wallet) return;

    let cancelled = false;

    async function load() {
      setState("LOADING");
      setFiles([]);

      try {
        const res = await fetch(
          `/api/explorer?wallet=${wallet}`
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        const onlyFiles: WalletFileItem[] =
          (data.items ?? [])
            .filter((item: any) => item.type === "file")
            .map((file: any) => ({
              id: file.id,
              name: file.name,
              path: file.path ?? [],
            }));

        if (cancelled) return;

        setFiles(onlyFiles);
        setState(
          onlyFiles.length ? "FOUND" : "EMPTY"
        );
      } catch {
        if (!cancelled) {
          setFiles([]);
          setState("EMPTY");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [wallet]);

  /* ===============================
     HANDLERS
  ================================ */

  const handleViewFile = useCallback(
    (file: WalletFileItem) => {
      if (!wallet) return;

      openExplorer({
        wallet,
        fileId: file.id,
        path: file.path,
      });
    },
    [wallet, openExplorer]
  );

  /* ===============================
     RENDER
  ================================ */

  if (!wallet) return null;

  return (
    <WalletSearchModal
      wallet={wallet}
      state={state}
      files={files}
      onClose={onClose}
      onViewFile={handleViewFile}
    />
  );
}
