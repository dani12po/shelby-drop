"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WalletPill from "@/app/components/WalletPill";
import WalletModal from "@/app/components/WalletModal";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const COLORS = [
  ["#0b1020", "#12203a"],
  ["#0b1a14", "#123b2d"],
  ["#120b1f", "#2a1240"],
  ["#0a1623", "#12304a"],
  ["#1a120b", "#3a2a12"],
  ["#0b1a20", "#1a2a3a"],
  ["#120f0b", "#2a1f12"],
];

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const { connected, account, connect, disconnect, wallets } = useWallet();

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((p) => (p + 1) % COLORS.length);
    }, 4200);
    return () => clearInterval(i);
  }, []);

  const walletLabel = account
    ? (() => {
        const addr = account.address.toString();
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      })()
    : "";

  const availableWallets = wallets.map((w) => w.name);

  const handleSelectWallet = (name: string) => {
    connect(name);
    setWalletModalOpen(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* WALLET PILL (FIXED) */}
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
          onOpenModal={() => setWalletModalOpen(true)}
          onDisconnect={disconnect}
        />
      </div>

      {/* WALLET MODAL */}
      <WalletModal
        open={walletModalOpen}
        wallets={availableWallets}
        onSelectWallet={handleSelectWallet}
        onClose={() => setWalletModalOpen(false)}
      />

      {/* BACKGROUND */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: walletModalOpen ? 0.4 : 1 }}
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

      {/* CONTENT */}
      <div
        className="relative z-10 min-h-screen flex items-center justify-center"
        style={{
          filter: walletModalOpen ? "blur(6px)" : "none",
          transition: "filter 0.2s ease",
        }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-5xl font-semibold">
            Shelby Drop
          </h1>

          <p className="text-sm text-white/70 max-w-sm">
            Upload and share files using only your wallet.
          </p>
        </div>
      </div>
    </main>
  );
}
