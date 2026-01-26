"use client";

import { motion } from "framer-motion";
import { X, Download, Link } from "lucide-react";
import type { FileItemData } from "@/lib/data";
import { buildShelbyDownloadUrl } from "@/lib/shelbyDownload";

/* ===============================
   PROPS
================================ */
type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
};

/* ===============================
   COMPONENT
================================ */
export default function MetadataPanel({
  file,
  wallet,
  onClose,
}: Props) {
  const downloadUrl = buildShelbyDownloadUrl(
    wallet,
    file
  );

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex justify-end bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="h-full pr-6 flex items-center"
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* GRADIENT BORDER */}
        <div
          className="rounded-[22px] p-[2px]"
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
          {/* PANEL */}
          <div
            className="
              w-[360px] max-w-[92vw]
              h-[88vh]
              rounded-[22px]
              bg-[#0b0f14]/95
              backdrop-blur-xl
              shadow-[0_30px_90px_rgba(0,0,0,0.7)]
              flex flex-col
            "
          >
            {/* HEADER */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-white/10">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">
                  File metadata
                </h2>
                <p className="text-[11px] text-white/50 break-all">
                  {file.name}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10"
                aria-label="Close metadata panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
              <Meta
                label="Uploader"
                value={file.uploader || "Unknown"}
              />

              <Meta
                label="Blob ID"
                value={file.blobId || "N/A"}
              />

              <Meta
                label="Type"
                value={file.fileType || "OTHER"}
              />

              <Meta
                label="Size"
                value={
                  file.size
                    ? `${(
                        file.size / 1024
                      ).toFixed(2)} KB`
                    : "—"
                }
              />
            </div>

            {/* ACTIONS */}
            <div className="px-5 py-4 border-t border-white/10 space-y-2">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center gap-2
                  w-full py-2 rounded-full
                  bg-purple-500/20
                  border border-purple-400/40
                  hover:bg-purple-500/30
                  text-sm
                "
              >
                <Download size={14} />
                Download
              </a>

              <button
                onClick={() => {
                  // SSR-safe: only use navigator APIs on client
                  if (typeof window !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(
                      downloadUrl
                    );
                  }
                }}
                className="
                  flex items-center justify-center gap-2
                  w-full py-2 rounded-full
                  bg-white/10
                  hover:bg-white/20
                  text-sm
                "
              >
                <Link size={14} />
                Copy download link
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===============================
   META ROW
================================ */
function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-white/40 mb-1">
        {label}
      </div>
      <div className="text-white/90 break-all">
        {value}
      </div>
    </div>
  );
}
