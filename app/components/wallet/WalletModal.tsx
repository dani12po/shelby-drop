"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type WalletModalProps = {
  open: boolean;
  wallets: string[];
  onSelectWallet: (name: string) => void;
  onClose: () => void;
};

const WALLET_ICONS: Record<string, JSX.Element> = {
  Petra: <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6' }} />,
  OKX: <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white' }} />,
  Martian: <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />,
  Backpack: <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316' }} />,
};

const RECOMMENDED_WALLET = "Petra";

export default function WalletModal({
  open,
  wallets,
  onSelectWallet,
  onClose,
}: WalletModalProps) {
  // Petra pinned on top, others always appended below
  const orderedWallets = [
    ...wallets.filter((w) => w === RECOMMENDED_WALLET),
    ...wallets.filter((w) => w !== RECOMMENDED_WALLET),
  ];

  // Portal to ensure modal renders at document root
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP — CLICK OUTSIDE TO CLOSE */}
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL BORDER */}
          <motion.div
            style={{
              position: 'fixed',
              zIndex: 50,
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              borderRadius: '26px',
              padding: '2px',
              background: 'linear-gradient(90deg, #7dd3fc, #a78bfa, #f472b6, #34d399, #fbbf24, #60a5fa, #a78bfa)',
              backgroundSize: '400% 100%',
              animation: 'walletBorder 4s linear infinite',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* SOLID MODAL */}
            <div
              style={{
                width: '420px',
                borderRadius: '24px',
                background: 'var(--bg-modal)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.7)',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '28px 32px' }}>
                {/* HEADER */}
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  marginBottom: '18px'
                }}>
                  Connect Wallet
                </h2>

                {/* WALLET LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {orderedWallets.map((name, idx) => {
                    const isRecommended = name === RECOMMENDED_WALLET;

                    return (
                      <div
                        key={name}
                        style={{ width: '100%', position: 'relative' }}
                      >
                        <button
                          onClick={() => onSelectWallet(name)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-card-hover)';
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                          }}
                          onMouseLeave={(e) => {
                            if (isRecommended) {
                              e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
                            } else {
                              e.currentTarget.style.background = 'var(--bg-card)';
                              e.currentTarget.style.borderColor = 'var(--border)';
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '52px',
                            borderRadius: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '0 18px',
                            background: isRecommended ? 'rgba(139,92,246,0.15)' : 'var(--bg-card)',
                            border: isRecommended ? '1px solid rgba(139,92,246,0.4)' : '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                        >
                          {/* ICON */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {WALLET_ICONS[name]}
                          </div>

                          {/* NAME */}
                          <span style={{ flex: 1, textAlign: 'left' }}>
                            {name}
                          </span>

                          {/* RECOMMENDED TEXT */}
                          {isRecommended && (
                            <span style={{
                              fontSize: '0.7rem',
                              color: '#a78bfa',
                              background: 'rgba(139,92,246,0.15)',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              border: '1px solid rgba(139,92,246,0.3)'
                            }}>
                              Recommended
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render via portal to avoid position context issues
  return createPortal(modalContent, document.body);
}
