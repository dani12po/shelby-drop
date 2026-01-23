"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Explorer from "./Explorer";
import SearchBox from "./SearchBox";
import WalletSearchController from "./WalletSearchController";

import PreviewModal from "@/components/modals/PreviewModal";
import UploadButton from "@/components/upload/UploadButton";
import UploadPanel from "@/components/upload/UploadPanel";

import type { FolderItem, FileItemData } from "@/lib/data";

/* ===============================
   DUMMY ROOT
================================ */
const EMPTY_ROOT: FolderItem = {
  id: "root",
  type: "folder",
  name: "root",
  path: [],
  children: [],
};

/* ===============================
   ANIMATIONS
================================ */
const searchMotion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
};

const explorerMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerPage({
  connected,
}: {
  connected: boolean;
}) {
  /* ===============================
     CORE STATE
  ================================ */
  const [wallet, setWallet] = useState<string | null>(null);
  const [root, setRoot] = useState<FolderItem>(EMPTY_ROOT);

  const [previewFile, setPreviewFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     Upload (UI only)
  ================================ */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [currentPath, setCurrentPath] =
    useState<string[]>([]);

  /* ===============================
     Wallet Search (controller trigger only)
  ================================ */
  const [searchWallet, setSearchWallet] =
    useState<string | null>(null);

  /* ===============================
     Explorer navigation
  ================================ */
  const handleOpenFolder = (folder: FolderItem) => {
    setCurrentPath(folder.path);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath((prev) =>
      prev.slice(0, index + 1)
    );
  };

  /* ===============================
     FETCH EXPLORER TREE
     (single source of truth)
  ================================ */
  const fetchExplorerTree = async (
    activeWallet: string
  ) => {
    try {
      const res = await fetch(
        `/api/explorer?wallet=${activeWallet}`
      );
      if (!res.ok) return;

      const tree: FolderItem = await res.json();
      setRoot(tree);
    } catch (err) {
      console.error(
        "Failed to fetch explorer tree",
        err
      );
    }
  };

  useEffect(() => {
    if (!wallet) return;
    fetchExplorerTree(wallet);
  }, [wallet]);

  /* ===============================
     AFTER UPLOAD
  ================================ */
  const handleUploaded = () => {
    if (!wallet) return;
    fetchExplorerTree(wallet);
  };

  const mode: "search" | "explorer" =
    wallet ? "explorer" : "search";

  return (
    <>
      <AnimatePresence mode="wait">
        {mode === "search" && (
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
               setSearchWallet(null);
                requestAnimationFrame(() => {
                 setSearchWallet(wallet);
               });
              }}
             />
            </div>

            <div className="mt-6 h-[40px] flex items-center">
              <UploadButton
                connected={connected}
                onUpload={() =>
                  setUploadOpen(true)
                }
              />
            </div>
          </motion.div>
        )}

        {mode === "explorer" && (
          <motion.div
            key="explorer"
            {...explorerMotion}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="space-y-4"
          >
            <Explorer
               root={root}
              wallet={wallet!}
                 onOpenFolder={handleOpenFolder}
                   onBreadcrumbClick={handleBreadcrumbClick}
                onPreview={setPreviewFile}   // 🔥 INI PENTING
                onMeta={() => {}}
             />
          </motion.div>
        )}
      </AnimatePresence>

      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleUploaded}
        path={currentPath}
      />

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
         (isolated popup logic)
      ================================ */}
      <WalletSearchController
         wallet={searchWallet}
           onClose={() => setSearchWallet(null)}
           onEnterExplorer={(wallet: string) => {
          setWallet(wallet);
           setSearchWallet(null);
         }}
       />
    </>
  );
}
