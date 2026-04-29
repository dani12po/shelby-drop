"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Clock, AlertCircle,
  ChevronLeft, ChevronRight,
  FileText, Image as ImageIcon, Video, Music, File,
  Share2,
} from "lucide-react";
import { FileItemData } from "@/lib/data";
import { getRetentionStatus } from "@/lib/retention";

/* ── types ── */
type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
  open: boolean;
  /** All files in the current folder for prev/next navigation */
  allFiles?: FileItemData[];
  onShare?: (file: FileItemData) => void;
};

/* ── helpers ── */
function getExt(name: string) {
  return "." + (name.split(".").pop()?.toLowerCase() ?? "");
}

function getMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    avi: "video/x-msvideo", mkv: "video/x-matroska",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    flac: "audio/flac", aac: "audio/aac",
    pdf: "application/pdf",
    txt: "text/plain", md: "text/markdown",
    json: "application/json", js: "text/javascript",
    ts: "text/typescript", css: "text/css", html: "text/html",
    xml: "text/xml", csv: "text/csv",
  };
  return map[ext] || "application/octet-stream";
}

function FileTypeIcon({ name, size = 20 }: { name: string; size?: number }) {
  const mime = getMime(name);
  if (mime.startsWith("image/"))  return <ImageIcon size={size} style={{ color: "#a78bfa" }} />;
  if (mime.startsWith("video/"))  return <Video     size={size} style={{ color: "#f472b6" }} />;
  if (mime.startsWith("audio/"))  return <Music     size={size} style={{ color: "#34d399" }} />;
  if (mime === "application/pdf") return <FileText  size={size} style={{ color: "#f87171" }} />;
  if (mime.startsWith("text/"))   return <FileText  size={size} style={{ color: "#60a5fa" }} />;
  return <File size={size} style={{ color: "#94a3b8" }} />;
}

function formatSize(bytes: number | string): string {
  const n = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (!n || isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── preview renderer ── */
function PreviewContent({ url, name }: { url: string; name: string }) {
  const mime = getMime(name);
  const [text, setText] = useState<string | null>(null);
  const [textErr, setTextErr] = useState(false);

  useEffect(() => {
    if (!mime.startsWith("text/") && mime !== "application/json") return;
    setText(null);
    setTextErr(false);
    fetch(url)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setTextErr(true));
  }, [url, mime]);

  /* IMAGE */
  if (mime.startsWith("image/")) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "16px" }}>
        <img
          src={url}
          alt={name}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }}
        />
      </div>
    );
  }

  /* VIDEO */
  if (mime.startsWith("video/")) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "16px", background: "#000" }}>
        <video
          src={url}
          controls
          autoPlay={false}
          style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px", outline: "none" }}
        />
      </div>
    );
  }

  /* AUDIO */
  if (mime.startsWith("audio/")) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%", gap: "24px", padding: "32px",
      }}>
        <div style={{
          width: "120px", height: "120px", borderRadius: "50%",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Music size={48} color="white" />
        </div>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </p>
        <audio src={url} controls style={{ width: "100%", maxWidth: "480px" }} />
      </div>
    );
  }

  /* PDF */
  if (mime === "application/pdf") {
    return (
      <iframe
        src={`${url}#toolbar=1&navpanes=1`}
        style={{ width: "100%", height: "100%", border: "none", borderRadius: "8px" }}
        title={name}
      />
    );
  }

  /* TEXT / CODE / JSON */
  if (mime.startsWith("text/") || mime === "application/json") {
    if (textErr) return <p style={{ color: "#f87171", padding: "16px", fontSize: "0.875rem" }}>Failed to load content.</p>;
    if (!text) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px", color: "#475569" }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#8b5cf6", animation: "spin 1s linear infinite" }} />
        Loading…
      </div>
    );
    return (
      <pre style={{
        margin: 0, padding: "16px",
        fontSize: "0.8rem", lineHeight: 1.6,
        color: "#94a3b8", whiteSpace: "pre-wrap",
        wordBreak: "break-word", height: "100%",
        overflowY: "auto",
      }}>
        {text}
      </pre>
    );
  }

  /* UNSUPPORTED */
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", color: "#475569" }}>
      <File size={56} style={{ opacity: 0.3 }} />
      <p style={{ fontSize: "0.875rem" }}>Preview not available for this file type.</p>
      <a
        href={url}
        download={name}
        style={{
          padding: "10px 20px", borderRadius: "8px",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          color: "white", fontSize: "0.85rem", fontWeight: 600,
          textDecoration: "none", display: "flex", alignItems: "center", gap: "6px",
        }}
      >
        <Download size={14} /> Download instead
      </a>
    </div>
  );
}

/* ── main component ── */
export default function PreviewModal({ file, wallet, onClose, open, allFiles = [], onShare }: Props) {
  // ALL HOOKS FIRST
  const [mounted, setMounted] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<FileItemData>(file);

  useEffect(() => { setMounted(true); }, []);

  // Sync currentFile when prop changes
  useEffect(() => { setCurrentFile(file); }, [file]);

  // Build direct gateway URL — browser fetches directly, no server proxy needed
  useEffect(() => {
    if (!open) return;
    setFileUrl(null);
    setUrlError(null);

    const gateway = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://gateway.shelby.xyz";
    const filePath = [...currentFile.path, currentFile.name].filter(Boolean).join("/");
    // Encode each segment individually to handle spaces and special chars
    const encoded = filePath.split("/").map(encodeURIComponent).join("/");
    const url = `${gateway}/${encodeURIComponent(wallet)}/${encoded}`;
    setFileUrl(url);
  }, [open, wallet, currentFile.name, currentFile.path.join("/")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") { onClose(); return; }
    if (!allFiles.length) return;
    const idx = allFiles.findIndex((f) => f.id === currentFile.id);
    if (e.key === "ArrowLeft" && idx > 0) setCurrentFile(allFiles[idx - 1]);
    if (e.key === "ArrowRight" && idx < allFiles.length - 1) setCurrentFile(allFiles[idx + 1]);
  }, [open, currentFile.id, allFiles, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // EARLY RETURNS after all hooks
  if (!mounted || !open) return null;

  const ext = getExt(currentFile.name);
  const retention = getRetentionStatus(currentFile.expiresAt);
  const isExpired = retention.state === "expired";
  const fileIdx = allFiles.findIndex((f) => f.id === currentFile.id);
  const hasPrev = fileIdx > 0;
  const hasNext = fileIdx < allFiles.length - 1;

  function handleDownload() {
    if (isExpired) return;
    const filePath = [...currentFile.path, currentFile.name].filter(Boolean).join("/");
    // Use proxy route — cross-origin <a download> is blocked by browsers
    const proxyUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}&download=1`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return createPortal(
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        key="preview-backdrop"
        style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* MODAL */}
      <motion.div
        key="preview-modal"
          style={{
            position: "fixed", top: "50%", left: "50%",
            x: "-50%", y: "-50%", zIndex: 80,
            borderRadius: "20px", padding: "2px",
            background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
            backgroundSize: "400% 100%", animation: "walletBorder 4s linear infinite",
            width: "min(900px, 96vw)",
          }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            background: "var(--bg-modal)", borderRadius: "18px",
            display: "flex", flexDirection: "column",
            height: "min(85vh, 700px)",
            overflow: "hidden",
          }}>

            {/* Top accent bar */}
            <div style={{
              height: "3px", flexShrink: 0,
              background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
              backgroundSize: "400% 100%",
              animation: "walletBorder 4s linear infinite",
            }} />

            {/* ── HEADER ── */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}>
              <FileTypeIcon name={currentFile.name} size={22} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {currentFile.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "2px", display: "flex", gap: "12px" }}>
                  <span>{formatSize(currentFile.size)}</span>
                  <span>{ext.replace(".", "").toUpperCase()}</span>
                  {retention.state === "active" && (
                    <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "3px" }}>
                      <Clock size={11} /> {retention.label}
                    </span>
                  )}
                  {retention.state === "expired" && (
                    <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "3px" }}>
                      <AlertCircle size={11} /> Expired
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                {onShare && (
                  <button
                    onClick={() => onShare(currentFile)}
                    title="Share"
                    style={{
                      padding: "6px 12px", borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <Share2 size={13} /> Share
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isExpired}
                  title="Download"
                  style={{
                    padding: "6px 14px", borderRadius: "8px", border: "none",
                    background: isExpired ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                    color: isExpired ? "#475569" : "white",
                    cursor: isExpired ? "not-allowed" : "pointer",
                    fontSize: "0.8rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "5px",
                  }}
                >
                  <Download size={13} /> Download
                </button>
                <button
                  onClick={onClose}
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "none", background: "rgba(255,255,255,0.06)",
                    color: "#94a3b8", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── PREVIEW AREA ── */}
            <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
              {urlError ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#f87171", fontSize: "0.875rem" }}>
                  {urlError}
                </div>
              ) : fileUrl ? (
                <PreviewContent url={fileUrl} name={currentFile.name} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px", color: "#475569" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#8b5cf6", animation: "spin 1s linear infinite" }} />
                  Loading…
                </div>
              )}

              {/* PREV button */}
              {hasPrev && (
                <button
                  onClick={() => setCurrentFile(allFiles[fileIdx - 1])}
                  style={{
                    position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)", zIndex: 10,
                  }}
                  title="Previous file (←)"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* NEXT button */}
              {hasNext && (
                <button
                  onClick={() => setCurrentFile(allFiles[fileIdx + 1])}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)", zIndex: 10,
                  }}
                  title="Next file (→)"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* ── FOOTER: file counter + nav dots ── */}
            {allFiles.length > 1 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", padding: "10px 20px",
                borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
              }}>
                <span style={{ fontSize: "0.72rem", color: "#475569", marginRight: "8px" }}>
                  {fileIdx + 1} / {allFiles.length}
                </span>
                {allFiles.slice(Math.max(0, fileIdx - 3), fileIdx + 4).map((f, i) => {
                  const isActive = f.id === currentFile.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setCurrentFile(f)}
                      style={{
                        width: isActive ? "20px" : "6px",
                        height: "6px", borderRadius: "3px",
                        background: isActive ? "#8b5cf6" : "rgba(255,255,255,0.2)",
                        border: "none", cursor: "pointer", padding: 0,
                        transition: "all 0.2s",
                      }}
                    />
                  );
                })}
              </div>
            )}

          </div>
        </motion.div>
    </AnimatePresence>,
    document.body
  );
}
