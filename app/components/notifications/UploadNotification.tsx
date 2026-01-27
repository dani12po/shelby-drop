/**
 * Professional Upload Notification Component
 * 
 * Displays upload success/failure with transaction hash
 * Clickable links to Shelby/Aptos Explorer
 */

import { motion } from "framer-motion";
import { ExternalLink, CheckCircle, XCircle, RefreshCw, X } from "lucide-react";
import { shortenTxHash, shortenWallet, buildTxExplorerUrl, buildWalletExplorerUrl } from "@/lib/blockchain/formatTx";

export type UploadNotificationType = "success" | "error" | "uploading";

export type UploadNotificationProps = {
  type: UploadNotificationType;
  fileName?: string;
  fileSize?: string;
  wallet?: string;
  txHash?: string;
  error?: string;
  onRetry?: () => void;
  onClose?: () => void;
  progress?: number; // 0-100 for uploading state
};

export default function UploadNotification({
  type,
  fileName,
  fileSize,
  wallet,
  txHash,
  error,
  onRetry,
  onClose,
  progress = 0,
}: UploadNotificationProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "uploading":
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Upload Berhasil";
      case "error":
        return "Upload Gagal";
      case "uploading":
        return "Mengupload ke Shelby...";
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-green-500/50";
      case "error":
        return "border-red-500/50";
      case "uploading":
        return "border-blue-500/50";
    }
  };

  const getBgGradient = () => {
    switch (type) {
      case "success":
        return "from-green-500/10 to-transparent";
      case "error":
        return "from-red-500/10 to-transparent";
      case "uploading":
        return "from-blue-500/10 to-transparent";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        relative w-[380px] rounded-xl border
        ${getBorderColor()}
        bg-black/80 backdrop-blur-xl
        overflow-hidden shadow-2xl
      `}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBgGradient()}`} />
      
      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="font-semibold text-white">{getTitle()}</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* File Info */}
        {fileName && (
          <div className="mb-3">
            <div className="text-white font-medium text-sm truncate">{fileName}</div>
            {fileSize && (
              <div className="text-white/60 text-xs">{fileSize}</div>
            )}
          </div>
        )}

        {/* Progress Bar (for uploading) */}
        {type === "uploading" && (
          <div className="mb-3">
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <motion.div
                className="bg-blue-400 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-white/60 text-xs mt-1">{progress}%</div>
          </div>
        )}

        {/* Wallet Info */}
        {wallet && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/60 text-xs">Wallet:</span>
            <a
              href={buildWalletExplorerUrl(wallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-xs underline flex items-center gap-1 transition-colors"
            >
              {shortenWallet(wallet)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/60 text-xs">TX:</span>
            <a
              href={buildTxExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-xs underline flex items-center gap-1 transition-colors"
            >
              {shortenTxHash(txHash)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-xs mb-3 bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {type === "success" && (
          <div className="text-green-400 text-xs mb-3 bg-green-500/10 p-2 rounded">
            File akan muncul di Shelby Explorer dalam beberapa saat
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {type === "error" && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
          
          {type === "success" && (
            <button
              onClick={() => {
                // Open Explorer in new tab
                if (wallet) {
                  window.open(buildWalletExplorerUrl(wallet), '_blank');
                }
              }}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            >
              Buka Explorer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
