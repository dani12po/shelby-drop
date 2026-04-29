"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useNetwork } from "@/hooks/useNetwork";
import type { UploadMetadata } from "@/lib/uploadService";
import UploadWithWalletButton from "./UploadWithWalletButton";

type UploadPanelProps = {
  open: boolean;
  onClose: () => void;
  onUploaded?: (metadata: UploadMetadata) => void;
  path: string[];
};

export default function UploadPanel({ open, onClose, onUploaded, path }: UploadPanelProps) {
  const { notify } = useNotifications();
  const { network } = useNetwork();
  const { account } = useWallet();

  const [file, setFile] = useState<File | null>(null);
  const [days, setDays] = useState<number>(7);

  const wallet = account?.address.toString() || "";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            style={{
              position: "fixed", top: "50%", left: "50%",
              x: "-50%", y: "-50%", zIndex: 60,
              borderRadius: "28px", padding: "2px",
              background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
              backgroundSize: "400% 100%", animation: "walletBorder 4s linear infinite",
              width: "480px", maxWidth: "95vw",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              background: "var(--bg-modal)", borderRadius: "26px",
              padding: "32px", color: "white",
            }}>

              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: "24px",
              }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    Upload File
                  </h2>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace", margin: "4px 0 0" }}>
                    {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Wallet not connected"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px", border: "none",
                    background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* Drop zone */}
              <label style={{ display: "block", cursor: "pointer", marginBottom: "20px" }}>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <div style={{
                  border: file ? "2px solid rgba(139,92,246,0.5)" : "2px dashed rgba(255,255,255,0.1)",
                  borderRadius: "16px", padding: "32px 24px", textAlign: "center",
                  background: file ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.2s",
                }}>
                  {file ? (
                    <div>
                      <FileText size={32} strokeWidth={1.5} color="#8b5cf6" style={{ margin: "0 auto 12px" }} />
                      <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)", margin: "0 0 4px" }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} strokeWidth={1.5} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0 0 4px", fontWeight: 500 }}>
                        Drop file here or click to browse
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                        All file types supported — no size limit
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Retention period */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px", marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={16} strokeWidth={1.8} color="var(--text-secondary)" />
                  <div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 500, margin: 0 }}>
                      Retention Period
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "#475569", margin: "2px 0 0" }}>
                      How long to store the file
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number" min={1} max={365} value={days}
                    onChange={e => setDays(+e.target.value)}
                    style={{
                      width: "70px", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                      padding: "6px 10px", color: "white", fontSize: "0.9rem",
                      textAlign: "center", outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>days</span>
                </div>
              </div>

              {/* Wallet upload — the ONLY upload method */}
              {file && account ? (
                <UploadWithWalletButton
                  file={file}
                  retentionDays={days}
                  onSuccess={(metadata) => {
                    if (onUploaded) onUploaded(metadata);
                    onClose();
                    setFile(null);
                    setDays(7);
                  }}
                  onError={(err) => notify("error", err)}
                />
              ) : (
                <button
                  disabled
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    background: "rgba(255,255,255,0.06)", color: "#475569",
                    fontSize: "0.9rem", fontWeight: 600, cursor: "not-allowed",
                    marginBottom: "12px",
                  }}
                >
                  {!account ? "Connect wallet to upload" : "Select a file to upload"}
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  width: "100%", padding: "10px", background: "none", border: "none",
                  color: "#475569", fontSize: "0.8rem", cursor: "pointer", transition: "color 0.2s",
                  marginTop: "8px",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                onMouseLeave={e => e.currentTarget.style.color = "#475569"}
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
