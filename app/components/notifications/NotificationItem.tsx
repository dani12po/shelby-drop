"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, ExternalLink } from "lucide-react";
import { Notification } from "./NotificationProvider";
import { 
  shortenTxHash, 
  shortenWallet, 
  buildTxExplorerUrl, 
  buildWalletExplorerUrl,
  isValidHash,
  isValidWalletAddress 
} from "@/lib/blockchain/formatTx";

export default function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const styles = {
    success: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.15)'  },
    info:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
  };
  const s = styles[notification.type] || styles.info;

  const icons = {
    success: <CheckCircle2 size={16} strokeWidth={2} color={s.color} />,
    error:   <AlertCircle  size={16} strokeWidth={2} color={s.color} />,
    info:    <Info         size={16} strokeWidth={2} color={s.color} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      style={{
        width: '340px',
        background: '#0b0f14',
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.color}`,
        borderRadius: '10px',
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: '6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative'
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icons[notification.type] || icons.info}
        {notification.title && (
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {notification.title}
          </span>
        )}
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', padding: '2px',
            display: 'flex', alignItems: 'center'
          }}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Message */}
      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
        {notification.message}
      </p>

      {/* Wallet link */}
      {notification.wallet && isValidWalletAddress(notification.wallet) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wallet:</span>
          <a
            href={buildWalletExplorerUrl(notification.wallet)}
            target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: '0.72rem', color: 'var(--accent-cyan)',
              textDecoration: 'none', fontFamily: 'monospace',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            {shortenWallet(notification.wallet)}
            <ExternalLink size={10} strokeWidth={2} />
          </a>
        </div>
      )}

      {/* Explorer Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
        {/* Aptos Explorer link */}
        {notification.txHash && isValidHash(notification.txHash) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '45px' }}>Aptos:</span>
            <a
              href={`https://explorer.aptoslabs.com/txn/${notification.txHash}?network=testnet`}
              target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem', color: 'var(--accent-cyan)',
                textDecoration: 'none', fontFamily: 'monospace',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              {shortenTxHash(notification.txHash)}
              <ExternalLink size={10} strokeWidth={2} />
            </a>
          </div>
        )}

        {/* Shelby Explorer link */}
        {notification.shelbyTxUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '45px' }}>Shelby:</span>
            <a
              href={notification.shelbyTxUrl}
              target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem', color: 'var(--accent-cyan)',
                textDecoration: 'none', fontFamily: 'monospace',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              View on Shelby Explorer
              <ExternalLink size={10} strokeWidth={2} />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
