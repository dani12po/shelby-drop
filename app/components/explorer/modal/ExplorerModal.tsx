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
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              zIndex: 60,
              borderRadius: '28px',
              padding: '2px',
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL BODY */}
            <div style={{
              width: '1000px', maxWidth: '95vw',
              height: '75vh', maxHeight: '780px',
              minHeight: '500px',
              borderRadius: '26px',
              background: 'var(--bg-modal)',
              padding: '24px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* HEADER - CENTERED TITLE */}
              <div style={{ flexShrink: 0, marginBottom: '16px' }}>
                <div className="flex-1" /> {/* Left spacer */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">
                    Shelby Explorer
                  </h2>
                  <div className="text-sm text-white/60 truncate font-mono">
                    Files & Folders
                  </div>
                </div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={onClose}
                    style={{
                      width: '32px', height: '32px',
                      borderRadius: '8px', border: 'none',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#94a3b8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.color = '#94a3b8'
                    }}
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* ACTION BAR */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap',
                flexShrink: 0,
              }}>
                <ActionButton
                  icon={<Eye size={16} />}
                  label="View"
                  disabled={!primarySelectedFile}
                  onClick={() => {
                    const file = resolveFileByItem();
                    if (file) {
                      // Open preview in new window to avoid UI clutter
                      const previewUrl = getObjectUrl(file, {
                        wallet,
                        mode: "preview",
                      });
                      window.open(previewUrl, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
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
              <div style={{ flexShrink: 0, marginBottom: '12px' }}>
                <ExplorerBreadcrumb
                  path={path}
                  onNavigate={setPath}
                />
              </div>

              {/* MAIN CONTENT AREA */}
              <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                gap: '15px'
              }}>
                {/* FILE LIST - FULL WIDTH */}
                <div style={{
                  flex: 1,
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    overflowY: 'auto',
                    padding: '12px'
                  }}>
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '8px',
        border: `1px solid ${disabled
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(255,255,255,0.15)'}`,
        background: disabled
          ? 'transparent'
          : 'rgba(255,255,255,0.06)',
        color: disabled ? '#334155' : '#cbd5e1',
        fontSize: '0.8rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(139,92,246,0.15)'
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
          e.currentTarget.style.color = 'white'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
          e.currentTarget.style.color = '#cbd5e1'
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
