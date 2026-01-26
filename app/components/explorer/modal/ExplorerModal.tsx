"use client";

import {
  Eye,
  Info,
  Download,
  Share2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import ExplorerList from "../list/ExplorerList";
import ExplorerBreadcrumb from "../breadcrumb/ExplorerBreadcrumb";
import { useExplorerData } from "../core/useExplorerData";

import ExplorerItemContextMenu from "../context-menu/ExplorerItemContextMenu";
import ExplorerBulkContextMenu from "../context-menu/ExplorerBulkContextMenu";

import { getContextMenuContext } from "../context-menu/getContextMenuContext";
import { resolveEffectivePermission } from "../context-menu/resolveEffectivePermission";

import MetadataModal from "@/components/modals/metadata/MetadataModal";

import {
  useBulkDownloadController,
} from "@/lib/download/useBulkDownloadController";
import DownloadProgressPanel from "@/lib/download/DownloadProgressPanel";

import { previewRegistry } from "@/components/explorer/preview/PreviewRegistry";
import PreviewResultRenderer from "@/components/explorer/preview/PreviewResultRenderer";
import type { RenderResult } from "@/components/explorer/preview/preview-types";

import { getObjectUrl } from "@/lib/s3/getObjectUrl";
import { useNotifications } from "@/components/notifications/useNotifications";

import type { FileItemData } from "@/lib/data";
import type { ExplorerItem } from "@/types/explorer";

/* ======================================================
   PROPS
====================================================== */

type Props = {
  open: boolean;
  wallet: string;
  onClose: () => void;

  /** optional – from WalletSearch */
  initialFileId?: string | null;
  initialPath?: string[] | null;
};

/* ======================================================
   COMPONENT
====================================================== */

export default function ExplorerModal({
  open,
  wallet,
  onClose,
  initialFileId,
  initialPath,
}: Props) {
  /* ===============================
     MOUNT
  ================================ */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* ===============================
     PATH
  ================================ */
  const [path, setPath] = useState<string[]>([]);

  /* ===============================
     DATA
  ================================ */
  const { items, rawItems, loading, error } =
    useExplorerData(wallet, path);

  /* ===============================
     METADATA (API DATA)
  ================================ */
  const [metaFile, setMetaFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     SELECTION (DOMAIN)
  ================================ */
  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] =
    useState<number | null>(null);

  /* ===============================
     SCROLL REFS
  ================================ */
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ===============================
     DOWNLOAD
  ================================ */
  const {
    state: downloadState,
    start: startBulkDownload,
    cancel: cancelBulkDownload,
    retryFailed: retryBulkDownload,
  } = useBulkDownloadController(wallet);

  const { notify } = useNotifications();

  /* ===============================
     INITIAL OPEN (WalletSearch)
  ================================ */
  useEffect(() => {
    if (!open) return;

    if (initialPath) {
      setPath(initialPath);
    }

    if (initialFileId) {
      setSelectedIds(new Set([initialFileId]));
    }
  }, [open, initialFileId, initialPath]);

  /* ===============================
     AUTO SCROLL
  ================================ */
  useEffect(() => {
    if (!initialFileId) return;

    const el = itemRefs.current[initialFileId];
    if (!el) return;

    el.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, [items, initialFileId]);

  /* ===============================
     SELECTION HELPERS
  ================================ */
  const selectedFiles = useMemo<FileItemData[]>(
    () =>
      rawItems.filter(
        (i): i is FileItemData =>
          i.type === "file" && selectedIds.has(i.id)
      ),
    [rawItems, selectedIds]
  );

  const primarySelectedFile =
    selectedFiles.length > 0
      ? selectedFiles[0]
      : null;

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
  const [itemMenu, setItemMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [bulkMenu, setBulkMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

    setItemMenu({ x: e.clientX, y: e.clientY });
    setBulkMenu(null);

    if (!selectedIds.has(item.id)) {
      setSelectedIds(new Set([item.id]));
    }
  }

  const contextMenuCtx =
    itemMenu &&
    getContextMenuContext({
      items: items.filter((i) => selectedIds.has(i.id)),
      permissions: resolveEffectivePermission("editor"),
    });

  /* ===============================
     ACTIONS (RESOLVE → API)
  ================================ */
  function resolveFileByItem(
    item?: ExplorerItem
  ): FileItemData | null {
    const id = item?.id ?? primarySelectedFile?.id;
    if (!id) return null;

    return (
      rawItems.find(
        (i): i is FileItemData =>
          i.id === id && i.type === "file"
      ) ?? null
    );
  }

  function handleMeta(item?: ExplorerItem) {
    const file = resolveFileByItem(item);
    if (file) setMetaFile(file);
  }

  function handleDownload() {
    if (!selectedFiles.length) return;
    startBulkDownload(selectedFiles);
  }

  function handleShare() {
    const file = resolveFileByItem();
    if (!file) return;

    // Generate signed URL for sharing
    const shareUrl = getObjectUrl(file, {
      wallet,
      mode: "signed",
      expiresIn: 86400, // 24 hours
    });

    // Copy to clipboard and show notification
    navigator.clipboard.writeText(shareUrl).then(() => {
      notify("success", "Share URL copied to clipboard!");
    }).catch(() => {
      notify("error", "Failed to copy share URL");
    });
  }

  function handleDownloadItem(item: ExplorerItem) {
    const file = resolveFileByItem(item);
    if (!file) return;

    const downloadUrl = getObjectUrl(file, {
      wallet,
      mode: "download",
    });

    // Trigger download
    window.open(downloadUrl, "_blank");
  }

  function handleShareItem(item: ExplorerItem) {
    const file = resolveFileByItem(item);
    if (!file) return;

    const shareUrl = getObjectUrl(file, {
      wallet,
      mode: "signed",
      expiresIn: 86400,
    });

    navigator.clipboard.writeText(shareUrl).then(() => {
      notify("success", "Share URL copied to clipboard!");
    }).catch(() => {
      notify("error", "Failed to copy share URL");
    });
  }

  /* ===============================
     RENDER
  ================================ */
  return createPortal(
    <AnimatePresence>
      {open && mounted && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* GRADIENT BORDER */}
          <motion.div
            className="
              fixed z-60
              top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              rounded-[28px]
              p-[2px]
            "
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL BODY */}
            <div className="w-[1100px] max-w-[95vw] h-[720px] max-h-[90vh] rounded-[26px] bg-[#0b0f14] shadow-[0_30px_120px_rgba(0,0,0,0.7)] p-[15px] text-white">
              {/* HEADER - CENTERED TITLE */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1" /> {/* Left spacer */}
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-white">
                    Shelby Explorer
                  </h2>
                  <div className="text-sm text-white/60 truncate">
                    {wallet}
                  </div>
                </div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white p-2 rounded-md hover:bg-white/10 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="flex justify-center gap-2 mb-4">
                <ActionButton
                  icon={<Eye size={16} />}
                  label="View"
                  disabled={!primarySelectedFile}
                  onClick={() => {
                    const file = resolveFileByItem();
                    if (file) {
                      // This will be handled by the PreviewModal state management
                      // For now, let's just open the preview in a new window
                      const previewUrl = getObjectUrl(file, {
                        wallet,
                        mode: "preview",
                      });
                      window.open(previewUrl, "_blank");
                    }
                  }}
                />
                <ActionButton
                  icon={<Info size={16} />}
                  label="Metadata"
                  disabled={!primarySelectedFile}
                  onClick={() => handleMeta()}
                />
                <ActionButton
                  icon={<Download size={16} />}
                  label="Download"
                  disabled={!selectedFiles.length}
                  onClick={handleDownload}
                />
                <ActionButton
                  icon={<Share2 size={16} />}
                  label="Share"
                  disabled={!primarySelectedFile}
                  onClick={() => handleShare()}
                />
                <ActionButton
                  icon={<X size={16} />}
                  label="Clear"
                  disabled={!selectedIds.size}
                  onClick={() => setSelectedIds(new Set())}
                />
              </div>

              {/* BREADCRUMB */}
              <div className="mb-4">
                <ExplorerBreadcrumb
                  path={path}
                  onNavigate={setPath}
                />
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex gap-[15px] flex-1 min-h-0">
                {/* FILE LIST - FULL WIDTH */}
                <div className="flex-1 rounded-xl bg-black/30 overflow-hidden">
                  <div className="flex-1 overflow-auto p-3">
                    {!loading && !error && (
                      <ExplorerList
                        items={items}
                        selectedIds={selectedIds}
                        onItemClick={handleItemClick}
                        onContextMenu={handleContextMenu}
                        onOpenFolder={(folder) =>
                          setPath((p) => [...p, folder.name])
                        }
                        onMeta={handleMeta}
                        onDownload={handleDownloadItem}
                        onShare={handleShareItem}
                        itemRefs={itemRefs}
                      />
                    )}

                    {loading && (
                      <div className="flex h-full items-center justify-center text-white/50 text-sm">
                        Loading…
                      </div>
                    )}

                    {!loading && error && (
                      <div className="flex h-full items-center justify-center text-white/40 text-sm">
                        Error loading files
                      </div>
                    )}

                    {!loading && !error && items.length === 0 && (
                      <div className="flex h-full items-center justify-center text-white/40 text-sm">
                        No files found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {itemMenu && contextMenuCtx && (
            <ExplorerItemContextMenu
              x={itemMenu.x}
              y={itemMenu.y}
              ctx={contextMenuCtx}
              onClose={() => setItemMenu(null)}
            />
          )}

          {bulkMenu && contextMenuCtx && (
            <ExplorerBulkContextMenu
              x={bulkMenu.x}
              y={bulkMenu.y}
              ctx={contextMenuCtx}
              onClose={() => setBulkMenu(null)}
            />
          )}

          {metaFile && (
            <MetadataModal
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

/* ======================================================
   UI
====================================================== */

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg border transition flex items-center justify-center
        ${
          disabled
            ? "border-white/10 text-white/30 cursor-not-allowed"
            : "border-white/20 text-white hover:bg-white/10"
        }`}
    >
      {icon}
    </button>
  );
}
