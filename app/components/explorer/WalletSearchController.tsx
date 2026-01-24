"use client";

import { useEffect, useRef, useState } from "react";
import WalletSearchModal, {
  WalletModalState,
} from "@/components/modals/WalletSearchModal";
import type { FolderItem } from "@/lib/data";

/* ===============================
   PROPS
================================ */
type Props = {
  wallet: string | null; // allow null (controller inactive)
  onClose: () => void;
  onEnterExplorer: (wallet: string) => void;
};

/* ===============================
   COMPONENT
================================ */
export default function WalletSearchController({
  wallet,
  onClose,
  onEnterExplorer,
}: Props) {
  /* ===============================
     STATE MACHINE
  ================================ */
  const [state, setState] =
    useState<WalletModalState | null>(null);

  /* ===============================
     ABORT FLAG (SAFE ASYNC)
  ================================ */
  const abortRef = useRef(false);

  /* ===============================
     EFFECT — RESOLVE WALLET
  ================================ */
  useEffect(() => {
    // reset when wallet cleared
    if (!wallet) {
      abortRef.current = true;
      setState(null);
      return;
    }

    abortRef.current = false;
    setState("LOADING");

    (async () => {
      try {
        const res = await fetch(
          `/api/explorer?wallet=${wallet}`
        );

        if (abortRef.current) return;

        if (!res.ok) {
          setState("EMPTY");
          return;
        }

        const tree: FolderItem = await res.json();

        const hasFiles =
          Array.isArray(tree.children) &&
          tree.children.length > 0;

        setState(hasFiles ? "FOUND" : "EMPTY");
      } catch {
        if (!abortRef.current) {
          setState("EMPTY");
        }
      }
    })();

    return () => {
      abortRef.current = true;
    };
  }, [wallet]);

  /* ===============================
     HARD GUARD
  ================================ */
  if (!wallet || !state) return null;

  /* ===============================
     HANDLERS
  ================================ */
  const handleClose = () => {
    abortRef.current = true;
    setState(null);
    onClose();
  };

  const handleEnterExplorer =
    state === "FOUND"
      ? () => {
          abortRef.current = true;
          setState(null);
          onEnterExplorer(wallet);
        }
      : undefined;

  /* ===============================
     RENDER MODAL
  ================================ */
  return (
    <WalletSearchModal
      wallet={wallet}
      state={state}
      onClose={handleClose}
      onEnterExplorer={handleEnterExplorer}
    />
  );
}
