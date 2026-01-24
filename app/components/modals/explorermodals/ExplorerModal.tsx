"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

import ExplorerList from "./ExplorerList";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import { useExplorerData } from "./useExplorerData";

import ExplorerItemContextMenu, {
  ContextTarget,
} from "./ExplorerItemContextMenu";
import ExplorerBulkContextMenu from "./ExplorerBulkContextMenu";
import MetadataPanel from "@/components/upload/MetadataPanel";

import {
  useBulkDownloadController,
} from "@/lib/download/useBulkDownloadController";
import DownloadProgressPanel from "@/lib/download/DownloadProgressPanel";

import type { FolderItem, FileItemData } from "@/lib/data";
import type { ExplorerItem } from "./ExplorerFileRowAdapter";

type Props = {
  open: boolean;
  wallet: string;
  onClose: () => void;
};

export default function ExplorerModal({
  open,
  wallet,
  onClose,
}: Props) {
  /* ===============================
     MOUNT GUARD
  ================================ */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ===============================
     DATA
  ================================ */
  const [path, setPath] = useState<string[]>([]);
  const { items, loading, error } =
    useExplorerData(wallet, path);

  /* ===============================
     METADATA
  ================================ */
  const [metaFile, setMetaFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     SELECTION
  ================================ */
  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] =
    useState<number | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  /* ===============================
     COPY WALLET
  ================================ */
  const [copied, setCopied] = useState(false);

  function handleCopyWallet() {
    navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  /* ===============================
     DOWNLOAD CONTROLLER
  ================================ */
  const {
    state: downloadState,
    start: startBulkDownload,
    cancel: cancelBulkDownload,
    retryFailed: retryBulkDownload,
  } = useBulkDownloadController(wallet);

  /* ===============================
     CONTEXT MENUS
  ================================ */
  const [itemMenu, setItemMenu] = useState<{
    x: number;
    y: number;
    target: ExplorerItem;
  } | null>(null);

  const [bulkMenu, setBulkMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  /* ===============================
     ITEM CLICK
  ================================ */
  function handleItemClick(
    item: ExplorerItem,
    index: number,
    e: React.MouseEvent
  ) {
    e.stopPropagation();

    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (e.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        for (let i = start; i <= end; i++) {
          const id = items[i]?.id;
          if (id) next.add(id);
        }
        return next;
      }

      if (e.metaKey || e.ctrlKey) {
        next.has(item.id)
          ? next.delete(item.id)
          : next.add(item.id);
        setLastSelectedIndex(index);
        return next;
      }

      next.clear();
      next.add(item.id);
      setLastSelectedIndex(index);
      return next;
    });
  }

  /* ===============================
     CONTEXT MENU
  ================================ */
  function handleContextMenu(
    item: ExplorerItem,
    e: React.MouseEvent
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (
      selectedIds.size > 1 &&
      selectedIds.has(item.id)
    ) {
      setBulkMenu({ x: e.clientX, y: e.clientY });
      setItemMenu(null);
      return;
    }

    setItemMenu({
      x: e.clientX,
      y: e.clientY,
      target: item,
    });
    setBulkMenu(null);

    if (!selectedIds.has(item.id)) {
      setSelectedIds(new Set([item.id]));
    }
  }

  /* ===============================
     RESET ON OPEN
  ================================ */
  useEffect(() => {
    if (!open) return;
    setPath([]);
    clearSelection();
    setMetaFile(null);
    setItemMenu(null);
    setBulkMenu(null);
  }, [open, clearSelection]);

  /* ===============================
     BODY SCROLL LOCK
  ================================ */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function handleOpenFolder(folder: FolderItem) {
    setPath((p) => [...p, folder.name]);
    clearSelection();
  }

  /* ===============================
     BULK DATA
  ================================ */
  const selectedFiles = items.filter(
    (i): i is FileItemData & { type: "file" } =>
      i.type === "file" &&
      selectedIds.has(i.id)
  );

  function handlePreviewAll() {
    if (selectedFiles.length === 0) return;
    setMetaFile(selectedFiles[0]);
  }

  function handleDownloadAll() {
    if (selectedFiles.length === 0) return;
    startBulkDownload(selectedFiles);
    setBulkMenu(null);
  }

  const contextTarget: ContextTarget | null =
    itemMenu?.target
      ? itemMenu.target.type === "file"
        ? { type: "file", data: itemMenu.target }
        : { type: "folder", data: itemMenu.target }
      : null;

  /* ===============================
     RENDER
  ================================ */
  return createPortal(
    <AnimatePresence>
      {open && mounted && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              rounded-[26px] p-[2px]"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              background: `
                linear-gradient(
                  90deg,
                  #7dd3fc,
                  #a78bfa,
                  #f472b6,
                  #34d399,
                  #fbbf24,
                  #60a5fa,
                  #a78bfa
                )
              `,
              backgroundSize: "400% 100%",
              animation: "walletBorder 36s linear infinite",
            }}
          >
            {/* INNER */}
            <div
              onClick={() => {
                clearSelection();
                setItemMenu(null);
                setBulkMenu(null);
              }}
              className="
                w-[92vw] max-w-6xl h-[85vh]
                rounded-[26px]
                bg-[#0b0f14]
                shadow-[0_25px_90px_rgba(0,0,0,0.65)]
                overflow-hidden
              "
            >
              <div className="flex flex-col h-full p-[15px] gap-[15px]">

                {/* HEADER */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-start">
                  <div />
                  <div className="text-center space-y-[8px]">
                    <h2 className="text-[30px] font-semibold tracking-tight">
                      Shelby Drop Explorer
                    </h2>

                    <button
                      onClick={handleCopyWallet}
                      className="
                        inline-flex items-center gap-2
                        text-[14px] text-white/60
                        hover:text-white transition
                        break-all
                      "
                    >
                      <span>{wallet}</span>
                      {copied ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="opacity-60" />
                      )}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-white/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* BREADCRUMB */}
                <ExplorerBreadcrumb
                  path={path}
                  onNavigate={setPath}
                />

                {/* BODY */}
                <div className="flex-1 rounded-[14px] bg-black/25 border border-white/10 overflow-hidden">
                  {loading && (
                    <div className="py-10 text-sm text-white/50 text-center">
                      Loading…
                    </div>
                  )}

                  {!loading && error && (
                    <div className="py-10 text-sm text-red-400 text-center">
                      {error}
                    </div>
                  )}

                  {!loading && !error && (
                    <ExplorerList
                      items={items}
                      selectedIds={selectedIds}
                      onItemClick={handleItemClick}
                      onContextMenu={handleContextMenu}
                      onOpenFolder={handleOpenFolder}
                      onPreview={() => {}}
                      onMeta={(f) => setMetaFile(f)}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CONTEXT MENUS */}
          {itemMenu && contextTarget && (
            <ExplorerItemContextMenu
              x={itemMenu.x}
              y={itemMenu.y}
              target={contextTarget}
              onClose={() => setItemMenu(null)}
              onOpenFolder={handleOpenFolder}
              onPreview={(f) => setMetaFile(f)}
              onDownload={(f) =>
                startBulkDownload([f])
              }
              onMeta={(f) => setMetaFile(f)}
            />
          )}

          {bulkMenu && (
            <ExplorerBulkContextMenu
              x={bulkMenu.x}
              y={bulkMenu.y}
              files={selectedFiles}
              onClose={() => setBulkMenu(null)}
              onPreviewAll={handlePreviewAll}
              onDownloadAll={handleDownloadAll}
              onClearSelection={clearSelection}
            />
          )}

          {metaFile && (
            <MetadataPanel
              file={metaFile}
              wallet={wallet}
              onClose={() => setMetaFile(null)}
            />
          )}

          <DownloadProgressPanel
            state={downloadState}
            onCancel={cancelBulkDownload}
            onRetry={retryBulkDownload}
          />
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
