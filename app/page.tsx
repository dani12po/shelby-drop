"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import WalletModal from "@/components/wallet/WalletModal";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBox from "@/components/explorer/SearchBox";
import UploadButton from "@/components/upload/UploadButton";
import UploadPanel from "@/components/upload/UploadPanel";
import WalletSearchController from "@/components/explorer/WalletSearchController";
import { useShelbyStats } from "@/hooks/useShelbyStats";

export default function HomePage() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [popupWallet, setPopupWallet] = useState<string | null>(null);
  const stats = useShelbyStats();
  
  const {
    connected,
    account,
    connect,
    disconnect,
    wallets,
  } = useWallet();

  const handleWalletConnect = () => {
    setWalletModalOpen(true);
  };

  const handleWalletDisconnect = () => {
    disconnect();
  };

  const handleSearch = useCallback((wallet: string) => {
    setPopupWallet(null);
    requestAnimationFrame(() => setPopupWallet(wallet));
  }, []);

  const currentWallet = account?.address.toString() || null;

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative z-[1] overflow-x-hidden transition-[background-color] duration-500">
      <Header
        connected={connected}
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
      />

      <WalletModal
        open={walletModalOpen}
        wallets={wallets.map((w) => w.name)}
        onSelectWallet={(name) => {
          if (!connected) {
            connect(name);
          }
          setWalletModalOpen(false);
        }}
        onClose={() => setWalletModalOpen(false)}
      />

      {uploadModalOpen && currentWallet && (
        <UploadPanel
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploaded={() => setUploadModalOpen(false)}
          path={[]}
        />
      )}

      {popupWallet && (
        <WalletSearchController
          wallet={popupWallet}
          onClose={() => setPopupWallet(null)}
        />
      )}

      <main className="pt-16 relative z-[1] flex-1">
        <div className="max-w-[1280px] mx-auto px-6 py-10 md:py-20 pb-[100px] md:pb-[200px]">
          
          {/* HERO SECTION */}
          <section className="flex flex-col items-center text-center mb-12 md:mb-20 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/40 bg-purple-500/15 mb-8 text-sm text-[var(--text-accent)]">
              <span>⚡</span>
              <span className="font-medium">Powered by Shelby Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[var(--heading-from)] via-[var(--text-accent)] to-[var(--heading-to)] bg-clip-text text-transparent">
                Own Your Files.<br />Power the Chain.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-[var(--text-secondary)] mb-10 max-w-[600px]">
              Upload, browse, and share files on Shelby Network using only your wallet address.
            </p>

            {/* Search Box */}
            <div className="w-full max-w-[680px] mb-6">
              <SearchBox onSearch={handleSearch} />
            </div>

            {/* Upload Button */}
            <UploadButton connected={connected} onUpload={() => setUploadModalOpen(true)} />
          </section>

          {/* STATS BAR */}
          <section className="mb-16 relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-[800px] mx-auto rounded-3xl p-8 md:p-12 bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-[var(--heading-from)] via-[var(--accent)] to-[var(--heading-to)] bg-clip-text text-transparent leading-tight">
                  {stats.totalBlobs}
                </span>
                <span className="text-xs md:text-sm mt-2 text-[var(--text-muted)] tracking-wide uppercase font-medium opacity-70">Total Blobs</span>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/10" />

              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-[var(--text-success)] to-[#059669] bg-clip-text text-transparent leading-tight">
                  {stats.totalStorage}
                </span>
                <span className="text-xs md:text-sm mt-2 text-[var(--text-muted)] tracking-wide uppercase font-medium opacity-70">Storage Used</span>
              </div>

              <div className="hidden md:block w-px h-12 bg-white/10" />

              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-[var(--text-success)] to-[#059669] bg-clip-text text-transparent leading-tight">
                  {stats.network}
                </span>
                <span className="text-xs md:text-sm mt-2 text-[var(--text-muted)] tracking-wide uppercase font-medium opacity-70">Network</span>
              </div>
            </div>
          </section>

          {/* FILE EXPLORER */}
          <section className="relative z-10">
            <AnimatePresence mode="wait">
              {connected ? (
                <motion.div
                  key="explorer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ExplorerPage
                    connected={connected}
                    walletAddress={currentWallet || undefined}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-5 text-center min-h-[400px]"
                >
                  <div className="w-24 h-24 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    No wallet connected
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm max-w-[280px] mb-8 leading-relaxed">
                    Connect your wallet or search for a wallet address to view files
                  </p>
                  <button
                    onClick={handleWalletConnect}
                    className="px-9 py-3.5 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-blue)] text-[var(--text-on-accent)] text-sm font-bold shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-opacity"
                  >
                    Connect Wallet
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>

      <div className="pt-16 pb-8 relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}
