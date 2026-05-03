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
        return { 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/20', 
          text: 'text-emerald-500',
          iconColor: '#10b981'
        };
      case 'failed':
        return { 
          bg: 'bg-red-500/10', 
          border: 'border-red-500/20', 
          text: 'text-red-500',
          iconColor: '#ef4444'
        };
      default:
        return { 
          bg: 'bg-violet-500/10', 
          border: 'border-violet-500/20', 
          text: 'text-violet-400',
          iconColor: '#8b5cf6'
        };
    }
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  const colors = getStatusColor(progress.status);

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          className="relative w-full max-w-[480px] p-[2px] rounded-[28px] overflow-hidden pointer-events-auto"
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
          <div className="bg-[var(--bg-modal)] rounded-[26px] text-[var(--text-primary)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Top accent bar */}
            <div 
              className="h-[3px] w-full"
              style={{
                background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#f472b6,#34d399,#fbbf24,#60a5fa,#a78bfa)",
                backgroundSize: "400% 100%",
                animation: "walletBorder 4s linear infinite",
              }} 
            />

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  Upload Status
                </h2>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status card */}
              <div className={`flex items-start gap-4 p-4 rounded-xl mb-6 border ${colors.bg} ${colors.border}`}>
                {/* Icon sesuai status */}
                <div className="mt-0.5 flex-shrink-0">
                  {progress.status === 'available_in_shelby' && (
                    <CheckCircle2 size={22} strokeWidth={2} color={colors.iconColor} />
                  )}
                  {progress.status === 'failed' && (
                    <AlertCircle size={22} strokeWidth={2} color={colors.iconColor} />
                  )}
                  {progress.status === 'uploading' && (
                    <Loader2 size={22} strokeWidth={2} color="#3b82f6" className="animate-spin" />
                  )}
                  {(progress.status === 'transaction_submitted' || 
                    progress.status === 'transaction_confirmed' ||
                    progress.status === 'indexing_on_shelby') && (
                    <Clock size={22} strokeWidth={2} color={colors.iconColor} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-1 ${colors.text}`}>
                    {progress.status.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {progress.message}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {progress.status !== 'available_in_shelby' && 
               progress.status !== 'failed' && (
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              )}

              {/* Tx Hash */}
              {progress.txHash && (
                <div className="mb-6">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">
                    Transaction Hash
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <code className="flex-1 text-xs font-mono text-slate-400 truncate">
                      {progress.txHash}
                    </code>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(progress.txHash || '');
                          // Optional: show toast
                        }}
                        className="p-1.5 text-slate-500 hover:text-white transition-colors"
                        title="Copy Hash"
                      >
                        <Copy size={14} />
                      </button>
                      {progress.aptosExplorer && (
                        <a
                          href={progress.aptosExplorer}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-white transition-colors"
                          title="View on Explorer"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Explorer links */}
              <div className="flex flex-col gap-3 mb-6">
                {progress.aptosExplorer && (
                  <a
                    href={progress.aptosExplorer}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors"
                  >
                    <span>View on Aptos Explorer</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                {progress.shelbyExplorer && (
                  <a
                    href={progress.shelbyExplorer}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors"
                  >
                    <span>{progress.status === 'available_in_shelby'
                      ? 'Open in Shelby Explorer'
                      : 'Check Shelby Explorer'
                    }</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Error */}
              {progress.error && (
                <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl mb-6">
                  <p className="text-xs text-red-400 leading-relaxed">
                    {progress.error}
                  </p>
                </div>
              )}

              {/* File info */}
              {blobName && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">File Name</span>
                      <span className="text-xs text-slate-300 truncate max-w-[200px]">{blobName}</span>
                    </div>
                    {walletAddress && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Wallet</span>
                        <span className="text-xs text-slate-300 font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex gap-3 justify-end">
                {progress.status === 'failed' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    progress.status === 'available_in_shelby'
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {progress.status === 'available_in_shelby' ? 'Done' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
