"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type WalletModalProps = {
  open: boolean;
  wallets: string[];
  onSelectWallet: (name: string) => void;
  onClose: () => void;
};

const WALLET_ICONS: Record<string, JSX.Element> = {
  Petra: <span className="w-3 h-3 rounded-full bg-[#8b5cf6]" />,
  OKX: <span className="w-3 h-3 rounded-full bg-white border border-gray-200" />,
  Martian: <span className="w-3 h-3 rounded-full bg-[#10b981]" />,
  Backpack: <span className="w-3 h-3 rounded-full bg-[#f97316]" />,
};

const RECOMMENDED_WALLET = "Petra";

export default function WalletModal({
  open,
  wallets,
  onSelectWallet,
  onClose,
}: WalletModalProps) {
  const orderedWallets = [
    ...wallets.filter((w) => w === RECOMMENDED_WALLET),
    ...wallets.filter((w) => w !== RECOMMENDED_WALLET),
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="relative w-full max-w-[400px] rounded-[28px] p-[2px] pointer-events-auto"
              style={{
                background: 'linear-gradient(90deg, #7dd3fc, #a78bfa, #f472b6, #34d399, #fbbf24, #60a5fa, #a78bfa)',
                backgroundSize: '400% 100%',
                animation: 'walletBorder 4s linear infinite',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
            <div className="w-full rounded-[26px] bg-[var(--bg-modal)] shadow-2xl overflow-hidden flex flex-col">
              {/* Top accent bar */}
              <div className="h-[3px] bg-gradient-to-r from-[#7dd3fc] via-[#a78bfa] to-[#f472b6] bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite]" />

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    Connect Wallet
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 transition-colors flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Wallet List */}
                <div className="flex flex-col gap-3">
                  {orderedWallets.map((name) => {
                    const isRecommended = name === RECOMMENDED_WALLET;

                    return (
                      <button
                        key={name}
                        onClick={() => onSelectWallet(name)}
                        className={`w-full h-14 rounded-2xl flex items-center gap-4 px-4 transition-all duration-200 border group ${
                          isRecommended 
                            ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50' 
                            : 'bg-[var(--bg-card)] border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]'
                        }`}
                      >
                        {/* Icon Circle */}
                        <div className="w-9 h-9 rounded-full bg-[var(--bg-modal)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                          {WALLET_ICONS[name]}
                        </div>

                        {/* Name */}
                        <span className="flex-1 text-left font-semibold text-[var(--text-primary)]">
                          {name}
                        </span>

                        {/* Recommended Badge */}
                        {isRecommended && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">
                            Best
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 text-center text-[10px] text-[var(--text-muted)] leading-relaxed">
                  By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
