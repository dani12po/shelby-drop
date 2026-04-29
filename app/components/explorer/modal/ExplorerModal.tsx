"use client";

import { Eye, Info, Download, Share2, X } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
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
import PreviewModal from "@/components/modals/PreviewModal";
import { useBulkDownloadController } from "@/lib/download/useBulkDownloadController";
import DownloadProgressPanel from "@/lib/download/DownloadProgressPanel";
import { buildShareUrl } from "@/lib/share/buildShareUrl";
import { useNotifications } from "@/components/notifications/useNotifications";
import type { FileItemData } from "@/lib/data";
import type { ExplorerItem } from "@/types/explorer";

/* ── Props ── */
type Props = {
  open: boolean;
  wallet: string;
  onClose: () => void;
  onShare?: (url: string) => void;
  initialFileId?: string | null;
  initialPath?: string[] | null;
};

/* ── Component ── */
export default function ExplorerModal({
  open, wallet, onClose, onShare, initialFileId, initialPath,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [path, setPath] = useState<string[]>([]);
  const { items, rawItems, loading, error } = useExplorerData(wallet, path);

  const [metaFile,    setMetaFile]    = useState<FileItemData | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItemData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [itemMenu, setItemMenu] = useState<{ x: number; y: number } | null>(null);
  const [bulkMenu, setBulkMenu] = useState<{ x: number; y: number } | null>(null);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { state: downloadState, start: startBulkDownload,
          cancel: cancelBulkDownload, retryFailed: retryBulkDownload } =
    useBulkDownloadController(wallet);

  const { notify } = useNotifications();

  /* initial open */
  useEffect(() => {
    if (!open) return;
    if (initialPath)  setPath(initialPath);
    if (initialFileId) setSelectedIds(new Set([initialFileId]));
  }, [open, initialFileId, initialPath]);

  /* auto scroll */
  useEffect(() => {
    if (!initialFileId) return;
    itemRefs.current[initialFileId]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [items, initialFileId]);

  /* selection helpers */
  const selectedFiles = useMemo<FileItemData[]>(
    () => rawItems.filter((i): i is FileItemData => i.type === "file" && selectedIds.has(i.id)),
    [rawItems, selectedIds]
  );
  const primarySelectedFile = selectedFiles[0] ?? null;

  function resolveFileByItem(item?: ExplorerItem): FileItemData | null {
    const id = item?.id ?? primarySelectedFile?.id;
    if (!id) return null;
    return rawItems.find((i): i is FileItemData => i.id === id && i.type === "file") ?? null;
  }

  /* item click */
  function handleItemClick(item: ExplorerItem, index: number, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (e.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end   = Math.max(lastSelectedIndex, index);
        for (let i = start; i <= end; i++) { const id = items[i]?.id; if (id) next.add(id); }
        return next;
      }
      if (e.metaKey || e.ctrlKey) {
        next.has(item.id) ? next.delete(item.id) : next.add(item.id);
        setLastSelectedIndex(index);
        return next;
      }
      next.clear(); next.add(item.id);
      setLastSelectedIndex(index);
      return next;
    });
  }

  /* context menu */
  function handleContextMenu(item: ExplorerItem, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (selectedIds.size > 1 && selectedIds.has(item.id)) {
      setBulkMenu({ x: e.clientX, y: e.clientY }); setItemMenu(null); return;
    }
    setItemMenu({ x: e.clientX, y: e.clientY }); setBulkMenu(null);
    if (!selectedIds.has(item.id)) setSelectedIds(new Set([item.id]));
  }

  const contextMenuCtx = itemMenu && getContextMenuContext({
    items: items.filter((i) => selectedIds.has(i.id)),
    permissions: resolveEffectivePermission("editor"),
  });

  /* actions */
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
    onShare?.(buildShareUrl(wallet, file.name));
  }

  function handleDownloadItem(item: ExplorerItem) {
    const file = resolveFileByItem(item);
    if (!file) return;
    const filePath = [...(file.path ?? []), file.name].filter(Boolean).join("/");
    const url = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}&download=1`;
    const a = document.createElement("a");
    a.href = url; a.download = file.name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function handleShareItem(item: ExplorerItem) {
    const file = resolveFileByItem(item);
    if (!file) return;
    onShare?.(buildShareUrl(wallet, file.name));
  }

  /* ── Render ── */
  return createPortal(
    <AnimatePresence>
      {open && mounted && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            style={{
              position: "fixed", top: "50%", left: "50%",
              x: "-50%", y: "-50%", zIndex: 60,
              borderRadius: "28px", padding: "2px",
              background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
              backgroundSize: "400% 100%", animation: "walletBorder 36s linear infinite",
            }}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: "1000px", maxWidth: "95vw",
              height: "75vh", maxHeight: "780px", minHeight: "500px",
              borderRadius: "26px", background: "var(--bg-modal)",
              padding: "24px", color: "white",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}>

              {/* Header */}
              <div style={{ flexShrink: 0, marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }} />
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Shelby Explorer</h2>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Files &amp; Folders</div>
                </div>
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={onClose}
                    style={{
                      width: "32px", height: "32px", borderRadius: "8px", border: "none",
                      background: "rgba(255,255,255,0.06)", color: "#94a3b8", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Action bar */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap", flexShrink: 0 }}>
                <ActionButton icon={<Eye size={16} />}      label="View"     disabled={!primarySelectedFile} onClick={() => { const f = resolveFileByItem(); if (f) setPreviewFile(f); }} />
                <ActionButton icon={<Info size={16} />}     label="Metadata" disabled={!primarySelectedFile} onClick={() => handleMeta()} />
                <ActionButton icon={<Download size={16} />} label="Download" disabled={!selectedFiles.length} onClick={handleDownload} />
                <ActionButton icon={<Share2 size={16} />}   label="Share"    disabled={!primarySelectedFile} onClick={handleShare} />
                <ActionButton icon={<X size={16} />}        label="Clear"    disabled={!selectedIds.size}    onClick={() => setSelectedIds(new Set())} />
              </div>

              {/* Breadcrumb */}
              <div style={{ flexShrink: 0, marginBottom: "12px" }}>
                <ExplorerBreadcrumb path={path} onNavigate={setPath} />
              </div>

              {/* File list */}
              <div style={{ flex: 1, minHeight: 0, borderRadius: "12px", background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                <div style={{ height: "100%", overflowY: "auto", padding: "12px" }}>
                  {loading && (
                    <div className="flex h-full items-center justify-center text-white/50 text-sm">Loading…</div>
                  )}
                  {!loading && error && (
                    <div className="flex h-full items-center justify-center text-white/40 text-sm">Error loading files</div>
                  )}
                  {!loading && !error && items.length === 0 && (
                    <div className="flex h-full items-center justify-center text-white/40 text-sm">No files found</div>
                  )}
                  {!loading && !error && items.length > 0 && (
                    <ExplorerList
                      items={items}
                      selectedIds={selectedIds}
                      onItemClick={handleItemClick}
                      onContextMenu={handleContextMenu}
                      onOpenFolder={(folder) => setPath((p) => [...p, folder.name])}
                      onMeta={handleMeta}
                      onDownload={handleDownloadItem}
                      onShare={handleShareItem}
                      onPreview={(item) => { const f = resolveFileByItem(item); if (f) setPreviewFile(f); }}
                      itemRefs={itemRefs}
                    />
                  )}
                </div>
              </div>

            </div>
          </motion.div>

          {/* Context menus */}
          {itemMenu && contextMenuCtx && (
            <ExplorerItemContextMenu x={itemMenu.x} y={itemMenu.y} ctx={contextMenuCtx} onClose={() => setItemMenu(null)} />
          )}
          {bulkMenu && contextMenuCtx && (
            <ExplorerBulkContextMenu x={bulkMenu.x} y={bulkMenu.y} ctx={contextMenuCtx} onClose={() => setBulkMenu(null)} />
          )}

          {/* Metadata modal */}
          {metaFile && (
            <MetadataModal file={metaFile} wallet={wallet} onClose={() => setMetaFile(null)} />
          )}

          {/* Preview modal */}
          {previewFile && (
            <PreviewModal
              file={previewFile}
              wallet={wallet}
              open={!!previewFile}
              onClose={() => setPreviewFile(null)}
              allFiles={rawItems.filter((i): i is FileItemData => i.type === "file")}
              onShare={(f) => onShare?.(buildShareUrl(wallet, f.name))}
            />
          )}

          {/* Download progress */}
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

/* ── ActionButton ── */
function ActionButton({ icon, label, onClick, disabled }: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={label}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 14px", borderRadius: "8px",
        border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.15)"}`,
        background: disabled ? "transparent" : "rgba(255,255,255,0.06)",
        color: disabled ? "#334155" : "#cbd5e1",
        fontSize: "0.8rem", fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(139,92,246,0.15)";
          e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = "#cbd5e1";
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
