"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Clock, AlertCircle,
  ChevronLeft, ChevronRight,
  FileText, Image as ImageIcon, Video, Music, File,
  Share2, AlertTriangle,
} from "lucide-react";
import { FileItemData } from "@/lib/data";
import { getRetentionStatus } from "@/lib/retention";

/* ── types ── */
type Props = {
  file: FileItemData;
  wallet: string;
  onClose: () => void;
  open: boolean;
  allFiles?: FileItemData[];
  onShare?: (file: FileItemData) => void;
  network?: string;
};

/* ── helpers ── */
function getExt(name: string) {
  return (name.split(".").pop()?.toLowerCase() ?? "");
}

function getMime(name: string): string {
  const ext = getExt(name);
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    bmp: "image/bmp",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    avi: "video/x-msvideo", mkv: "video/x-matroska",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    flac: "audio/flac", aac: "audio/aac", m4a: "audio/mp4",
    pdf: "application/pdf",
    txt: "text/plain", md: "text/markdown",
    json: "application/json", js: "text/javascript",
    ts: "text/plain", tsx: "text/plain", jsx: "text/plain",
    css: "text/css", html: "text/html", xml: "text/xml",
    csv: "text/csv", yaml: "text/yaml", yml: "text/yaml",
  };
  return map[ext] || "application/octet-stream";
}

function FileTypeIcon({ name, size = 20 }: { name: string; size?: number }) {
  const mime = getMime(name);
  if (mime.startsWith("image/"))  return <ImageIcon size={size} style={{ color: "#a78bfa" }} />;
  if (mime.startsWith("video/"))  return <Video     size={size} style={{ color: "#f472b6" }} />;
  if (mime.startsWith("audio/"))  return <Music     size={size} style={{ color: "#34d399" }} />;
  if (mime === "application/pdf") return <FileText  size={size} style={{ color: "#f87171" }} />;
  if (mime.startsWith("text/") || mime === "application/json") return <FileText size={size} style={{ color: "#60a5fa" }} />;
  return <File size={size} style={{ color: "#94a3b8" }} />;
}

function formatSize(bytes: number | string): string {
  const n = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (!n || isNaN(n)) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── build proxy URL — all media goes through /api/media to avoid CORS ── */
function buildProxyUrl(wallet: string, file: FileItemData, network?: string): string {
  const filePath = [...(file.path ?? []), file.name].filter(Boolean).join("/");
  const networkParam = network ? `&network=${encodeURIComponent(network)}` : "";
  return `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}${networkParam}`;
}

/* ── preview content renderer ── */
function PreviewContent({ proxyUrl, name }: { proxyUrl: string; name: string }) {
  const mime = getMime(name);
  const ext  = getExt(name);

  const [text, setText]       = useState<string | null>(null);
  const [textErr, setTextErr] = useState(false);
  const [imgErr, setImgErr]   = useState(false);
  const [vidErr, setVidErr]   = useState(false);

  const isText = mime.startsWith("text/") || mime === "application/json";

  useEffect(() => {
    if (!isText) return;
    setText(null);
    setTextErr(false);
    fetch(proxyUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setText)
      .catch(() => setTextErr(true));
  }, [proxyUrl, isText]);

  /* ── IMAGE ── */
  if (mime.startsWith("image/")) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", padding: "16px", overflow: "auto",
      }}>
        {imgErr ? (
          <div style={{ textAlign: "center", color: "#f87171" }}>
            <AlertTriangle size={40} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontSize: "0.875rem" }}>Failed to load image</p>
            <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: "#a78bfa", fontSize: "0.8rem" }}>Open directly ↗</a>
          </div>
        ) : (
          <img
            src={proxyUrl}
            alt={name}
            onError={() => setImgErr(true)}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }}
          />
        )}
      </div>
    );
  }

  /* ── VIDEO ── */
  if (mime.startsWith("video/")) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", background: "#000", overflow: "hidden",
      }}>
        {vidErr ? (
          <div style={{ textAlign: "center", color: "#f87171", padding: "32px" }}>
            <AlertTriangle size={40} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p style={{ fontSize: "0.875rem" }}>Failed to load video</p>
            <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: "#a78bfa", fontSize: "0.8rem" }}>Open directly ↗</a>
          </div>
        ) : (
          <video
            key={proxyUrl}
            controls
            autoPlay={false}
            onError={() => setVidErr(true)}
            style={{ maxWidth: "100%", maxHeight: "100%", outline: "none" }}
          >
            <source src={proxyUrl} type={mime} />
            Your browser does not support this video format.
          </video>
        )}
      </div>
    );
  }

  /* ── AUDIO ── */
  if (mime.startsWith("audio/")) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%", gap: "24px", padding: "32px",
        background: "radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)",
      }}>
        {/* Album art placeholder */}
        <div style={{
          width: "140px", height: "140px", borderRadius: "50%",
          background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(139,92,246,0.3)",
        }}>
          <Music size={56} color="white" />
        </div>
        <p style={{
          color: "#94a3b8", fontSize: "0.9rem", textAlign: "center",
          maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {name}
        </p>
        <audio
          key={proxyUrl}
          controls
          style={{ width: "100%", maxWidth: "520px" }}
        >
          <source src={proxyUrl} type={mime} />
          Your browser does not support this audio format.
        </audio>
      </div>
    );
  }

  /* ── PDF ── */
  if (mime === "application/pdf") {
    return (
      <iframe
        key={proxyUrl}
        src={`${proxyUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        style={{ width: "100%", height: "100%", border: "none" }}
        title={name}
      />
    );
  }

  /* ── TEXT / CODE / JSON / MARKDOWN ── */
  if (isText) {
    if (textErr) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", color: "#f87171" }}>
          <AlertTriangle size={32} style={{ opacity: 0.6 }} />
          <p style={{ fontSize: "0.875rem" }}>Failed to load file content</p>
          <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: "#a78bfa", fontSize: "0.8rem" }}>Open directly ↗</a>
        </div>
      );
    }
    if (text === null) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: "8px", color: "#475569" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#8b5cf6", animation: "spin 1s linear infinite" }} />
          Loading…
        </div>
      );
    }

    // Markdown: render with basic styling
    if (ext === "md") {
      return (
        <div style={{ height: "100%", overflowY: "auto", padding: "24px 32px" }}>
          <pre style={{
            margin: 0, fontFamily: "inherit",
            fontSize: "0.875rem", lineHeight: 1.8,
            color: "var(--text-primary)", whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {text}
          </pre>
        </div>
      );
    }

    // JSON: pretty print
    if (ext === "json") {
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      return (
        <div style={{ height: "100%", overflowY: "auto" }}>
          <pre style={{
            margin: 0, padding: "16px 20px",
            fontSize: "0.8rem", lineHeight: 1.6,
            color: "#94a3b8", whiteSpace: "pre-wrap",
            wordBreak: "break-word", fontFamily: "monospace",
          }}>
            {pretty}
          </pre>
        </div>
      );
    }

    // Plain text / code
    return (
      <div style={{ height: "100%", overflowY: "auto" }}>
        <pre style={{
          margin: 0, padding: "16px 20px",
          fontSize: "0.8rem", lineHeight: 1.6,
          color: "#94a3b8", whiteSpace: "pre-wrap",
          wordBreak: "break-word", fontFamily: "monospace",
        }}>
          {text}
        </pre>
      </div>
    );
  }

  /* ── UNSUPPORTED ── */
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: "16px", color: "#475569",
    }}>
      <File size={56} style={{ opacity: 0.3 }} />
      <p style={{ fontSize: "0.875rem" }}>Preview not available for this file type.</p>
      <a
        href={proxyUrl}
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
export default function PreviewModal({
  file, wallet, onClose, open, allFiles = [], onShare, network,
}: Props) {
  const [mounted, setMounted]         = useState(false);
  const [currentFile, setCurrentFile] = useState<FileItemData>(file);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setCurrentFile(file); }, [file]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") { onClose(); return; }
    if (!allFiles.length) return;
    const idx = allFiles.findIndex((f) => f.id === currentFile.id);
    if (e.key === "ArrowLeft"  && idx > 0)                  setCurrentFile(allFiles[idx - 1]);
    if (e.key === "ArrowRight" && idx < allFiles.length - 1) setCurrentFile(allFiles[idx + 1]);
  }, [open, currentFile.id, allFiles, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!mounted || !open) return null;

  const ext       = getExt(currentFile.name);
  const retention = getRetentionStatus(currentFile.expiresAt);
  const isExpired = retention.state === "expired";
  const fileIdx   = allFiles.findIndex((f) => f.id === currentFile.id);
  const hasPrev   = fileIdx > 0;
  const hasNext   = fileIdx < allFiles.length - 1;

  // All media goes through our proxy to avoid CORS
  const proxyUrl = buildProxyUrl(wallet, currentFile, network);

  function handleDownload() {
    if (isExpired) return;
    const filePath = [...(currentFile.path ?? []), currentFile.name].filter(Boolean).join("/");
    const networkParam = network ? `&network=${encodeURIComponent(network)}` : "";
    const dlUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}&download=1${networkParam}`;
    const a = document.createElement("a");
    a.href = dlUrl;
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
        style={{
          position: "fixed", inset: 0, zIndex: 70,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        }}
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
          width: "min(960px, 96vw)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          background: "var(--bg-modal)", borderRadius: "18px",
          display: "flex", flexDirection: "column",
          height: "min(88vh, 720px)",
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
            padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
            <FileTypeIcon name={currentFile.name} size={20} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {currentFile.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "2px", display: "flex", gap: "10px", alignItems: "center" }}>
                <span>{formatSize(currentFile.size)}</span>
                <span style={{ textTransform: "uppercase" }}>{ext}</span>
                {retention.state === "active" && (
                  <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: "3px" }}>
                    <Clock size={10} /> {retention.label}
                  </span>
                )}
                {retention.state === "expired" && (
                  <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "3px" }}>
                    <AlertCircle size={10} /> Expired
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {onShare && (
                <button
                  onClick={() => onShare(currentFile)}
                  style={{
                    padding: "6px 12px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
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
                style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none",
                  background: isExpired
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg,#8b5cf6,#3b82f6)",
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
            <PreviewContent key={proxyUrl} proxyUrl={proxyUrl} name={currentFile.name} />

            {/* PREV */}
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
                title="Previous (←)"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* NEXT */}
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
                title="Next (→)"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* ── FOOTER: nav dots ── */}
          {allFiles.length > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", padding: "10px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
            }}>
              <span style={{ fontSize: "0.7rem", color: "#475569", marginRight: "8px" }}>
                {fileIdx + 1} / {allFiles.length}
              </span>
              {allFiles.slice(Math.max(0, fileIdx - 4), fileIdx + 5).map((f) => {
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
