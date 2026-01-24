"use client";

import type { FileItemData } from "@/lib/data";
import { getRetentionStatus } from "@/lib/retention";

/* ===============================
   PROPS
================================ */
type Props = {
  x: number;
  y: number;
  files: FileItemData[];
  onClose: () => void;

  onPreviewAll: () => void;
  onDownloadAll: () => void;
  onClearSelection: () => void;
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerBulkContextMenu({
  x,
  y,
  files,
  onClose,
  onPreviewAll,
  onDownloadAll,
  onClearSelection,
}: Props) {
  const activeFiles = files.filter(
    (f) =>
      getRetentionStatus(f.expiresAt).state !==
      "expired"
  );

  const hasActiveFiles = activeFiles.length > 0;

  function itemClass(disabled?: boolean) {
    return `
      w-full px-4 py-2 text-left text-sm
      transition
      ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/10"
      }
    `;
  }

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className="
        fixed z-[10000]
        min-w-[220px]
        rounded-xl
        bg-[#0b0f14]
        border border-white/10
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        py-1
      "
      style={{ top: y, left: x }}
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* HEADER */}
      <div className="px-4 py-1 text-xs text-white/50">
        {files.length} items selected
      </div>

      {/* PREVIEW ALL */}
      <button
        disabled={!hasActiveFiles}
        className={itemClass(!hasActiveFiles)}
        onClick={(e) => {
          stop(e);
          if (!hasActiveFiles) return;
          onPreviewAll();
          onClose();
        }}
      >
        Preview all
      </button>

      {/* DOWNLOAD ALL */}
      <button
        disabled={!hasActiveFiles}
        className={itemClass(!hasActiveFiles)}
        onClick={(e) => {
          stop(e);
          if (!hasActiveFiles) return;
          onDownloadAll();
          onClose();
        }}
      >
        Download all
      </button>

      <div className="my-1 border-t border-white/10" />

      {/* CLEAR SELECTION */}
      <button
        className={itemClass()}
        onClick={(e) => {
          stop(e);
          onClearSelection();
          onClose();
        }}
      >
        Clear selection
      </button>

      {/* RETENTION INFO */}
      {activeFiles.length !== files.length && (
        <div className="px-4 pt-1 pb-1 text-[11px] text-white/40">
          Some files are expired and skipped
        </div>
      )}
    </div>
  );
}
