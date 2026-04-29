"use client";

import { use, useState, useEffect } from "react";
import { Download, Share2, Copy, Check, Play, FileText, Image as ImageIcon, Music, Video, File } from "lucide-react";
import Link from "next/link";

const GATEWAY = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://gateway.shelby.xyz";

interface Props {
  params: Promise<{ wallet: string; file: string[] }>;
}

function getMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac",
    pdf: "application/pdf",
    txt: "text/plain", md: "text/markdown",
    json: "application/json", js: "text/javascript", ts: "text/typescript",
    css: "text/css", html: "text/html",
  };
  return map[ext] || "application/octet-stream";
}

function formatSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ name, size = 48 }: { name: string; size?: number }) {
  const mime = getMime(name);
  const s = { width: size, height: size };
  if (mime.startsWith("image/"))  return <ImageIcon style={s} color="#a78bfa" />;
  if (mime.startsWith("video/"))  return <Video     style={s} color="#f472b6" />;
  if (mime.startsWith("audio/"))  return <Music     style={s} color="#34d399" />;
  if (mime === "application/pdf") return <FileText  style={s} color="#f87171" />;
  if (mime.startsWith("text/"))   return <FileText  style={s} color="#60a5fa" />;
  return <File style={s} color="#94a3b8" />;
}

export default function ShareFilePage({ params }: Props) {
  const { wallet, file } = use(params);
  const fileName = file.join("/");
  const displayName = decodeURIComponent(file[file.length - 1]);
  const mime = getMime(displayName);

  const fileUrl = `${GATEWAY}/${encodeURIComponent(wallet)}/${file.map(encodeURIComponent).join("/")}`;
  const downloadUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(fileName)}&download=1`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const [copied, setCopied] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Fetch text content for text files
  useEffect(() => {
    if (!mime.startsWith("text/") && mime !== "application/json") return;
    fetch(fileUrl)
      .then((r) => r.text())
      .then(setTextContent)
      .catch(() => {});
  }, [fileUrl, mime]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-navbar)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.3rem" }}>⬡</span>
          <span style={{
            fontWeight: 700, fontSize: "1rem",
            background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Shelby Drop</span>
        </Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleCopyLink}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              cursor: "pointer", fontSize: "0.85rem",
            }}
          >
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
          </button>
          <a
            href={downloadUrl}
            download={displayName}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "8px",
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              color: "white", textDecoration: "none",
              fontSize: "0.85rem", fontWeight: 600,
            }}
          >
            <Download size={14} /> Download
          </a>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" }}>
        {/* File info card */}
        <div style={{
          width: "100%", maxWidth: "800px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "20px",
        }}>
          <FileIcon name={displayName} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: "1.1rem", fontWeight: 700,
              margin: "0 0 6px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {displayName}
            </h1>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              {wallet.slice(0, 12)}…{wallet.slice(-8)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <a
              href={downloadUrl}
              download={displayName}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "8px",
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                color: "white", textDecoration: "none",
                fontSize: "0.875rem", fontWeight: 600,
              }}
            >
              <Download size={15} /> Download
            </a>
          </div>
        </div>

        {/* Preview area */}
        <div style={{
          width: "100%", maxWidth: "800px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
          minHeight: "400px",
        }}>
          {/* Image */}
          {mime.startsWith("image/") && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "rgba(0,0,0,0.2)" }}>
              <img src={fileUrl} alt={displayName} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "8px" }} />
            </div>
          )}

          {/* Video */}
          {mime.startsWith("video/") && (
            <div style={{ background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video src={fileUrl} controls style={{ width: "100%", maxHeight: "70vh" }} />
            </div>
          )}

          {/* Audio */}
          {mime.startsWith("audio/") && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "60px 24px", gap: "24px",
            }}>
              <div style={{
                width: "100px", height: "100px", borderRadius: "50%",
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Music size={40} color="white" />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{displayName}</p>
              <audio src={fileUrl} controls style={{ width: "100%", maxWidth: "480px" }} />
            </div>
          )}

          {/* PDF */}
          {mime === "application/pdf" && (
            <iframe src={`${fileUrl}#toolbar=1`} style={{ width: "100%", height: "70vh", border: "none" }} title={displayName} />
          )}

          {/* Text */}
          {(mime.startsWith("text/") || mime === "application/json") && (
            <div style={{ padding: "24px" }}>
              {textContent ? (
                <pre style={{
                  margin: 0, fontSize: "0.85rem", lineHeight: 1.6,
                  color: "var(--text-secondary)", whiteSpace: "pre-wrap",
                  wordBreak: "break-word", maxHeight: "70vh", overflowY: "auto",
                }}>
                  {textContent}
                </pre>
              ) : (
                <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading…</div>
              )}
            </div>
          )}

          {/* Unsupported */}
          {!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") &&
           mime !== "application/pdf" && !mime.startsWith("text/") && mime !== "application/json" && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "80px 24px", gap: "16px",
              color: "var(--text-muted)",
            }}>
              <File size={64} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: "0.9rem" }}>Preview not available for this file type.</p>
              <a
                href={downloadUrl}
                download={displayName}
                style={{
                  padding: "12px 24px", borderRadius: "8px",
                  background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                  color: "white", textDecoration: "none",
                  fontSize: "0.9rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "8px",
                }}
              >
                <Download size={16} /> Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ marginTop: "24px", fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
          Shared via{" "}
          <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>Shelby Drop</Link>
          {" "}— Decentralized file storage on Aptos blockchain
        </p>
      </main>
    </div>
  );
}
