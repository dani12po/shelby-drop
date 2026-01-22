"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Explorer from "./Explorer";
import SearchBox from "./SearchBox";
import PreviewModal from "@/components/modals/PreviewModal";
import ShareModal from "@/components/modals/ShareModal";

import type {
  FolderItem,
  FileItemData,
} from "@/lib/data";

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
   ANIMATION PRESETS
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
  const [wallet, setWallet] = useState<
    string | null
  >(null);

  const [root] =
    useState<FolderItem>(EMPTY_ROOT);

  const [previewFile, setPreviewFile] =
    useState<FileItemData | null>(null);

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const mode: "search" | "explorer" =
    wallet ? "explorer" : "search";

  return (
    <>
      <AnimatePresence mode="wait">
        {/* ============================
            SEARCH LANDING
        ============================ */}
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
            {/* TITLE */}
            <h1 className="text-4xl md:text-5xl font-semibold">
              Shelby Drop
            </h1>

            {/* SUBTITLE */}
            <p className="mt-2 text-sm text-white/60 max-w-md">
              Download, upload, and share files
              using only your wallet.
            </p>

            {/* SEARCH BOX */}
            <div className="mt-8">
              <SearchBox
                onSearch={(w) =>
                  setWallet(w)
                }
              />
            </div>

            {/* UPLOAD BUTTON */}
            {connected ? (
              <button
                onClick={() =>
                  setUploadOpen(true)
                }
                className="
                  mt-[20px]
                  px-4 py-2 rounded-lg
                  bg-blue-600 hover:bg-blue-500
                  text-sm font-medium
                "
              >
                Upload
              </button>
            ) : (
              <p className="mt-[20px] text-xs text-gray-400">
                Connect wallet to upload files
              </p>
            )}
          </motion.div>
        )}

        {/* ============================
            EXPLORER
        ============================ */}
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
              onOpenFolder={() => {}}
              onBreadcrumbClick={() => {}}
              onPreview={setPreviewFile}
              onMeta={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      {previewFile && wallet && (
        <PreviewModal
          file={previewFile}
          wallet={wallet}
          onClose={() =>
            setPreviewFile(null)
          }
        />
      )}

      {/* UPLOAD MODAL */}
      {uploadOpen && (
        <ShareModal
          url="https://example.com"
          onClose={() =>
            setUploadOpen(false)
          }
        />
      )}
    </>
  );
}
