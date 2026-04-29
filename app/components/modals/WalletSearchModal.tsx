"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useExplorerModalController } from "@/components/explorer/core/useExplorerModalController";
import { useWalletSearch, type SearchFile } from "@/hooks/useWalletSearch";
import {
  X,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Archive,
  File,
  ExternalLink,
  Loader2,
  AlertCircle,
  FolderOpen,
  Copy,
  Check,
  Eye,
  Download,
  Share2,
} from "lucide-react";
import ShareModal from "@/components/modals/share/ShareModal";

/* ── helpers ── */

const GATEWAY = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://gateway.shelby.xyz";

function fileUrl(wallet: string, name: string) {
  return `${GATEWAY}/${wallet}/${encodeURIComponent(name)}`;
}

function getMimeType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    pdf: "application/pdf", txt: "text/plain", md: "text/markdown",
    json: "application/json", js: "text/javascript", ts: "text/typescript",
  };
  return map[ext] || "application/octet-stream";
}

function isPreviewable(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg","jpeg","png","gif","webp","svg","mp4","webm","mp3","wav","ogg","pdf","txt","md","json"].includes(ext);
}

/* ── inline preview component ── */

function InlinePreview({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const mime = getMimeType(name);

  return createPortal(
    <AnimatePresence>
      <>
        <motion.div
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          style={{
            position: "fixed", top: "50%", left: "50%", x: "-50%", y: "-50%",
            zIndex: 90, borderRadius: "20px", padding: "2px",
            background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
            backgroundSize: "400% 100%", animation: "walletBorder 4s linear infinite",
            width: "min(860px, 95vw)",
          }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            background: "var(--bg-modal)", borderRadius: "18px",
            padding: "20px", display: "flex", flexDirection: "column",
            maxHeight: "85vh", overflow: "hidden",
          }}>
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                {name}
              </span>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <a
                  href={`${url}?attachment=1`}
                  download={name}
                  style={{
                    padding: "6px 14px", borderRadius: "8px",
                    background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                    color: "white", fontSize: "0.8rem", fontWeight: 600,
                    textDecoration: "none", display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Download size={13} /> Download
                </a>
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

            {/* content */}
            <div style={{ flex: 1, minHeight: 0, overflow: "auto", borderRadius: "10px", background: "rgba(0,0,0,0.4)", padding: "12px" }}>
              {mime.startsWith("image/") && (
                <img src={url} alt={name} style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", display: "block", margin: "0 auto" }} />
              )}
              {mime.startsWith("video/") && (
                <video src={url} controls style={{ width: "100%", maxHeight: "60vh" }} />
              )}
              {mime.startsWith("audio/") && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <audio src={url} controls style={{ width: "100%" }} />
                </div>
              )}
              {mime === "application/pdf" && (
                <iframe src={`${url}#toolbar=0`} style={{ width: "100%", height: "60vh", border: "none" }} title={name} />
              )}
              {(mime.startsWith("text/") || mime === "application/json") && (
                <TextFetcher url={url} />
              )}
              {!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") &&
               mime !== "application/pdf" && !mime.startsWith("text/") && mime !== "application/json" && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                  <File size={48} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                  <p style={{ fontSize: "0.875rem" }}>Preview not available for this file type.</p>
                  <a
                    href={`${url}?attachment=1`}
                    download={name}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      marginTop: "16px", padding: "10px 20px", borderRadius: "8px",
                      background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                      color: "white", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                    }}
                  >
                    <Download size={14} /> Download instead
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}

function TextFetcher({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setErr(true));
  }, [url]);

  if (err) return <p style={{ color: "#f87171", fontSize: "0.875rem" }}>Failed to load content.</p>;
  if (!text) return <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading…</p>;
  return (
    <pre style={{ fontSize: "0.8rem", color: "#94a3b8", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
      {text}
    </pre>
  );
}

/* ── main component ── */

type Props = {
  wallet: string;
  onClose: () => void;
  onViewFile?: (file: any) => void;
};

export default function WalletSearchModal({ wallet, onClose, onViewFile }: Props) {
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<SearchFile | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const { openExplorer } = useExplorerModalController();
  const { result, error, searchWallet, isLoading, hasResults, isEmpty, hasError } = useWalletSearch();

  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (mounted && wallet) searchWallet(wallet);
  }, [wallet, mounted, searchWallet]);

  if (!mounted || !portalTarget) return null;
  if (!wallet || wallet.length < 10) return null;

  const handleOpenExplorer = () => {
    openExplorer({ wallet });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (file: SearchFile) => {
    const proxyUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(file.name)}&download=1`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = (file: SearchFile) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/share/${encodeURIComponent(wallet)}/${encodeURIComponent(file.name)}`;
    setShareUrl(url);
  };

  const getFileIcon = (type?: string) => {
    switch (type) {
      case "image":    return <Image   className="w-5 h-5 text-purple-400" />;
      case "video":    return <Video   className="w-5 h-5 text-pink-400" />;
      case "audio":    return <Music   className="w-5 h-5 text-green-400" />;
      case "code":     return <Code    className="w-5 h-5 text-blue-400" />;
      case "archive":  return <Archive className="w-5 h-5 text-yellow-400" />;
      case "document": return <FileText className="w-5 h-5 text-white/70" />;
      default:         return <File    className="w-5 h-5 text-white/50" />;
    }
  };

  return createPortal(
    <>
      {/* BACKDROP */}
      <motion.div
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* GRADIENT BORDER */}
      <motion.div
        style={{
          position: "fixed", top: "50%", left: "50%", x: "-50%", y: "-50%",
          zIndex: 60, borderRadius: "28px", padding: "2px",
          background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
          backgroundSize: "400% 100%", animation: "walletBorder 4s linear infinite",
        }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL BODY */}
        <div style={{
          width: "min(640px, 95vw)", minHeight: "400px", maxHeight: "80vh",
          borderRadius: "26px", background: "var(--bg-modal)",
          color: "var(--text-primary)", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "15px" }}>

            {/* HEADER */}
            <div style={{ position: "relative", textAlign: "center", paddingTop: "8px", paddingBottom: "20px" }}>
              <button
                onClick={onClose}
                style={{
                  position: "absolute", right: 0, top: 0,
                  width: "32px", height: "32px", borderRadius: "8px",
                  border: "none", background: "rgba(255,255,255,0.06)",
                  color: "#94a3b8", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={16} strokeWidth={2} />
              </button>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Wallet Files
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#64748b", fontFamily: "monospace", marginTop: "6px", marginBottom: 0 }}>
                {wallet.slice(0, 10)}…{wallet.slice(-6)}
              </p>
              <button
                onClick={handleCopy}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  marginTop: "6px", background: "none", border: "none",
                  color: copied ? "#10b981" : "#475569",
                  fontSize: "0.72rem", cursor: "pointer", transition: "color 0.2s",
                }}
              >
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy address</>}
              </button>
            </div>

            {/* FILE COUNT */}
            <div style={{ padding: "0 8px 8px", fontSize: "0.75rem", color: "#475569" }}>
              {result?.total || 0} files found
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
              {isLoading && (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                  <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-spin" />
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Loading files…</div>
                </div>
              )}

              {isEmpty && (
                <div style={{ padding: "64px 0", textAlign: "center" }}>
                  <FolderOpen style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.2 }} />
                  <div style={{ fontSize: "0.875rem", color: "#64748b" }}>No files found for this wallet</div>
                </div>
              )}

              {hasError && (
                <div style={{ padding: "64px 0", textAlign: "center" }}>
                  <AlertCircle style={{ width: 48, height: 48, margin: "0 auto 16px", color: "#f87171" }} />
                  <div style={{ fontSize: "0.875rem", color: "#f87171", marginBottom: "8px" }}>Failed to load files</div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>{error}</div>
                </div>
              )}

              {hasResults && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result!.files.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px 14px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* icon */}
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {getFileIcon(file.type)}
                        </div>

                        {/* info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.875rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                            {file.name}
                          </div>
                          {file.size && (
                            <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "2px" }}>
                              {file.size}
                            </div>
                          )}
                        </div>

                        {/* actions */}
                        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                          {isPreviewable(file.name) && (
                            <button
                              onClick={() => setPreviewFile(file)}
                              title="Preview"
                              style={{
                                width: "30px", height: "30px", borderRadius: "8px",
                                border: "none", background: "rgba(139,92,246,0.12)",
                                color: "#a78bfa", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.25)"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#a78bfa"; }}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(file)}
                            title="Download"
                            style={{
                              width: "30px", height: "30px", borderRadius: "8px",
                              border: "none", background: "rgba(59,130,246,0.12)",
                              color: "#60a5fa", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.25)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; e.currentTarget.style.color = "#60a5fa"; }}
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleShare(file)}
                            title="Share"
                            style={{
                              width: "30px", height: "30px", borderRadius: "8px",
                              border: "none", background: "rgba(16,185,129,0.12)",
                              color: "#34d399", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.25)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.12)"; e.currentTarget.style.color = "#34d399"; }}
                          >
                            <Share2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div style={{ paddingTop: "16px", paddingBottom: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={handleOpenExplorer}
                style={{
                  width: "100%", padding: "12px", borderRadius: "10px",
                  border: "none", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                  color: "white", fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "8px",
                }}
              >
                <ExternalLink style={{ width: 16, height: 16 }} />
                Open Full Explorer
              </button>
              <button
                onClick={onClose}
                style={{
                  width: "100%", padding: "10px", background: "none",
                  border: "none", color: "#475569", fontSize: "0.8rem",
                  cursor: "pointer", borderRadius: "10px", transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                onMouseLeave={e => e.currentTarget.style.color = "#475569"}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* INLINE PREVIEW */}
      {previewFile && (
        <InlinePreview
          url={fileUrl(wallet, previewFile.name)}
          name={previewFile.name}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* SHARE MODAL */}
      {shareUrl && (
        <ShareModal
          url={shareUrl}
          onClose={() => setShareUrl(null)}
        />
      )}
    </>,
    document.body
  );
}
