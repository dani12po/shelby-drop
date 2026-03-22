"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Copy, Check, Link2 } from "lucide-react";

type Props = {
  url: string;
  onClose: () => void;
};

const GRADIENT = `
  linear-gradient(
    90deg,
    #7dd3fc,
    #a78bfa,
    #f472b6,
    #34d399,
    #fbbf24,
    #60a5fa,
    #a78bfa
  )
`;

export default function ShareModal({ url, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe: don't Render anything on server
  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <>
        {/* BACKDROP */}
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.6)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* GRADIENT BORDER */}
        <motion.div
          style={{
            position: 'fixed',
            zIndex: 50,
            top: '50%',
            left: '50%',
            x: '-50%',
            y: '-50%',
            borderRadius: '28px',
            padding: '2px'
          }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL BODY */}
          <div
            style={{
              width: '360px',
              borderRadius: '26px',
              background: 'var(--bg-modal)',
              color: 'var(--text-primary)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* SAFE INNER PADDING */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              {/* HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                    Share this file
                  </h2>
                </div>
                <button onClick={onClose} style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: 'none', background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* CONTENT */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* URL display */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', marginBottom: '12px'
                }}>
                  <Link2 size={14} strokeWidth={2} color="#475569" style={{flexShrink: 0}} />
                  <input
                    value={url} readOnly
                    style={{
                      flex: 1, background: 'none', border: 'none',
                      color: '#94a3b8', fontSize: '0.8rem',
                      fontFamily: 'monospace', outline: 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  />
                </div>

                {/* Copy button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  style={{
                    width: '100%', padding: '12px',
                    borderRadius: '10px',
                    background: copied
                      ? 'rgba(16,185,129,0.15)'
                      : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    border: copied ? '1px solid rgba(16,185,129,0.3)' : 'none',
                    color: copied ? '#10b981' : 'white',
                    fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    marginBottom: '8px'
                  }}
                >
                  {copied
                    ? <><Check size={16} strokeWidth={2.5} /> Copied!</>
                    : <><Copy size={16} strokeWidth={2} /> Copy Link</>
                  }
                </button>

                {/* Cancel */}
                <button onClick={onClose} style={{
                  width: '100%', padding: '10px',
                  background: 'none', border: 'none',
                  color: '#475569', fontSize: '0.8rem',
                  cursor: 'pointer', transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}
