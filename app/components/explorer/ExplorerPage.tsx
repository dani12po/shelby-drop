"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SearchBox from "./SearchBox";
import WalletSearchController from "./WalletSearchController";

import PreviewModal from "@/components/modals/PreviewModal";
import ExplorerModal from "@/components/modals/explorermodals/ExplorerModal";
import UploadButton from "@/components/upload/UploadButton";
import UploadPanel from "@/components/upload/UploadPanel";

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
  /* ===============================
     CORE STATE
  ================================ */
  const [wallet, setWallet] = useState<string | null>(null);

  /* ===============================
     EXPLORER MODAL
  ================================ */
  const [explorerOpen, setExplorerOpen] =
    useState(false);

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
         EXPLORER MODAL (POPUP BOX)
      ================================ */}
      {explorerOpen && wallet && (
        <ExplorerModal
          open
          wallet={wallet}
          onClose={() => {
            // 🔥 THIS IS THE FIX
            setExplorerOpen(false);
            setWallet(null);          // ⬅️ RETURN TO SEARCH PAGE
          }}
        />
      )}

      {/* ===============================
         PREVIEW MODAL
      ================================ */}
      {previewFile && wallet && (
        <PreviewModal
          file={previewFile}
          wallet={wallet}
          onClose={() =>
            setPreviewFile(null)
          }
        />
      )}

      {/* ===============================
         WALLET SEARCH CONTROLLER
      ================================ */}
      <WalletSearchController
        wallet={searchWallet}
        onClose={() =>
          setSearchWallet(null)
        }
        onEnterExplorer={(wallet) => {
          // ✅ ENTER EXPLORER FLOW
          setWallet(wallet);
          setSearchWallet(null);

          requestAnimationFrame(() => {
            setExplorerOpen(true);
          });
        }}
      />
    </>
  );
}
