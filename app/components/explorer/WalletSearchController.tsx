"use client";

import { useEffect } from "react";
import { useExplorerModalController } from "./core/useExplorerModalController";

type Props = {
  wallet: string;
  onClose: () => void;
};

/**
 * WalletSearchController
 *
 * Langsung buka ExplorerModal saat wallet di-search.
 * Tidak perlu WalletSearchModal sebagai perantara.
 */
export default function WalletSearchController({ wallet, onClose }: Props) {
  const { openExplorer } = useExplorerModalController();

  useEffect(() => {
    if (!wallet || wallet.length < 10) {
      onClose();
      return;
    }

    openExplorer({ wallet });
    // Tutup controller setelah buka explorer
    // (controller tidak render UI apapun)
    onClose();
  }, [wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tidak render apapun — hanya trigger openExplorer
  return null;
}
