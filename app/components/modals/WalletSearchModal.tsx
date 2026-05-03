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

const GATEWAY = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://api.testnet.shelby.xyz/shelby/v1/blobs";

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
  const mime = getMimeType(name);

  return createPortal(
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            className="relative p-[2px] rounded-[20px] bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite] w-full max-w-[860px] pointer-events-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="bg-[var(--bg-modal)] rounded-[18px] p-5 flex flex-col h-[min(85vh,720px)] overflow-hidden">
            {/* header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[80%]">
                {name}
              </span>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`${url}?attachment=1`}
                  download={name}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-semibold no-underline flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <Download size={13} /> Download
                </a>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border-none bg-white/5 text-slate-400 cursor-pointer flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* content */}
            <div className="flex-1 min-h-0 overflow-auto rounded-xl bg-black/40 p-3">
              {mime.startsWith("image/") && (
                <img src={url} alt={name} className="max-w-full max-h-[60vh] object-contain block mx-auto" />
              )}
              {mime.startsWith("video/") && (
                <video src={url} controls className="w-full max-h-[60vh]" />
              )}
              {mime.startsWith("audio/") && (
                <div className="py-10 px-5 text-center">
                  <audio src={url} controls className="w-full" />
                </div>
              )}
              {mime === "application/pdf" && (
                <iframe src={`${url}#toolbar=0`} className="w-full h-[60vh] border-none" title={name} />
              )}
              {(mime.startsWith("text/") || mime === "application/json") && (
                <TextFetcher url={url} />
              )}
              {!mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") &&
               mime !== "application/pdf" && !mime.startsWith("text/") && mime !== "application/json" && (
                <div className="text-center py-16 px-5 text-slate-500">
                  <File size={48} className="mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Preview not available for this file type.</p>
                  <a
                    href={`${url}?attachment=1`}
                    download={name}
                    className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                  >
                    <Download size={14} /> Download instead
                  </a>
                </div>
              )}
            </div>
          </div>
          </motion.div>
        </div>
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

  if (err) return <p className="text-red-400 text-sm">Failed to load content.</p>;
  if (!text) return <p className="text-slate-500 text-sm">Loading…</p>;
  return (
    <pre className="text-xs text-slate-400 whitespace-pre-wrap break-words m-0">
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
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* GRADIENT BORDER */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          className="relative p-[2px] rounded-[28px] bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite] pointer-events-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* MODAL BODY */}
        <div className="w-[min(640px,calc(100vw-32px))] min-h-[400px] h-[min(80vh,640px)] rounded-[26px] bg-[var(--bg-modal)] text-[var(--text-primary)] flex flex-col overflow-hidden">
          {/* Top accent bar */}
          <div className="h-[3px] shrink-0 bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite]" />

          <div className="flex flex-col h-full p-4">

            {/* HEADER */}
            <div className="relative text-center pt-2 pb-5">
              <button
                onClick={onClose}
                className="absolute right-0 top-0 w-8 h-8 rounded-lg border-none bg-white/5 text-slate-400 cursor-pointer flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
              <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                Wallet Files
              </h2>
              <p className="text-[0.78rem] text-slate-500 font-mono mt-1.5 mb-0">
                {wallet.slice(0, 10)}…{wallet.slice(-6)}
              </p>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1 mt-1.5 bg-transparent border-none text-[0.72rem] cursor-pointer transition-colors ${copied ? "text-emerald-500" : "text-slate-500 hover:text-slate-400"}`}
              >
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy address</>}
              </button>
            </div>

            {/* FILE COUNT */}
            <div className="px-2 pb-2 text-[0.75rem] text-slate-500">
              {result?.total || 0} files found
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-2">
              {isLoading && (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-spin" />
                  <div className="text-sm text-slate-500">Loading files…</div>
                </div>
              )}

              {isEmpty && (
                <div className="py-16 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <div className="text-sm text-slate-500">No files found for this wallet</div>
                </div>
              )}

              {hasError && (
                <div className="py-16 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <div className="text-sm text-red-400 mb-2">Failed to load files</div>
                  <div className="text-xs text-slate-500">{error}</div>
                </div>
              )}

              {hasResults && (
                <div className="flex flex-col gap-2">
                  {result!.files.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        {/* icon */}
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {getFileIcon(file.type)}
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate text-[var(--text-primary)]">
                            {file.name}
                          </div>
                          {file.size && (
                            <div className="text-[0.75rem] text-slate-500 mt-0.5">
                              {file.size}
                            </div>
                          )}
                        </div>

                        {/* actions */}
                        <div className="flex gap-1 shrink-0">
                          {isPreviewable(file.name) && (
                            <button
                              onClick={() => setPreviewFile(file)}
                              title="Preview"
                              className="w-8 h-8 rounded-lg border-none bg-violet-500/10 text-violet-400 cursor-pointer flex items-center justify-center transition-all hover:bg-violet-500/25 hover:text-white"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(file)}
                            title="Download"
                            className="w-8 h-8 rounded-lg border-none bg-blue-500/10 text-blue-400 cursor-pointer flex items-center justify-center transition-all hover:bg-blue-500/25 hover:text-white"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleShare(file)}
                            title="Share"
                            className="w-8 h-8 rounded-lg border-none bg-emerald-500/10 text-emerald-400 cursor-pointer flex items-center justify-center transition-all hover:bg-emerald-500/25 hover:text-white"
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
            <div className="pt-4 pb-1 flex flex-col gap-2">
              <button
                onClick={handleOpenExplorer}
                className="w-full p-3 rounded-xl border-none bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={16} />
                Open Full Explorer
              </button>
              <button
                onClick={onClose}
                className="w-full p-2.5 bg-transparent border-none text-slate-500 text-xs cursor-pointer rounded-xl transition-colors hover:text-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </div>

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
