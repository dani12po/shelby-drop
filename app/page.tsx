"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

/* ===============================
   COMPONENT IMPORTS
 ============================== */

import WalletModal from "@/components/wallet/WalletModal";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import SearchBox from "@/components/explorer/SearchBox";
import UploadButton from "@/components/upload/UploadButton";
import UploadPanel from "@/components/upload/UploadPanel";
import WalletSearchController from "@/components/explorer/WalletSearchController";

/* ===============================
   PAGE
 ============================== */

export default function HomePage() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchWallet, setSearchWallet] = useState<string | null>(null);
  const [popupWallet, setPopupWallet] = useState<string | null>(null);
  
  const {
    connected,
    account,
    connect,
    disconnect,
    wallets,
  } = useWallet();

  // Auto-load files when wallet connects
  useEffect(() => {
    if (connected && account?.address) {
      setSearchWallet(account.address.toString());
    }
  }, [connected, account?.address]);

  /* ===============================
     WALLET HANDLERS
  ================================ */

  const handleWalletConnect = () => {
    setWalletModalOpen(true);
  };

  const handleWalletDisconnect = () => {
    disconnect();
    setSearchWallet(null);
  };

  const handleSearch = useCallback((wallet: string) => {
    setPopupWallet(null);
    requestAnimationFrame(() => setPopupWallet(wallet));
  }, []);

  const currentWallet = account?.address.toString() || null;

  /* ===============================
     RENDER
  ================================ */

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050508', position: 'relative', overflowX: 'hidden' }}>
       
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: '#050508'
      }}>
        {/* Orb 1 — purple, kiri atas */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '70vw',
          height: '70vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)',
          animation: 'orbFloat1 12s ease-in-out infinite',
          filter: 'blur(40px)'
        }} />

        {/* Orb 2 — blue, kanan tengah */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '-15%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)',
          animation: 'orbFloat2 15s ease-in-out infinite',
          filter: 'blur(40px)'
        }} />

        {/* Orb 3 — cyan, kiri bawah */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '20%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)',
          animation: 'orbFloat1 18s ease-in-out infinite reverse',
          filter: 'blur(50px)'
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none'
        }} />
      </div>

      <Header 
        connected={connected} 
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
      />

      {/* ============================
          WALLET MODAL
      ============================ */}
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

      {/* UPLOAD MODAL */}
      {uploadModalOpen && currentWallet && (
        <UploadPanel
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploaded={() => setUploadModalOpen(false)}
          path={[]}
        />
      )}

      {/* WALLET SEARCH POPUP */}
      {popupWallet && (
        <WalletSearchController
          wallet={popupWallet}
          onClose={() => setPopupWallet(null)}
        />
      )}

      <main style={{ paddingTop: '64px', position: 'relative', zIndex: 1, flex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 400px' }}>
          
          {/* ============================
              HERO SECTION
          ============================ */}
          <section style={{
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            textAlign: 'center',
            marginBottom: '60px',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: '1px solid rgba(139,92,246,0.4)',
                background: 'rgba(139,92,246,0.15)',
                marginBottom: '32px',
                fontSize: '14px',
                color: '#a78bfa'
              }}
            >
              <span>⚡</span>
              <span style={{ color: '#c4b5fd', fontWeight: 500 }}>Powered by Shelby Network</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 700,
                marginBottom: '24px',
                lineHeight: 1.2
              }}
            >
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Own Your Files.<br />Power the Chain.
              </span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: '18px',
                color: '#94a3b8',
                marginBottom: '40px',
                maxWidth: '600px'
              }}
            >
              Upload, browse, and share files on Shelby Network using only your wallet address.
            </p>

            {/* Search Box */}
            <div
              style={{ width: '100%', maxWidth: '680px', marginBottom: '24px' }}
            >
              <SearchBox onSearch={handleSearch} />
            </div>

            {/* Upload Button - Only show when connected */}
            <UploadButton connected={connected} onUpload={() => setUploadModalOpen(true)} />
          </section>

          {/* ============================
              STATS BAR
          ============================ */}
          <section style={{ marginBottom: '60px', position: 'relative', zIndex: 10 }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '48px',
                maxWidth: '680px',
                margin: '0 auto',
                background: 'rgba(15,15,23,0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '32px 56px',
                flexWrap: 'wrap'
              }}
            >
              {/* Stat 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #8b5cf6, #3b82f6)',
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}>12,847</span>
                <span style={{ fontSize: '13px', marginTop: '8px', color: '#64748b', letterSpacing: '0.02em' }}>Files Uploaded</span>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.08)' }} />

              {/* Stat 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #8b5cf6, #3b82f6)',
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}>3,291</span>
                <span style={{ fontSize: '13px', marginTop: '8px', color: '#64748b', letterSpacing: '0.02em' }}>Active Wallets</span>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.08)' }} />

              {/* Stat 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}>ShelbyNet</span>
                <span style={{ fontSize: '13px', marginTop: '8px', color: '#64748b', letterSpacing: '0.02em' }}>Network</span>
              </div>
            </div>
          </section>

          {/* ============================
              FILE EXPLORER
          ============================ */}
          <section style={{ position: 'relative', zIndex: 10 }}>
            <AnimatePresence mode="wait">
              {searchWallet || connected ? (
                <motion.div
                  key="explorer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ExplorerPage 
                    connected={connected} 
                    walletAddress={searchWallet || currentWallet || undefined}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '100px 20px',
                    textAlign: 'center',
                    minHeight: '400px'
                  }}
                >
                  {/* Empty State Icon */}
                  <div style={{
                    width: '96px',
                    height: '96px',
                    borderRadius: '24px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" style={{ color: '#fbbf24' }}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: 'white',
                    marginBottom: '8px'
                  }}>
                    No wallet connected
                  </h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    maxWidth: '280px',
                    textAlign: 'center',
                    marginBottom: '32px',
                    lineHeight: 1.6
                  }}>
                    Connect your wallet or search for a wallet address to view files
                  </p>
                  <button
                    onClick={handleWalletConnect}
                    style={{
                      padding: '14px 36px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    Connect Wallet
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>

      {/* ============================
          FOOTER
      ============================ */}
      <div style={{ 
        background: '#0a0a0f', 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        paddingTop: '64px',
        paddingBottom: '32px',
        position: 'relative',
        zIndex: 10,
        marginTop: 'auto'
      }}>
        <Footer />
      </div>
    </div>
  );
}
