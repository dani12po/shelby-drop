"use client";

import { use, useState, useEffect } from "react";
import { Download, Copy, Check, Music, File } from "lucide-react";
import Link from "next/link";

const GATEWAY = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://api.testnet.shelby.xyz/shelby/v1/blobs";

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

function FileIcon({ name, className }: { name: string; className?: string }) {
  const mime = getMime(name);
  if (mime.startsWith("image/"))  return <File className={`${className} text-purple-400`} />;
  if (mime.startsWith("video/"))  return <File className={`${className} text-pink-400`} />;
  if (mime.startsWith("audio/"))  return <Music className={`${className} text-emerald-400`} />;
  return <File className={`${className} text-slate-400`} />;
}

export default function ShareFilePage({ params }: Props) {
  const { wallet, file } = use(params);
  const fileName = file.join("/");
  const displayName = decodeURIComponent(file[file.length - 1]);
  const mime = getMime(displayName);

  const fileUrl = `${GATEWAY}/${encodeURIComponent(wallet)}/${file.map(encodeURIComponent).join("/")}`;
  const downloadUrl = `/api/media?wallet=${encodeURIComponent(wallet)}&name=${encodeURIComponent(fileName)}&download=1`;

  const [copied, setCopied] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-navbar)] backdrop-blur-xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline group">
          <span className="text-xl group-hover:scale-110 transition-transform">⬡</span>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
            Shelby Drop
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all text-xs sm:text-sm font-medium"
          >
            {copied ? <><Check size={14} className="text-emerald-400" /> Copied!</> : <><Copy size={14} /> Copy Link</>}
          </button>
          <a
            href={downloadUrl}
            download={displayName}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download size={14} /> Download
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center p-6 sm:p-10 max-w-5xl mx-auto w-full">
        {/* File info card */}
        <div className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-black/20">
          <div className="p-4 bg-white/5 rounded-2xl">
            <FileIcon name={displayName} className="w-12 h-12" />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-lg sm:text-xl font-bold mb-2 truncate">
              {displayName}
            </h1>
            <div className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full inline-block">
              {wallet.slice(0, 12)}…{wallet.slice(-8)}
            </div>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <a
              href={downloadUrl}
              download={displayName}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download size={16} /> Download File
            </a>
          </div>
        </div>

        {/* Preview area */}
        <div className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden min-h-[400px] shadow-2xl shadow-black/40">
          {/* Image */}
          {mime.startsWith("image/") && (
            <div className="flex items-center justify-center p-6 sm:p-10 bg-black/20">
              <img 
                src={fileUrl} 
                alt={displayName} 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" 
              />
            </div>
          )}

          {/* Video */}
          {mime.startsWith("video/") && (
            <div className="bg-black flex items-center justify-center">
              <video src={fileUrl} controls className="w-full max-h-[70vh]" />
            </div>
          )}

          {/* Audio */}
          {mime.startsWith("audio/") && (
            <div className="flex flex-col items-center justify-center py-20 px-6 gap-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <Music size={40} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-medium mb-1">{displayName}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Audio File</p>
              </div>
              <audio src={fileUrl} controls className="w-full max-w-md" />
            </div>
          )}

          {/* PDF */}
          {mime === "application/pdf" && (
            <iframe 
              src={`${fileUrl}#toolbar=1`} 
              className="w-full h-[70vh] border-none" 
              title={displayName} 
            />
          )}

          {/* Text */}
          {(mime.startsWith("text/") || mime === "application/json") && (
            <div className="p-6 sm:p-8">
              {textContent ? (
                <pre className="m-0 text-sm leading-relaxed text-slate-400 whitespace-pre-wrap break-words max-h-[70vh] overflow-y-auto custom-scrollbar font-mono bg-black/20 p-6 rounded-2xl border border-white/5">
                  {textContent}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm">Loading content...</p>
                </div>
              )}
            </div>
          )}

          {/* Unsupported */}
          {!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") &&
           mime !== "application/pdf" && !mime.startsWith("text/") && mime !== "application/json" && (
            <div className="flex flex-col items-center justify-center py-24 px-6 gap-6 text-center">
              <div className="p-6 bg-white/5 rounded-3xl">
                <File size={64} className="text-slate-600" />
              </div>
              <div>
                <p className="text-slate-300 font-bold mb-2">Preview not available</p>
                <p className="text-sm text-slate-500 max-w-xs">
                  This file type cannot be previewed in the browser. Please download it to view the content.
                </p>
              </div>
              <a
                href={downloadUrl}
                download={displayName}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
              >
                <Download size={16} /> Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Shared via{" "}
            <Link href="/" className="text-violet-400 hover:text-violet-300 font-medium no-underline transition-colors">
              Shelby Drop
            </Link>
          </p>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">
            Decentralized file storage on Aptos blockchain
          </p>
        </div>
      </main>
    </div>
  );
}
