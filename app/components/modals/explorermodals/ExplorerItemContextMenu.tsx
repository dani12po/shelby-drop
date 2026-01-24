"use client";

import { motion } from "framer-motion";
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

  function stop(e: React.MouseEvent) {
    e.stopPropagation();
  }

  function itemClass(disabled?: boolean) {
    return `
      w-full text-left
      px-4 py-2
      text-sm
      transition
      ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/10"
      }
    `;
  }

  return (
    <motion.div
      className="fixed z-[10000]"
      style={{ top: y, left: x }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* GRADIENT BORDER */}
      <div
        className="rounded-xl p-[1px]"
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
          animation: "walletBorder 28s linear infinite",
        }}
      >
        {/* MENU */}
        <div
          className="
            min-w-[200px]
            rounded-xl
            bg-[#0b0f14]/95
            backdrop-blur-xl
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            py-1
          "
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

              <Divider />

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
                <div className="px-4 pt-1 pb-1 text-[11px]">
                  {retention.state === "active" && (
                    <span className="text-white/50">
                      Expires {retention.label}
                    </span>
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
      </div>
    </motion.div>
  );
}

/* ===============================
   SUB
================================ */
function Divider() {
  return (
    <div className="my-1 h-px bg-white/10" />
  );
}
