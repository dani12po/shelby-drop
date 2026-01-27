"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import SearchBox from "./SearchBox";
import WalletSearchController from "./WalletSearchController";

import PreviewModal from "@/components/modals/PreviewModal";
import UploadButton from "@/components/upload/UploadButton";
import UploadPanel from "@/components/upload/UploadPanel";

import { useShareSystem } from "@/hooks/useShareSystem";
import { useExplorerModalController } from "./core/useExplorerModalController";

import type { FileItemData } from "@/lib/data";

/* ===============================
   ANIMATION (SEARCH PAGE)
================================ */
const searchMotion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
};

export default function ExplorerPage({
  connected,
}: {
  connected: boolean;
}) {
  const searchParams = useSearchParams();
  const { shareMapping, hasActiveShare } = useShareSystem();
  const { openExplorer } = useExplorerModalController();

  /* ===============================
     CORE STATE
  ================================ */
  const [wallet, setWallet] = useState<string | null>(null);

  /* ===============================
     PREVIEW MODAL
  ================================ */
  const [previewFile, setPreviewFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     UPLOAD
  ================================ */
  const [uploadOpen, setUploadOpen] =
    useState(false);
  const [currentPath] = useState<string[]>([]);

  /* ===============================
     HANDLE SHARED FILES
  ================================ */
  useEffect(() => {
    if (hasActiveShare && shareMapping) {
      // Auto-open Explorer with shared file
      setWallet(shareMapping.wallet);
      openExplorer({ 
        wallet: shareMapping.wallet,
        fileId: shareMapping.filename,
        path: []
      });
    }
  }, [hasActiveShare, shareMapping, openExplorer]);

  /* ===============================
     WALLET SEARCH CONTROLLER
  ================================ */
  const [searchWallet, setSearchWallet] =
    useState<string | null>(null);

  /* ===============================
     RENDER
  ================================ */
  return (
    <>
      {/* ===============================
         SEARCH PAGE (DEFAULT)
      ================================ */}
      <AnimatePresence mode="wait">
        {!wallet && (
          <motion.div
            key="search"
            {...searchMotion}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="
              flex flex-col
              items-center justify-center
              min-h-[70vh]
              text-center
            "
          >
            <h1 className="text-4xl md:text-5xl font-semibold">
              Shelby Drop
            </h1>

            <p className="mt-2 text-sm text-white/60 max-w-md">
              Download, upload, and share files using only your wallet.
            </p>

            <div className="mt-8">
              <SearchBox
                onSearch={(wallet) => {
                  // hard reset controller
                  setSearchWallet(null);
                  requestAnimationFrame(() => {
                    setSearchWallet(wallet);
                  });
                }}
              />
            </div>

            <div className="mt-6 flex gap-4">
              <UploadButton
                connected={connected}
                onUpload={() =>
                  setUploadOpen(true)
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===============================
         UPLOAD PANEL
      ================================ */}
      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {}}
        path={currentPath}
      />

      {/* ===============================
         PREVIEW MODAL
      ================================ */}
      {previewFile && wallet && (
        <PreviewModal
          file={previewFile}
          wallet={wallet}
          open={!!previewFile}
          onClose={() =>
            setPreviewFile(null)
          }
        />
      )}

      {/* ===============================
         WALLET SEARCH CONTROLLER
      ================================ */}
      {searchWallet && (
        <WalletSearchController
          wallet={searchWallet}
          onClose={() =>
            setSearchWallet(null)
          }
        />
      )}
    </>
  );
}
