"use client";

import { useEffect, useState } from "react";
import ExplorerModal from "./modal/ExplorerModal";
import { useExplorerModalController } from "./core/useExplorerModalController";

export default function ExplorerModalRoot() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe: don't render anything on server
  if (!mounted) {
    return null;
  }

  const {
    open,
    wallet,
    initialFileId,
    initialPath,
    closeExplorer,
  } = useExplorerModalController();

  return (
    <ExplorerModal
      open={open}
      wallet={wallet ?? ""}
      initialFileId={initialFileId}
      initialPath={initialPath}
      onClose={closeExplorer}
    />
  );
}
