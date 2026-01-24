"use client";

import type { FileItemData, FolderItem } from "@/lib/data";
import { getRetentionStatus } from "@/lib/retention";

/* ===============================
   TYPES
================================ */
export type ContextTarget =
  | {
      type: "file";
      data: FileItemData;
    }
  | {
      type: "folder";
      data: FolderItem;
    };

type Props = {
  x: number;
  y: number;
  target: ContextTarget;
  onClose: () => void;

  onOpenFolder: (folder: FolderItem) => void;
  onPreview: (file: FileItemData) => void;
  onDownload: (file: FileItemData) => void;
  onMeta: (file: FileItemData) => void;
};

/* ===============================
   COMPONENT
================================ */
export default function ExplorerItemContextMenu({
  x,
  y,
  target,
  onClose,
  onOpenFolder,
  onPreview,
  onDownload,
  onMeta,
}: Props) {
  const retention =
    target.type === "file"
      ? getRetentionStatus(target.data.expiresAt)
      : null;

  const isExpired = retention?.state === "expired";

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
        min-w-[200px]
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
      {/* ===========================
          FOLDER
      ============================ */}
      {target.type === "folder" && (
        <button
          className={itemClass()}
          onClick={(e) => {
            stop(e);
            onOpenFolder(target.data);
            onClose();
          }}
        >
          Open
        </button>
      )}

      {/* ===========================
          FILE
      ============================ */}
      {target.type === "file" && (
        <>
          <button
            disabled={isExpired}
            className={itemClass(isExpired)}
            onClick={(e) => {
              stop(e);
              if (isExpired) return;
              onPreview(target.data);
              onClose();
            }}
          >
            Preview
          </button>

          <button
            disabled={isExpired}
            className={itemClass(isExpired)}
            onClick={(e) => {
              stop(e);
              if (isExpired) return;
              onDownload(target.data);
              onClose();
            }}
          >
            Download
          </button>

          <div className="my-1 border-t border-white/10" />

          <button
            className={itemClass()}
            onClick={(e) => {
              stop(e);
              onMeta(target.data);
              onClose();
            }}
          >
            Details
          </button>

          {/* RETENTION INFO */}
          {retention && (
            <div className="px-4 pt-1 pb-1 text-[11px] text-white/50">
              {retention.state === "active" && (
                <>Expires {retention.label}</>
              )}
              {retention.state === "expired" && (
                <span className="text-red-400">
                  File expired
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
