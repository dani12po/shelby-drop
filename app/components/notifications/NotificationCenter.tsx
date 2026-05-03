"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState, useRef } from "react";
import { useNotifications, type Notification } from "./useNotifications";
import { CheckCircle2, AlertCircle, Info, X, ExternalLink } from "lucide-react";
import { 
  buildAptosTxUrl, 
  buildShelbyTxUrl, 
  shortenTxHash,
  isValidHash
} from "@/lib/blockchain/formatTx";

/* ── helpers ── */
function getStyle(type?: string) {
  switch (type) {
    case "success": return { accent: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" };
    case "error":   return { accent: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  };
    case "warning": return { accent: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  };
    default:        return { accent: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" };
  }
}

function getIcon(type?: string, accent?: string) {
  const props = { size: 16, strokeWidth: 2, color: accent };
  if (type === "success") return <CheckCircle2 {...props} />;
  if (type === "error")   return <AlertCircle  {...props} />;
  if (type === "warning") return <AlertCircle  {...props} />;
  return <Info {...props} />;
}

/* ── single notification item with countdown bar ── */
function NotifItem({ n, onRemove }: { n: Notification; onRemove: () => void }) {
  const s = getStyle(n.type);
  const duration = n.meta?.duration ?? 10000;

  // Countdown bar: animate from 100% → 0% over `duration` ms
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  const txHash = n.meta?.txHash;
  const shelbyTxUrl = n.meta?.shelbyTxUrl || (txHash && isValidHash(txHash) ? buildShelbyTxUrl(txHash) : undefined);
  const aptosTxUrl = n.meta?.aptosTxUrl || (txHash && isValidHash(txHash) ? buildAptosTxUrl(txHash) : undefined);
  const link   = n.meta?.link;
  const label  = n.meta?.linkLabel || (txHash ? shortenTxHash(txHash) : "View");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ pointerEvents: "auto", position: "relative", overflow: "hidden" }}
    >
      {/* Countdown bar — sits at the very top of the card */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "3px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "11px 11px 0 0",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: s.accent,
          transition: "width 0.1s linear",
          borderRadius: "inherit",
        }} />
      </div>

      {/* Card body */}
      <div
        onClick={onRemove}
        style={{
          paddingTop: "15px", // extra top padding to clear the bar
          paddingBottom: "12px",
          paddingLeft: "14px",
          paddingRight: "14px",
          borderRadius: "11px",
          background: "var(--bg-modal, #0b0f14)",
          border: `1px solid ${s.border}`,
          backdropFilter: "blur(20px)",
          cursor: "pointer",
          display: "flex", alignItems: "flex-start", gap: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Left accent line */}
        <div style={{
          width: "3px", alignSelf: "stretch", minHeight: "20px",
          borderRadius: "2px", flexShrink: 0,
          background: s.accent,
        }} />

        {/* Icon */}
        <div style={{ flexShrink: 0, marginTop: "1px" }}>
          {getIcon(n.type, s.accent)}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {n.meta?.title && (
            <div style={{ 
              fontSize: "0.825rem", 
              fontWeight: 600, 
              color: "var(--text-primary)",
              marginBottom: "2px"
            }}>
              {n.meta.title}
            </div>
          )}
          <p style={{
            fontSize: "0.775rem", color: "var(--text-secondary)",
            margin: 0, lineHeight: 1.5,
          }}>
            {n.message}
          </p>

          {/* Explorer Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {/* Aptos Explorer link */}
            {aptosTxUrl && (
              <a
                href={aptosTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "0.72rem", color: s.accent,
                  textDecoration: "none", fontFamily: "monospace",
                  opacity: 0.9,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}
              >
                <span style={{ minWidth: '45px', opacity: 0.7 }}>Aptos:</span>
                {txHash ? shortenTxHash(txHash) : label}
                <ExternalLink size={10} strokeWidth={2} />
              </a>
            )}

            {/* Shelby Explorer link */}
            {shelbyTxUrl && (
              <a
                href={shelbyTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "0.72rem", color: s.accent,
                  textDecoration: "none", fontFamily: "monospace",
                  opacity: 0.9,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}
              >
                <span style={{ minWidth: '45px', opacity: 0.7 }}>Shelby:</span>
                View on Shelby Explorer
                <ExternalLink size={10} strokeWidth={2} />
              </a>
            )}

            {/* Custom link */}
            {link && !aptosTxUrl && !shelbyTxUrl && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "0.72rem", color: s.accent,
                  textDecoration: "none", fontFamily: "monospace",
                  opacity: 0.9,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}
              >
                {label}
                <ExternalLink size={10} strokeWidth={2} />
              </a>
            )}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            flexShrink: 0, background: "none", border: "none",
            color: "var(--text-muted)", cursor: "pointer", padding: "2px",
            display: "flex", alignItems: "center",
          }}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}

/* ── main component ── */
export default function NotificationCenter() {
  const { notifications, remove } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      zIndex: 70,
      display: "flex", flexDirection: "column-reverse", gap: "8px",
      width: "360px", maxWidth: "calc(100vw - 48px)",
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {notifications.slice(-3).map((n) => (
          <NotifItem key={n.id} n={n} onRemove={() => remove(n.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
