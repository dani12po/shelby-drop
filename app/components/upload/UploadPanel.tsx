"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNotifications } from "@/components/notifications/useNotifications";
import type { UploadMetadata } from "@/lib/uploadService";
import UploadWithWalletButton from "./UploadWithWalletButton";

type UploadPanelProps = {
  open: boolean;
  onClose: () => void;
  onUploaded?: (metadata: UploadMetadata) => void;
  path?: string[];
};

export default function UploadPanel({ open, onClose, onUploaded }: UploadPanelProps) {
  const { notify } = useNotifications();
  const { account } = useWallet();
  const [mounted, setMounted] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [days, setDays] = useState<number>(7);

  useEffect(() => { setMounted(true); }, []);

  const wallet = account?.address.toString() || "";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative w-full max-w-[480px] rounded-[28px] p-[2px] pointer-events-auto"
              style={{
                background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
                backgroundSize: "400% 100%",
                animation: "walletBorder 4s linear infinite",
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
            >
            <div className="bg-[var(--bg-modal)] rounded-[26px] text-white overflow-hidden">

              {/* Top accent bar */}
              <div className="h-[3px] bg-gradient-to-r from-[#7dd3fc] via-[#a78bfa] to-[#f472b6] bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite]" />

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] m-0">
                      Upload File
                    </h2>
                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono mt-1">
                      {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Wallet not connected"}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </div>

                {/* Drop zone */}
                <label className="block cursor-pointer mb-5">
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                  <div className={`border-2 rounded-2xl p-8 text-center transition-all duration-200 ${
                    file 
                      ? "border-purple-500/50 bg-purple-500/5" 
                      : "border-dashed border-white/10 bg-white/5 hover:border-white/20"
                  }`}>
                    {file ? (
                      <div>
                        <FileText size={32} strokeWidth={1.5} className="text-purple-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-1 truncate max-w-full px-4">
                          {file.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} strokeWidth={1.5} className="text-[var(--text-muted)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">
                          Drop file here or click to browse
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          All file types supported — no size limit
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {/* Retention period */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6">
                  <div className="flex items-center gap-3">
                    <Clock size={16} strokeWidth={1.8} className="text-[var(--text-secondary)]" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)] font-medium m-0">
                        Retention Period
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        How long to store the file
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <input
                      type="number" min={1} max={365} value={days}
                      onChange={e => setDays(+e.target.value)}
                      className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm text-center outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <span className="text-xs text-[var(--text-muted)]">days</span>
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
                    className="w-full py-3.5 rounded-xl bg-white/5 text-[var(--text-muted)] text-sm font-semibold cursor-not-allowed mb-3"
                  >
                    {!account ? "Connect wallet to upload" : "Select a file to upload"}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  Cancel
                </button>

              </div>{/* end padding div */}
            </div>{/* end bg-modal div */}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
