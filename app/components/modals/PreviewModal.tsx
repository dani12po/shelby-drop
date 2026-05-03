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
  if (mime.startsWith("image/"))  return <ImageIcon size={size} className="text-purple-400" />;
  if (mime.startsWith("video/"))  return <Video     size={size} className="text-pink-400" />;
  if (mime.startsWith("audio/"))  return <Music     size={size} className="text-emerald-400" />;
  if (mime === "application/pdf") return <FileText  size={size} className="text-red-400" />;
  if (mime.startsWith("text/") || mime === "application/json") return <FileText size={size} className="text-blue-400" />;
  return <File size={size} className="text-slate-400" />;
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
  const blobrefParam = file.blobId ? `&blobref=${encodeURIComponent(file.blobId)}` : "";
  const networkParam = (!file.blobId && network) ? `&network=${encodeURIComponent(network)}` : "";
  return `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}${blobrefParam}${networkParam}`;
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
      <div className="flex items-center justify-center h-full p-4 overflow-auto">
        {imgErr ? (
          <div className="text-center text-red-400 p-8">
            <AlertTriangle size={40} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm mb-2">Failed to load image</p>
            <p className="text-xs text-slate-500 mb-4">
              The Shelby storage nodes may be temporarily unavailable.
            </p>
            <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
              className="text-purple-400 text-xs hover:underline">Open directly ↗</a>
          </div>
        ) : (
          <img
            src={proxyUrl}
            alt={name}
            onError={() => setImgErr(true)}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        )}
      </div>
    );
  }

  /* ── VIDEO ── */
  if (mime.startsWith("video/")) {
    return (
      <div className="flex items-center justify-center h-full bg-black overflow-hidden">
        {vidErr ? (
          <div className="text-center text-red-400 p-8">
            <AlertTriangle size={40} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm mb-2">Failed to load video</p>
            <p className="text-xs text-slate-500 mb-4">
              The Shelby storage nodes may be temporarily unavailable.
            </p>
            <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
              className="text-purple-400 text-xs hover:underline">Open directly ↗</a>
          </div>
        ) : (
          <video
            key={proxyUrl}
            controls
            autoPlay={false}
            onError={() => setVidErr(true)}
            className="max-w-full max-h-full outline-none"
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
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]">
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <Music size={56} className="text-white" />
        </div>
        <p className="text-slate-400 text-sm text-center max-w-[400px] truncate">
          {name}
        </p>
        <audio
          key={proxyUrl}
          controls
          className="w-full max-w-[520px]"
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
        className="w-full h-full border-none"
        title={name}
      />
    );
  }

  /* ── TEXT / CODE / JSON / MARKDOWN ── */
  if (isText) {
    if (textErr) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
          <AlertTriangle size={32} className="opacity-60" />
          <p className="text-sm">Failed to load file content</p>
          <p className="text-xs text-slate-500">
            The Shelby storage nodes may be temporarily unavailable.
          </p>
          <a href={proxyUrl} target="_blank" rel="noopener noreferrer"
            className="text-purple-400 text-xs hover:underline">Open directly ↗</a>
        </div>
      );
    }
    if (text === null) {
      return (
        <div className="flex items-center justify-center h-full gap-2 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          Loading…
        </div>
      );
    }

    // Markdown: render with basic styling
    if (ext === "md") {
      return (
        <div className="h-full overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <pre className="m-0 font-sans text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words">
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
        <div className="h-full overflow-y-auto custom-scrollbar">
          <pre className="m-0 p-4 sm:p-5 font-mono text-xs leading-relaxed text-slate-400 whitespace-pre-wrap break-words bg-black/20">
            {pretty}
          </pre>
        </div>
      );
    }

    // Plain text / code
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <pre className="m-0 p-4 sm:p-5 font-mono text-xs leading-relaxed text-slate-400 whitespace-pre-wrap break-words bg-black/20">
          {text}
        </pre>
      </div>
    );
  }

  /* ── UNSUPPORTED ── */
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-slate-500 p-8 text-center">
      <div className="p-6 bg-white/5 rounded-3xl">
        <File size={56} className="opacity-30" />
      </div>
      <div>
        <p className="text-slate-300 font-bold mb-2">Preview not available</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          This file type cannot be previewed in the browser. Please download it to view the content.
        </p>
      </div>
      <button
        onClick={() => {
          const a = document.createElement("a");
          a.href = proxyUrl + "&download=1";
          a.download = name;
          a.click();
        }}
        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Download size={16} /> Download File
      </button>
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
    const blobrefParam = currentFile.blobId ? `&blobref=${encodeURIComponent(currentFile.blobId)}` : "";
    const dlUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(filePath)}&download=1${blobrefParam}`;
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
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          key="preview-modal"
          className="relative w-full max-w-[1000px] rounded-[28px] p-[2px] overflow-hidden pointer-events-auto"
          style={{
            background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
            backgroundSize: "400% 100%",
            animation: "walletBorder 4s linear infinite",
          }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[var(--bg-modal)] rounded-[26px] flex flex-col h-[min(90vh,800px)] overflow-hidden shadow-2xl">

          {/* Top accent bar */}
          <div className="h-[3px] flex-shrink-0 bg-gradient-to-r from-[#7dd3fc] via-[#a78bfa] to-[#f472b6] bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite]" />

          {/* ── HEADER ── */}
          <div className="flex items-center gap-3 px-5 py-4 sm:px-8 border-b border-white/5 flex-shrink-0">
            <div className="p-2 bg-white/5 rounded-xl">
              <FileTypeIcon name={currentFile.name} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
                {currentFile.name}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 flex gap-3 items-center">
                <span className="font-mono">{formatSize(currentFile.size)}</span>
                <span className="uppercase font-bold tracking-wider opacity-60">{ext}</span>
                {retention.state === "active" && (
                  <span className="text-amber-400 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {retention.label}
                  </span>
                )}
                {retention.state === "expired" && (
                  <span className="text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> Expired
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {onShare && (
                <button
                  onClick={() => onShare(currentFile)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
                >
                  <Share2 size={14} /> Share
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={isExpired}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  isExpired 
                    ? "bg-white/5 text-slate-600 cursor-not-allowed" 
                    : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <Download size={14} /> Download
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── PREVIEW AREA ── */}
          <div className="flex-1 min-h-0 relative overflow-hidden bg-black/10">
            <PreviewContent key={proxyUrl} proxyUrl={proxyUrl} name={currentFile.name} />

            {/* PREV */}
            {hasPrev && (
              <button
                onClick={() => setCurrentFile(allFiles[fileIdx - 1])}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/80 hover:scale-110 transition-all shadow-xl"
                title="Previous (←)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* NEXT */}
            {hasNext && (
              <button
                onClick={() => setCurrentFile(allFiles[fileIdx + 1])}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur-md z-10 hover:bg-black/80 hover:scale-110 transition-all shadow-xl"
                title="Next (→)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* ── FOOTER: nav dots ── */}
          {allFiles.length > 1 && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-white/5 flex-shrink-0 bg-black/5">
              <span className="text-[10px] font-bold text-slate-500 mr-4 uppercase tracking-widest">
                {fileIdx + 1} / {allFiles.length}
              </span>
              <div className="flex items-center gap-1.5">
                {allFiles.slice(Math.max(0, fileIdx - 4), fileIdx + 5).map((f) => {
                  const isActive = f.id === currentFile.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setCurrentFile(f)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? "w-8 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "w-1.5 bg-white/10 hover:bg-white/30"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
