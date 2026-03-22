"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNotifications } from "@/components/notifications/useNotifications";
import {
  uploadToShelby,
  type UploadMetadata,
} from "@/lib/uploadService";

type UploadPanelProps = {
  open: boolean;
  onClose: () => void;

  /** Called after successful upload */
  onUploaded?: (metadata: UploadMetadata) => void;

  /** Active folder path */
  path: string[];
};

export default function UploadPanel({
  open,
  onClose,
  onUploaded,
  path,
}: UploadPanelProps) {
  const { notify } = useNotifications();
  const { account } = useWallet();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [days, setDays] = useState<number>(7);

  const wallet = account?.address.toString() || "";

  const handleUpload = async () => {
    if (isUploading) return;

    if (!account) {
      notify("error", "Wallet not connected");
      return;
    }

    if (!file) {
      notify("error", "Please select a file");
      return;
    }

    if (!days) {
      notify("error", "Please set retention period");
      return;
    }

    setIsUploading(true);

    try {
      /* ===============================
         1️⃣ Upload file (Shelby / local)
      ================================ */
      const metadata = await uploadToShelby({
        file,
        wallet: account.address.toString(),
        path,
        retentionDays: days,
      });

      /* ===============================
         2️⃣ Update Explorer index.json
         (server-side)
      ================================ */
      await fetch("/api/upload/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: account.address.toString(),
          blob_name: metadata.blob_name,
          size: metadata.size,
          contentType:
            metadata.mime ?? file.type,
          createdAt: metadata.uploadedAt,
        }),
      });

      notify("success", "Upload successful");

      /* ===============================
         3️⃣ Notify parent (UI refresh)
      ================================ */
      if (onUploaded) {
        onUploaded(metadata);
      }
      onClose();

      // Optional: reset form
      setFile(null);
      setDays(7);
    } catch (err) {
      notify(
        "error",
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Gradient border wrapper */}
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
              background: 'linear-gradient(90deg, #7dd3fc, #a78bfa, #f472b6, #34d399, #fbbf24, #60a5fa, #a78bfa)',
              backgroundSize: '400% 100%',
              animation: 'walletBorder 4s linear infinite',
              width: '480px',
              maxWidth: '95vw',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal body */}
            <div style={{
              background: 'var(--bg-modal)',
              borderRadius: '26px',
              padding: '32px',
              color: 'white',
            }}>

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '28px'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Upload File
                  </h2>
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--text-muted)',
                    fontFamily: 'monospace', margin: '4px 0 0'
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
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Drop zone */}
              <label style={{
                display: 'block', cursor: 'pointer', marginBottom: '20px'
              }}>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                />
                <div style={{
                  border: file
                    ? '2px solid rgba(139,92,246,0.5)'
                    : '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  background: file
                    ? 'rgba(139,92,246,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!file) {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
                    e.currentTarget.style.background = 'rgba(139,92,246,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!file) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  }
                }}
                >
                  {file ? (
                    <div>
                      <FileText
                        size={32}
                        strokeWidth={1.5}
                        color="#8b5cf6"
                        style={{ margin: '0 auto 12px' }}
                      />
                      <p style={{
                        fontSize: '0.9rem', fontWeight: 500,
                        color: 'var(--text-primary)', margin: '0 0 4px'
                      }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload
                        size={32}
                        strokeWidth={1.5}
                        color="var(--text-muted)"
                        style={{ margin: '0 auto 12px' }}
                      />
                      <p style={{
                        fontSize: '0.9rem', color: 'var(--text-secondary)',
                        margin: '0 0 4px', fontWeight: 500
                      }}>
                        Drop file here or click to browse
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        All file types supported
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Storage days field */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={16} strokeWidth={1.8} color="var(--text-secondary)" />
                  <div>
                    <p style={{
                      fontSize: '0.875rem', color: 'var(--text-primary)',
                      fontWeight: 500, margin: 0
                    }}>
                      Retention Period
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#475569', margin: '2px 0 0' }}>
                      How long to store the file
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={days}
                    onChange={e => setDays(+e.target.value)}
                    disabled={isUploading}
                    style={{
                      width: '70px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>days</span>
                </div>
              </div>

              {/* Progress bar — hanya tampil saat uploading */}
              {isUploading && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    height: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: '60%',
                      background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                      borderRadius: '2px',
                      animation: 'shimmer 1.5s infinite'
                    }} />
                  </div>
                  <p style={{
                    fontSize: '0.75rem', color: '#94a3b8',
                    textAlign: 'center', marginTop: '8px'
                  }}>
                    Uploading to Shelby Network...
                  </p>
                </div>
              )}

              {/* Actions */}
              <button
                disabled={isUploading || !file}
                onClick={handleUpload}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: (!file || isUploading)
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: (!file || isUploading) ? '#475569' : 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: (!file || isUploading) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '12px'
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload to Shelby Network'}
              </button>

              <button
                onClick={onClose}
                disabled={isUploading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                Cancel
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
