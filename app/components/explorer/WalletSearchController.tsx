"use client";

import { useCallback } from "react";

import WalletSearchModal from "@/components/modals/WalletSearchModal";

import { useExplorerModalController } from "./core/useExplorerModalController";

/* ======================================================
   TYPES
====================================================== */

type Props = {
  wallet: string;
  onClose: () => void;
};

/* ======================================================
   COMPONENT
====================================================== */

export default function WalletSearchController({
  wallet,
  onClose,
}: Props) {
  const { openExplorer } = useExplorerModalController();

  const handleViewFile = useCallback((file: any) => {
    // For now, just open Explorer with the file selected
    // In the future, this could open a preview modal
    openExplorer({ wallet });
    onClose();
  }, [wallet, openExplorer, onClose]);

  return (
    <WalletSearchModal
      wallet={wallet}
      onClose={onClose}
      onViewFile={handleViewFile}
    />
  );
}
