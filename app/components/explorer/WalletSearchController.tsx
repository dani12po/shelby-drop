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
  wallet: string | null; // ✅ ALLOW NULL
  onClose: () => void;
  onEnterExplorer: (wallet: string) => void; // ✅ CONTROLLER passes wallet
};

/* ===============================
   COMPONENT
================================ */
export default function WalletSearchController({
  wallet,
  onClose,
  onEnterExplorer,
}: Props) {
  const [state, setState] =
    useState<WalletModalState | null>(null);

  const abortRef = useRef(false);

  /* ===============================
     EFFECT
  ================================ */
  useEffect(() => {
    if (!wallet) {
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
     RENDER MODAL
  ================================ */
  return (
    <WalletSearchModal
      wallet={wallet}
      state={state}
      onClose={() => {
        abortRef.current = true;
        setState(null);
        onClose();
      }}
      onEnterExplorer={
        state === "FOUND"
          ? () => {
              abortRef.current = true;
              setState(null);
              onEnterExplorer(wallet); // ✅ wallet injected here
            }
          : undefined
      }
    />
  );
}
