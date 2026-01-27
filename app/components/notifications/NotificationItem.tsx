"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
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
  const color =
    notification.type === "success"
      ? "border-green-500"
      : notification.type === "error"
      ? "border-red-500"
      : "border-blue-500";

  const textColor =
    notification.type === "success"
      ? "text-green-400"
      : notification.type === "error"
      ? "text-red-400"
      : "text-blue-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        w-[320px] min-h-[60px]
        bg-black/70 backdrop-blur
        border-l-4 ${color}
        rounded-md
        px-3 py-2 flex flex-col
        text-sm text-white
        shadow-lg relative
      `}
    >
      {/* Title */}
      {notification.title && (
        <div className={`font-medium ${textColor} mb-1`}>
          {notification.title}
        </div>
      )}

      {/* Message */}
      <div className="text-white text-xs mb-2">
        {notification.message}
      </div>

      {/* Wallet Info */}
      {notification.wallet && isValidWalletAddress(notification.wallet) && (
        <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
          <span>Wallet:</span>
          <a
            href={buildWalletExplorerUrl(notification.wallet)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
          >
            {shortenWallet(notification.wallet)}
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Transaction Hash */}
      {notification.txHash && isValidHash(notification.txHash) && (
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>Tx:</span>
          <a
            href={buildTxExplorerUrl(notification.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
          >
            {shortenTxHash(notification.txHash)}
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white/60 hover:text-white text-xs"
      >
        ✕
      </button>
    </motion.div>
  );
}
