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
  // Use walletAddress prop if provided, otherwise use internal state
  const [wallet, setWallet] = useState<string | null>(walletAddress || null);

  // Update wallet when prop changes
  useEffect(() => {
    if (walletAddress) {
      setWallet(walletAddress);
    }
  }, [walletAddress]);

  /* ===============================
     PREVIEW MODAL
  ================================ */
  const [previewFile, setPreviewFile] =
    useState<FileItemData | null>(null);

  /* ===============================
     UPLOAD
  ================================ */
  const [uploadOpen, setUploadOpen] =
    useState(false);
  const [currentPath] = useState<string[]>([]);

  /* ===============================
     HANDLE SHARED FILES
  ================================ */
  useEffect(() => {
    if (hasActiveShare && shareMapping) {
      // Auto-open Explorer with shared file
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
  const [searchWallet, setSearchWallet] =
    useState<string | null>(null);

  /* ===============================
     RENDER
  ================================ */
  return (
    <>
      {/* ===============================
         SEARCH PAGE (DEFAULT)
      ================================ */}
      <AnimatePresence mode="wait">
        {!wallet && (
          <motion.div
            key="search"
            {...searchMotion}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
              textAlign: 'center',
              padding: '40px 20px'
            }}
          >
            {/* BADGE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                marginBottom: '24px'
              }}
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#a78bfa',
                letterSpacing: '0.02em'
              }}>
                Powered by Aptos
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                fontSize: 'clamp(32px, 6vw, 52px)',
                fontWeight: 700,
                color: 'white',
                marginBottom: '16px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em'
              }}
            >
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Shelby Drop
              </span>
            </motion.h1>

            {/* SUBHEADLINE */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '16px',
                color: '#94a3b8',
                maxWidth: '480px',
                marginBottom: '40px',
                lineHeight: 1.6
              }}
            >
              Download, upload, and share files using only your wallet.
              <br />
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                No email required. No accounts. Just you and the blockchain.
              </span>
            </motion.p>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                display: 'flex',
                gap: '32px',
                marginBottom: '40px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#60a5fa',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  <FileKey className="w-5 h-5" />
                  100K+
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Files Stored
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#34d399',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  <Layers className="w-5 h-5" />
                  50K+
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Wallets
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#a78bfa',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  <Globe className="w-5 h-5" />
                  Global
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Decentralized
                </div>
              </div>
            </motion.div>

            {/* SEARCH BOX */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ width: '100%', maxWidth: '600px', marginBottom: '32px' }}
            >
              <SearchBox
                onSearch={(wallet) => {
                  // hard reset controller
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
              style={{ display: 'flex', gap: '16px' }}
            >
              {connected && (
                <UploadButton
                  connected={connected}
                  onUpload={() =>
                    setUploadOpen(true)
                  }
                />
              )}
            </motion.div>

            {/* FEATURES HINT */}
            {!connected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: '48px',
                  display: 'flex',
                  gap: '24px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>End-to-end encrypted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Instant uploads</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Worldwide CDN</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===============================
         UPLOAD PANEL
      ================================ */}
      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {}}
        path={currentPath}
      />

      {/* ===============================
         PREVIEW MODAL
      ================================ */}
      {previewFile && wallet && (
        <PreviewModal
          file={previewFile}
          wallet={wallet}
          open={!!previewFile}
          onClose={() =>
            setPreviewFile(null)
          }
        />
      )}

      {/* ===============================
         WALLET SEARCH CONTROLLER
      ================================ */}
      {searchWallet && (
        <WalletSearchController
          wallet={searchWallet}
          onClose={() =>
            setSearchWallet(null)
          }
        />
      )}
    </>
  );
}
