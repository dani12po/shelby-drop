"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Explorer from "./Explorer";
import SearchBox from "./SearchBox";
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
   HELPERS (PURE, DOMAIN-SAFE)
================================ */
function injectFileIntoTree(
  root: FolderItem,
  path: string[],
  file: FileItemData
): FolderItem {
  if (path.length === 0) {
    return {
      ...root,
      children: [...root.children, file],
    };
  }

  const [head, ...rest] = path;

  return {
    ...root,
    children: root.children.map((child) =>
      child.type === "folder" && child.name === head
        ? injectFileIntoTree(child, rest, file)
        : child
    ),
  };
}

function inferFileType(
  filename: string
): "PDF" | "IMG" | "OTHER" {
  const ext = filename
    .split(".")
    .pop()
    ?.toLowerCase();

  if (ext === "pdf") return "PDF";
  if (
    ext === "png" ||
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "webp" ||
    ext === "gif"
  ) {
    return "IMG";
  }

  return "OTHER";
}

/* ===============================
   COMPONENT
================================ */
export default function ExplorerPage({
  connected,
}: {
  connected: boolean;
}) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [root, setRoot] =
    useState<FolderItem>(EMPTY_ROOT);

  const [previewFile, setPreviewFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     Upload (UI only, SAFE)
  ================================ */
  const [uploadOpen, setUploadOpen] =
    useState(false);
  const [currentPath, setCurrentPath] =
    useState<string[]>([]);

  /* ===============================
     Explorer → Path adapters
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
     AUTO-REFRESH AFTER UPLOAD
  ================================ */
  const handleUploaded = (metadata: any) => {
    if (!wallet) return;

    const newFile: FileItemData = {
      id: metadata.hash,
      type: "file",
      name: metadata.originalName,
      size: metadata.size,
      path: currentPath,

      blobId: metadata.hash,
      fileType: inferFileType(
        metadata.originalName
      ),
      uploader: wallet,
    };

    setRoot((prev) =>
      injectFileIntoTree(
        prev,
        currentPath,
        newFile
      )
    );
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
              <SearchBox onSearch={setWallet} />
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
              onBreadcrumbClick={
                handleBreadcrumbClick
              }
              onPreview={setPreviewFile}
              onMeta={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleUploaded}
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
    </>
  );
}
