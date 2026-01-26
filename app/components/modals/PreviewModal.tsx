"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FileItemData } from "@/lib/data";
import { previewRegistry } from "@/components/explorer/preview/PreviewRegistry";
import { RenderResult } from "@/components/explorer/context-menu/types";
import { getRetentionStatus } from "@/lib/retention";
import MediaPreview from "@/components/explorer/preview/MediaPreview";

/* ===============================
   PROPS
================================ */
type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
  open: boolean;
};

/* ===============================
   HELPERS
================================ */
function getExt(name: string): string {
  return "." + (name.split(".").pop()?.toLowerCase() ?? "");
}

function isBinary(ext: string) {
  return [".mp3", ".wav", ".ogg", ".mp4", ".webm"].includes(ext);
}

/* ===============================
   COMPONENT
================================ */
export default function PreviewModal({
  file,
  wallet,
  onClose,
  open,
}: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe: don't render anything on server
  if (!mounted) {
    return null;
  }

  const filePath = [...file.path, file.name];
  const ext = getExt(file.name);

  /* ===============================
     RETENTION (ONLY HERE)
  ================================ */
  const retention = getRetentionStatus(file.expiresAt);
  const isExpired = retention.state === "expired";

  /* ===============================
     STATE
  ================================ */
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [result, setResult] = useState<RenderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] =
    useState<"preview" | "raw" | "tree">("preview");

  /* ===============================
     FETCH SIGNED URL
  ================================ */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const key = `${wallet}/${filePath.join("/")}`;
        const res = await fetch(
          `/api/files/signed?wallet=${wallet}&key=${encodeURIComponent(
            key
          )}`
        );

        if (!res.ok) {
          throw new Error("Failed to get signed URL");
        }

        const data = await res.json();
        if (active) {
          setSignedUrl(data.url);
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load file"
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [wallet, filePath.join("/")]);

  /* ===============================
     FETCH TEXT CONTENT (NON-BINARY)
  ================================ */
  useEffect(() => {
    if (!signedUrl || isBinary(ext)) return;

    let active = true;

    (async () => {
      try {
        const res = await fetch(signedUrl);
        const text = await res.text();
        if (!active) return;

        setContent(text);

        const rendered = await previewRegistry.render(text, {
          path: filePath.join("/"),
          ext,
          meta: { wallet },
        });

        setResult(rendered);
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load preview"
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [signedUrl, ext, wallet]);

  /* ===============================
     DOWNLOAD
  ================================ */
  function handleDownload() {
    if (!signedUrl || isExpired) return;
    window.open(signedUrl, "_blank");
  }

  /* ===============================
     RENDER
  ================================ */
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {file && (
        <>
          {/* BACKDROP */}
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL BODY */}
            <div className="bg-[#0b0f14] border border-white/10 rounded-[26px] p-6 w-full max-w-4xl space-y-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium">
              {file.name}
            </h3>
            <div className="text-xs text-white/50 truncate">
              {wallet}
              {file.path.map((p) => (
                <span key={p}> / {p}</span>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* ================= META ================= */}
        <div className="flex gap-6 text-xs text-white/50">
          <span>Size: {file.size}</span>
          <span>Uploader: {file.uploader}</span>

          {retention.state === "active" && (
            <span className="text-yellow-400">
              ⏳ {retention.label}
            </span>
          )}

          {retention.state === "expired" && (
            <span className="text-red-500">
              EXPIRED
            </span>
          )}
        </div>

        {/* ================= PREVIEW ================= */}
        <div className="bg-black/40 rounded-2xl p-4">
          {error ? (
            <p className="text-sm text-red-400">
              {error}
            </p>
          ) : signedUrl ? (
            <MediaPreview
              src={signedUrl}
              ext={ext}
              filename={file.name}
              content={content ?? undefined}
              result={result ?? undefined}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
            />
          ) : (
            <p className="text-sm text-white/50">
              Loading preview…
            </p>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end">
          <button
            onClick={handleDownload}
            disabled={!signedUrl || isExpired}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition ${
              isExpired || !signedUrl
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-white text-black hover:opacity-90"
            }`}
          >
            {isExpired ? "Expired" : "Download"}
          </button>
        </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
