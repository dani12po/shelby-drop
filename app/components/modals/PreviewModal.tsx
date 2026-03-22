"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Clock, AlertCircle } from "lucide-react";
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
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              zIndex: 60,
              borderRadius: '28px',
              padding: '2px',
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL BODY */}
            <div style={{
              background: 'var(--bg-modal)',
              borderRadius: '26px',
              padding: '28px',
              width: '860px',
              maxWidth: '95vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: 'white'
            }}>
        {/* ================= HEADER ================= */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0
        }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
            <h3 style={{
              fontSize: '0.95rem', fontWeight: 600,
              margin: '0 0 4px', color: 'white',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {file.name}
            </h3>
            <p style={{
              fontSize: '0.72rem', color: '#475569',
              fontFamily: 'monospace', margin: 0
            }}>
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px', border: 'none',
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ================= META ================= */}
        <div style={{
          display: 'flex', gap: '20px', flexWrap: 'wrap',
          fontSize: '0.75rem', color: '#64748b',
          marginBottom: '16px', flexShrink: 0,
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <span>Size: {file.size}</span>
          <span>Type: {ext.replace('.', '').toUpperCase()}</span>

          {retention.state === "active" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
              <Clock size={12} strokeWidth={2} />
              <span>{retention.label}</span>
            </div>
          )}

          {retention.state === "expired" && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
              <AlertCircle size={12} strokeWidth={2} />
              <span>EXPIRED</span>
            </div>
          )}
        </div>

        {/* ================= PREVIEW ================= */}
        <div style={{
          flex: 1, minHeight: 0,
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '12px',
          overflow: 'auto',
          padding: '16px',
          marginBottom: '16px'
        }}>
          {error ? (
            <p style={{ color: '#f87171', fontSize: '0.875rem' }}>
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
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '200px', gap: '8px', color: '#475569', fontSize: '0.875rem'
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: '2px solid rgba(139,92,246,0.3)',
                borderTopColor: '#8b5cf6',
                animation: 'spin 1s linear infinite'
              }} />
              Loading preview...
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          gap: '10px', flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: '0.85rem',
              cursor: 'pointer', fontWeight: 500
            }}
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={!signedUrl || isExpired}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: (!signedUrl || isExpired)
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              color: (!signedUrl || isExpired) ? '#475569' : 'white',
              fontSize: '0.85rem',
              cursor: (!signedUrl || isExpired) ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Download size={15} strokeWidth={2} />
            {isExpired ? 'Expired' : 'Download'}
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
