"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

/* ===============================
   COMPONENT IMPORTS
================================ */

import WalletPill from "@/components/wallet/WalletPill";
import WalletModal from "@/components/wallet/WalletModal";
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
  const [walletModalOpen, setWalletModalOpen] =
    useState(false);

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

  const walletLabel = account
    ? (() => {
        const addr = account.address.toString();
        return `${addr.slice(0, 6)}...${addr.slice(
          -4
        )}`;
      })()
    : "";

  const availableWallets = wallets.map(
    (w) => w.name
  );

  const handleSelectWallet = (name: string) => {
    connect(name);
    setWalletModalOpen(false);
  };

  /* ===============================
     RENDER
  ================================ */

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* ============================
          WALLET PILL
      ============================ */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "24px",
          zIndex: 60,
        }}
      >
        <WalletPill
          connected={connected}
          label={walletLabel}
          onOpenModal={() =>
            setWalletModalOpen(true)
          }
          onDisconnect={disconnect}
        />
      </div>

      {/* ============================
          WALLET MODAL
      ============================ */}
      <WalletModal
        open={walletModalOpen}
        wallets={availableWallets}
        onSelectWallet={handleSelectWallet}
        onClose={() =>
          setWalletModalOpen(false)
        }
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
            opacity: walletModalOpen
              ? 0.4
              : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          style={{
            filter: walletModalOpen
              ? "blur(6px)"
              : "none",
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
          filter: walletModalOpen
            ? "blur(6px)"
            : "none",
          transition: "filter 0.2s ease",
        }}
      >
        {/* HEADER (BRANDING ONLY) */}
        <Header />

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <ExplorerPage connected={connected} />
        </div>
      </div>
    </main>
  );
}
