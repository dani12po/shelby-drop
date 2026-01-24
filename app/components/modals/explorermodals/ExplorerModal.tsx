"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import ExplorerList from "./ExplorerList";
import ExplorerBreadcrumb from "./ExplorerBreadcrumb";
import ExplorerEmptyState from "./ExplorerEmptyState";
import { useExplorerData } from "./useExplorerData";

import ExplorerItemContextMenu, {
  ContextTarget,
} from "./ExplorerItemContextMenu";
import ExplorerBulkContextMenu from "./ExplorerBulkContextMenu";
import MetadataPanel from "@/components/upload/MetadataPanel";

import { bulkDownload } from "@/lib/download/bulkDownload";

import type { FolderItem, FileItemData } from "@/lib/data";
import type { ExplorerItem } from "./ExplorerFileRowAdapter";

/* ===============================
   PROPS
================================ */
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
     MOUNT GUARD (SAFE)
  ================================ */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
     ITEM CLICK (MULTI SELECT)
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
     CONTEXT MENU HANDLER
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

  /* ===============================
     BULK ACTIONS
  ================================ */
  function handlePreviewAll() {
    if (selectedFiles.length === 0) return;
    setMetaFile(selectedFiles[0]);
  }

  async function handleDownloadAll() {
    if (selectedFiles.length === 0) return;
    await bulkDownload(wallet, selectedFiles);
  }

  /* ===============================
     CONTEXT TARGET (TYPE SAFE)
  ================================ */
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              rounded-[28px] p-[2px]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div
              onClick={() => {
                clearSelection();
                setItemMenu(null);
                setBulkMenu(null);
              }}
              className="w-[92vw] max-w-6xl h-[85vh]
                rounded-[26px] bg-[#0b0f14]
                shadow-[0_30px_120px_rgba(0,0,0,0.7)]
                flex flex-col overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex justify-between px-6 py-4
                border-b border-white/10 bg-black/40">
                <div>
                  <h2 className="text-sm font-semibold">
                    Explorer
                  </h2>
                  <p className="text-xs text-white/50 truncate">
                    {wallet}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <ExplorerBreadcrumb
                path={path}
                onNavigate={setPath}
              />

              <div className="flex-1 overflow-y-auto">
                {loading && (
                  <div className="p-6 text-sm text-white/50">
                    Loading…
                  </div>
                )}

                {!loading && !error && items.length === 0 && (
                  <ExplorerEmptyState
                    isRoot={path.length === 0}
                  />
                )}

                {!loading && !error && (
                  <ExplorerList
                    wallet={wallet}
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
          </motion.div>

          {/* ITEM CONTEXT MENU */}
          {itemMenu && contextTarget && (
            <ExplorerItemContextMenu
              x={itemMenu.x}
              y={itemMenu.y}
              target={contextTarget}
              onClose={() => setItemMenu(null)}
              onOpenFolder={handleOpenFolder}
              onPreview={(f) => setMetaFile(f)}
              onDownload={() => {}}
              onMeta={(f) => setMetaFile(f)}
            />
          )}

          {/* BULK CONTEXT MENU */}
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

          {/* METADATA PANEL */}
          {metaFile && (
            <MetadataPanel
              file={metaFile}
              wallet={wallet}
              onClose={() => setMetaFile(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
