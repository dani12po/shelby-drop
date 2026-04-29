"use client";

import { useEffect, useState } from "react";
import ExplorerModal from "./modal/ExplorerModal";
import ShareModal from "@/components/modals/share/ShareModal";
import { useExplorerModalController } from "./core/useExplorerModalController";

export default function ExplorerModalRoot() {
  const [mounted, setMounted] = useState(false);
  // shareUrl lives HERE — outside ExplorerModal — so ShareModal
  // survives when ExplorerModal closes
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const { open, wallet, initialFileId, initialPath, closeExplorer } =
    useExplorerModalController();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <>
      <ExplorerModal
        open={open}
        wallet={wallet ?? ""}
        initialFileId={initialFileId}
        initialPath={initialPath}
        onClose={closeExplorer}
        onShare={(url) => setShareUrl(url)}
      />

      {shareUrl && (
        <ShareModal
          url={shareUrl}
          onClose={() => setShareUrl(null)}
        />
      )}
    </>
  );
}
