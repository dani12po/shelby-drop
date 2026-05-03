"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Copy, Check, Link2 } from "lucide-react";

type Props = {
  url: string;
  onClose: () => void;
};

export default function ShareModal({ url, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <>
        {/* BACKDROP */}
        <motion.div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* GRADIENT BORDER */}
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            className="relative p-[2px] rounded-[28px] bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite] pointer-events-auto"
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* MODAL BODY */}
          <div
            className="
              w-[360px]
              max-w-[calc(100vw-32px)]
              rounded-[26px]
              bg-[var(--bg-modal)]
              text-[var(--text-primary)]
              flex flex-col
              overflow-hidden
            "
          >
            {/* Top accent bar */}
            <div className="h-[3px] shrink-0 bg-gradient-to-r from-sky-300 via-violet-400 to-blue-400 bg-[length:400%_100%] animate-[walletBorder_4s_linear_infinite]" />

            {/* SAFE INNER PADDING */}
            <div className="p-5 flex flex-col">
              {/* HEADER */}
              <div className="flex items-center justify-between pb-5">
                <div className="flex-1 text-center">
                  <h2 className="text-lg font-semibold m-0">
                    Share this file
                  </h2>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 rounded-lg border-none bg-white/5 text-slate-400 cursor-pointer flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="flex-1 flex flex-col gap-3">
                {/* URL display */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl mb-3">
                  <Link2 size={14} strokeWidth={2} className="text-slate-500 shrink-0" />
                  <input
                    value={url} 
                    readOnly
                    className="flex-1 bg-transparent border-none text-slate-400 text-xs font-mono outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                  />
                </div>

                {/* Copy button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(url)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className={`
                    w-full p-3 rounded-xl font-semibold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 mb-2
                    ${copied 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500' 
                      : 'bg-gradient-to-r from-violet-500 to-blue-500 text-white border-none hover:opacity-90'
                    }
                  `}
                >
                  {copied
                    ? <><Check size={16} strokeWidth={2.5} /> Copied!</>
                    : <><Copy size={16} strokeWidth={2} /> Copy Link</>
                  }
                </button>

                {/* Cancel */}
                <button 
                  onClick={onClose} 
                  className="w-full p-2.5 bg-transparent border-none text-slate-500 text-xs cursor-pointer transition-colors hover:text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </>
    </AnimatePresence>,
    document.body
  );
}
