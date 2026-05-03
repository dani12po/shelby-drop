"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import SearchBox from "./SearchBox";
import WalletSearchController from "./WalletSearchController";

import PreviewModal from "@/components/modals/PreviewModal";
import UploadButton from "@/components/upload/UploadButton";
import UploadPanel from "@/components/upload/UploadPanel";

import { useShareSystem } from "@/hooks/useShareSystem";
import { useExplorerModalController } from "./core/useExplorerModalController";

import { Shield, Zap, Globe, FileKey, Layers } from "lucide-react";

import type { FileItemData } from "@/lib/data";

/* ===============================
   ANIMATION (SEARCH PAGE)
   ================================ */
const searchMotion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
};

interface ExplorerPageProps {
  connected?: boolean;
  walletAddress?: string;
  onConnect?: () => void;
}

export default function ExplorerPage({
  connected = false,
  walletAddress,
  onConnect,
}: ExplorerPageProps) {
  const searchParams = useSearchParams();
  const { shareMapping, hasActiveShare } = useShareSystem();
  const { openExplorer } = useExplorerModalController();

  /* ===============================
     CORE STATE
  ================================ */
  const [wallet, setWallet] = useState<string | null>(walletAddress || null);

  useEffect(() => {
    if (walletAddress) {
      setWallet(walletAddress);
    }
  }, [walletAddress]);

  /* ===============================
     PREVIEW MODAL
  ================================ */
  const [previewFile, setPreviewFile] = useState<FileItemData | null>(null);

  /* ===============================
     UPLOAD
  ================================ */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [currentPath] = useState<string[]>([]);

  /* ===============================
     HANDLE SHARED FILES
  ================================ */
  useEffect(() => {
    if (hasActiveShare && shareMapping) {
      setWallet(shareMapping.wallet);
      openExplorer({ 
        wallet: shareMapping.wallet,
        fileId: shareMapping.filename,
        path: []
      });
    }
  }, [hasActiveShare, shareMapping, openExplorer]);

  /* ===============================
     WALLET SEARCH CONTROLLER
  ================================ */
  const [searchWallet, setSearchWallet] = useState<string | null>(null);

  /* ===============================
     RENDER
  ================================ */
  return (
    <>
      <AnimatePresence mode="wait">
        {!wallet && (
          <motion.div
            key="search"
            {...searchMotion}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12"
          >
            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-[var(--accent)] tracking-wide uppercase">
                Powered by Aptos
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[clamp(2.5rem,8vw,4rem)] font-black text-[var(--text-primary)] mb-6 leading-tight tracking-tight"
            >
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Shelby Drop
              </span>
            </motion.h1>

            {/* SUBHEADLINE */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-[var(--text-secondary)] max-w-[520px] mb-10 leading-relaxed"
            >
              Download, upload, and share files using only your wallet.
              <span className="block mt-2 text-sm text-[var(--text-muted)]">
                No email required. No accounts. Just you and the blockchain.
              </span>
            </motion.p>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--accent-blue)] text-2xl md:text-3xl font-black">
                  <FileKey className="w-5 h-5 md:w-6 md:h-6" />
                  100K+
                </div>
                <div className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">
                  Files Stored
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--accent-green)] text-2xl md:text-3xl font-black">
                  <Layers className="w-5 h-5 md:w-6 md:h-6" />
                  50K+
                </div>
                <div className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">
                  Wallets
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--accent)] text-2xl md:text-3xl font-black">
                  <Globe className="w-5 h-5 md:w-6 md:h-6" />
                  Global
                </div>
                <div className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">
                  Decentralized
                </div>
              </div>
            </motion.div>

            {/* SEARCH BOX */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-[640px] mb-10"
            >
              <SearchBox
                onSearch={(wallet) => {
                  setSearchWallet(null);
                  requestAnimationFrame(() => {
                    setSearchWallet(wallet);
                  });
                }}
              />
            </motion.div>

            {/* Show Upload button only when connected */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {connected && (
                <UploadButton
                  connected={connected}
                  onUpload={() => setUploadOpen(true)}
                />
              )}
            </motion.div>

            {/* FEATURES HINT */}
            {!connected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10"
              >
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs md:text-sm font-medium">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs md:text-sm font-medium">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant uploads</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs md:text-sm font-medium">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Worldwide CDN</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {}}
        path={currentPath}
      />

      {previewFile && wallet && (
        <PreviewModal
          file={previewFile}
          wallet={wallet}
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {searchWallet && (
        <WalletSearchController
          wallet={searchWallet}
          onClose={() => setSearchWallet(null)}
        />
      )}
    </>
  );
}
