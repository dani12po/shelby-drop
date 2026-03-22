"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useExplorerModalController } from "@/components/explorer/core/useExplorerModalController";
import { useWalletSearch } from "@/hooks/useWalletSearch";
import { 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Code, 
  Archive, 
  File,
  ExternalLink,
  Loader2,
  AlertCircle,
  FolderOpen,
  Copy,
  Check
} from "lucide-react";
import type { ExplorerFile } from "@/lib/shelby/explorerService";

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

type Props = {
  wallet: string;
  onClose: () => void;
  onViewFile?: (file: any) => void;
};

export default function WalletSearchModal({
  wallet,
  onClose,
  onViewFile,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const { openExplorer } = useExplorerModalController();
  const { state, result, error, searchWallet, isLoading, hasResults, isEmpty, hasError } = useWalletSearch();

  // Set mounted state and portal target
  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.body);
  }, []);

  // Separate effect for search to avoid auto-search bug
  useEffect(() => {
    if (mounted && wallet) {
      searchWallet(wallet);
    }
  }, [wallet, mounted, searchWallet]);

  if (!mounted || !portalTarget) return null;
  
  // Validate wallet before rendering
  if (!wallet || wallet.length < 10) return null;

  const handleOpenExplorer = () => {
    openExplorer({ wallet });
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'image': 
        return <Image className="w-5 h-5 text-purple-400" />;
      case 'video': 
        return <Video className="w-5 h-5 text-pink-400" />;
      case 'audio': 
        return <Music className="w-5 h-5 text-green-400" />;
      case 'code': 
        return <Code className="w-5 h-5 text-blue-400" />;
      case 'archive': 
        return <Archive className="w-5 h-5 text-yellow-400" />;
      case 'document': 
        return <FileText className="w-5 h-5 text-white/70" />;
      default: 
        return <File className="w-5 h-5 text-white/50" />;
    }
  };

  return createPortal(
    <>
      {/* BACKDROP */}
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
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
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
          zIndex: 60,
          borderRadius: '28px',
          padding: '2px',
          background: 'linear-gradient(90deg, #7dd3fc, #a78bfa, #f472b6, #34d399, #fbbf24, #60a5fa, #a78bfa)',
          backgroundSize: '400% 100%',
          animation: 'walletBorder 4s linear infinite',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL BODY */}
        <div
          className="
            w-[600px]
            min-h-[400px]
            max-h-[80vh]
            rounded-[26px]
            bg-[var(--bg-modal)]
            text-[var(--text-primary)]
            shadow-[0_30px_120px_rgba(0,0,0,0.7)]
            flex flex-col
            overflow-hidden
          "
        >
          {/* SAFE INNER PADDING */}
          <div className="flex flex-col h-full p-[15px]">
            {/* HEADER - centered */}
            <div style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: '15px', top: '15px' }}>
                <button
                  onClick={onClose}
                  style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px', border: 'none',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#94a3b8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
                Wallet Files
              </h2>
              <p style={{
                fontSize: '0.78rem', color: '#64748b',
                fontFamily: 'monospace', marginTop: '6px'
              }}>
                View & Download Files
              </p>
              <button
                onClick={handleCopy}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  marginTop: '6px', background: 'none', border: 'none',
                  color: copied ? '#10b981' : '#475569',
                  fontSize: '0.72rem', cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                {copied
                  ? <><Check size={12} strokeWidth={2.5} /> Copied!</>
                  : <><Copy size={12} strokeWidth={2} /> Copy address</>
                }
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 px-6 overflow-auto">
              <div className="mb-4 text-xs text-white/50">
                {result?.total || 0} files found
              </div>

              {isLoading && (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-400 animate-spin" />
                  <div className="text-sm text-white/60">Loading files...</div>
                </div>
              )}

              {isEmpty && (
                <div className="py-16 text-center">
                  <FolderOpen className="mx-auto mb-4 w-12 h-12 text-white/20" />
                  <div className="text-sm text-white/60">No files found for this wallet</div>
                </div>
              )}

              {hasError && (
                <div className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-400" />
                  <div className="text-sm text-red-400 mb-2">Failed to load files</div>
                  <div className="text-xs text-white/40">{error}</div>
                </div>
              )}

              {hasResults && (
                <div className="space-y-3">
                  {result!.files.map((file: ExplorerFile, index: number) => (
                    <div 
                      key={index} 
                      className="
                        group
                        relative
                        p-4
                        rounded-xl
                        bg-white/[0.03]
                        border border-white/[0.06]
                        hover:bg-white/[0.06]
                        hover:border-white/[0.1]
                        transition-all
                        cursor-pointer
                      "
                    >
                      <div className="flex items-center gap-4">
                        {/* ICON */}
                        <div className="
                          w-12 h-12 
                          rounded-lg 
                          bg-white/[0.05] 
                          flex items-center justify-center
                          border border-white/[0.06]
                        ">
                          {getFileIcon(file.type)}
                        </div>

                        {/* FILE INFO */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {file.name}
                          </div>
                          {file.size && (
                            <div className="text-xs text-white/50">
                              {file.size}
                            </div>
                          )}
                        </div>

                        {/* VIEW BUTTON */}
                        {onViewFile && (
                          <button
                            onClick={() => onViewFile(file)}
                            className="
                              px-4 py-2 
                              rounded-lg 
                              text-xs font-medium
                              bg-white/10 hover:bg-white/20
                              text-white/80 hover:text-white
                              transition-colors
                            "
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-6 pb-4 flex flex-col gap-2">
              <button
                onClick={handleOpenExplorer}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Open Explorer
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  borderRadius: '10px',
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
    </>,
    document.body
  );
}
