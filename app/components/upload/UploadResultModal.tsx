/**
 * Production-Ready Upload Result UI Component
 * 
 * Displays comprehensive upload status with:
 * - Real-time progress updates
 * - Transaction hash with clickable link
 * - Explorer integration
 * - Professional status states
 * - No UI lies - only verified success
 */

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  X, 
  Copy, 
  RefreshCw 
} from 'lucide-react';
import { 
  UploadProgress, 
  UploadStatus, 
  UploadPollingService 
} from '@/lib/shelby/uploadPollingService';

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgress?: UploadProgress;
  txHash?: string;
  blobName?: string;
  walletAddress?: string;
}

export function UploadResultModal({
  isOpen,
  onClose,
  initialProgress,
  txHash: initialTxHash,
  blobName,
  walletAddress,
}: UploadResultModalProps) {
  const [progress, setProgress] = useState<UploadProgress>(
    initialProgress || {
      status: 'uploading',
      message: 'Initializing upload...',
      progress: 0,
    }
  );
  
  const [isPolling, setIsPolling] = useState(false);
  const [pollingService] = useState(() => new UploadPollingService());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Start polling when modal opens with transaction hash
  useEffect(() => {
    if (isOpen && initialTxHash && blobName && walletAddress && !isPolling) {
      setIsPolling(true);
      startPolling();
    }
  }, [isOpen, initialTxHash, blobName, walletAddress]);

  const startPolling = async () => {
    if (!initialTxHash || !blobName || !walletAddress) return;

    try {
      const result = await pollingService.verifyUpload(
        initialTxHash,
        blobName,
        walletAddress,
        (update) => setProgress(update)
      );

      setProgress(result);
    } catch (error) {
      setProgress({
        status: 'failed',
        message: 'Verification failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsPolling(false);
    }
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'available_in_shelby':
        return { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#10b981' };
      case 'failed':
        return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#ef4444' };
      default:
        return { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', text: '#8b5cf6' };
    }
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  const colors = getStatusColor(progress.status);

  return createPortal(
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Gradient border wrapper */}
        <motion.div
          style={{
            borderRadius: '28px', padding: '2px',
            background: 'linear-gradient(90deg, #7dd3fc, #a78bfa, #f472b6, #34d399, #fbbf24, #60a5fa, #a78bfa)',
            backgroundSize: '400% 100%',
            animation: 'walletBorder 4s linear infinite',
            width: '480px', maxWidth: '100%'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{
            background: '#0b0f14', borderRadius: '26px',
            padding: '28px', color: 'white',
            maxHeight: '85vh', overflowY: 'auto'
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Upload Status
              </h2>
              <button onClick={onClose} style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: 'none', background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Status card */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              padding: '16px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px', marginBottom: '20px'
            }}>
              {/* Icon sesuai status */}
              {progress.status === 'available_in_shelby' && (
                <CheckCircle2 size={22} strokeWidth={2} color="#10b981" style={{flexShrink: 0, marginTop: '2px'}} />
              )}
              {progress.status === 'failed' && (
                <AlertCircle size={22} strokeWidth={2} color="#ef4444" style={{flexShrink: 0, marginTop: '2px'}} />
              )}
              {progress.status === 'uploading' && (
                <Loader2 size={22} strokeWidth={2} color="#3b82f6" style={{flexShrink: 0, marginTop: '2px', animation: 'spin 1s linear infinite'}} />
              )}
              {(progress.status === 'transaction_submitted' || 
                progress.status === 'transaction_confirmed' ||
                progress.status === 'indexing_on_shelby') && (
                <Clock size={22} strokeWidth={2} color="#8b5cf6" style={{flexShrink: 0, marginTop: '2px'}} />
              )}
              <div>
                <p style={{
                  fontSize: '0.875rem', fontWeight: 600, margin: '0 0 4px',
                  color: colors.text
                }}>
                  {progress.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  {progress.message}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {progress.status !== 'available_in_shelby' && 
             progress.status !== 'failed' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.75rem', color: '#64748b', marginBottom: '6px'
                }}>
                  <span>Progress</span>
                  <span>{progress.progress}%</span>
                </div>
                <div style={{
                  height: '6px', background: 'rgba(255,255,255,0.06)',
                  borderRadius: '3px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress.progress}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Tx Hash */}
            {progress.txHash && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '0.72rem', color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: '8px', fontWeight: 600
                }}>
                  Transaction Hash
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px'
                }}>
                  <code style={{
                    flex: 1, fontSize: '0.8rem', fontFamily: 'monospace',
                    color: '#94a3b8'
                  }}>
                    {progress.txHash.slice(0, 8)}...{progress.txHash.slice(-6)}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(progress.txHash || '')}
                    style={{
                      background: 'none', border: 'none',
                      color: '#64748b', cursor: 'pointer', padding: '2px'
                    }}
                  >
                    <Copy size={14} strokeWidth={2} />
                  </button>
                  {progress.aptosExplorer && (
                    <a
                      href={progress.aptosExplorer}
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: '#64748b', display: 'flex' }}
                    >
                      <ExternalLink size={14} strokeWidth={2} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Explorer links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {progress.aptosExplorer && (
                <a
                  href={progress.aptosExplorer}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: '10px',
                    color: '#60a5fa', fontSize: '0.875rem',
                    textDecoration: 'none', fontWeight: 500
                  }}
                >
                  <span>View on Aptos Explorer</span>
                  <ExternalLink size={14} strokeWidth={2} />
                </a>
              )}
              {progress.shelbyExplorer && (
                <a
                  href={progress.shelbyExplorer}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: '10px',
                    color: '#34d399', fontSize: '0.875rem',
                    textDecoration: 'none', fontWeight: 500
                  }}
                >
                  <span>{progress.status === 'available_in_shelby'
                    ? 'Open in Shelby Explorer'
                    : 'Check Shelby Explorer'
                  }</span>
                  <ExternalLink size={14} strokeWidth={2} />
                </a>
              )}
            </div>

            {/* Error */}
            {progress.error && (
              <div style={{
                padding: '12px 14px', marginBottom: '16px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px'
              }}>
                <p style={{ fontSize: '0.8rem', color: '#fca5a5', margin: 0 }}>
                  {progress.error}
                </p>
              </div>
            )}

            {/* File info */}
            {blobName && (
              <div style={{
                padding: '12px 14px', marginBottom: '20px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px'
              }}>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 4px' }}>
                  <span style={{ color: '#94a3b8' }}>File: </span>{blobName}
                </p>
                {walletAddress && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontFamily: 'monospace' }}>
                    <span style={{ color: '#94a3b8', fontFamily: 'inherit' }}>Wallet: </span>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {progress.status === 'failed' && (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 20px', borderRadius: '8px',
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#60a5fa', fontSize: '0.85rem',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} strokeWidth={2} />
                  Retry
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: progress.status === 'available_in_shelby'
                    ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                    : 'rgba(255,255,255,0.06)',
                  color: 'white', fontSize: '0.85rem',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {progress.status === 'available_in_shelby' ? 'Done' : 'Close'}
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
