"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

/* ===============================
   COMPONENT IMPORTS
================================ */

import WalletPill from "@/components/wallet/WalletPill";
import WalletModal from "@/components/wallet/WalletModal";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import ExplorerPage from "@/components/explorer/ExplorerPage";
import Header from "@/components/layout/Header";

/* ===============================
   BACKGROUND COLORS
================================ */

const COLORS: [string, string][] = [
  ["#0b1020", "#12203a"],
  ["#0b1a14", "#123b2d"],
  ["#120b1f", "#2a1240"],
  ["#0a1623", "#12304a"],
  ["#1a120b", "#3a2a12"],
  ["#0b1a20", "#1a2a3a"],
  ["#120f0b", "#2a1f12"],
];

/* ===============================
   PAGE
================================ */

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const {
    connected,
    account,
    connect,
    disconnect,
    wallets,
  } = useWallet();

  /* ===============================
     BACKGROUND ROTATION
  ================================ */

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % COLORS.length);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  /* ===============================
     WALLET LABEL
  ================================ */

  const handleWalletConnect = (wallet: string) => {
    // For now, just set the wallet address
    // In real implementation, would connect to wallet adapter
    console.log('Wallet connected:', wallet);
  };

  const handleWalletDisconnect = () => {
    disconnect();
  };

  const currentWallet = account?.address.toString() || null;

  /* ===============================
     RENDER
  ================================ */

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* ============================
          WALLET CONNECT (TOP RIGHT)
      ============================ */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "24px",
          zIndex: 60,
        }}
      >
        <WalletConnect
          wallet={currentWallet}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />
      </div>

      {/* ============================
          WALLET MODAL (LEGACY - CAN BE REMOVED)
      ============================ */}
      <WalletModal
        open={walletModalOpen}
        wallets={wallets.map((w) => w.name)}
        onSelectWallet={(name) => {
          connect(name);
          setWalletModalOpen(false);
        }}
        onClose={() => setWalletModalOpen(false)}
      />

      {/* ============================
          BACKGROUND
      ============================ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: walletModalOpen ? 0.4 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          style={{
            filter: walletModalOpen ? "blur(6px)" : "none",
            background: `
              radial-gradient(
                900px 600px at 50% -20%,
                rgba(255,255,255,0.06),
                transparent 60%
              ),
              linear-gradient(
                135deg,
                ${COLORS[index][0]},
                ${COLORS[index][1]}
              )
            `,
          }}
        />
      </AnimatePresence>

      {/* ============================
          APP CONTENT
      ============================ */}
      <div
        className="relative z-10 min-h-screen flex flex-col"
        style={{
          filter: walletModalOpen ? "blur(6px)" : "none",
          transition: "filter 0.2s ease",
        }}
      >
        {/* HEADER — BRANDING ONLY */}
        <Header />

        {/* MAIN CONTENT (ALL LOGIC LIVES HERE) */}
        <div className="flex-1 p-6">
          <Suspense fallback={<div>Loading...</div>}>
            <ExplorerPage connected={connected} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
