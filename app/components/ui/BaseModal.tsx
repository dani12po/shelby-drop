"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "w-[380px] max-w-[90vw]",
  md: "w-[500px] max-w-[90vw]", 
  lg: "w-[700px] max-w-[90vw]",
  xl: "w-[900px] max-w-[90vw]",
  full: "w-[95vw] max-w-[1200px]",
};

const heightClasses = {
  sm: "h-auto max-h-[80vh]",
  md: "h-auto max-h-[80vh]", 
  lg: "h-auto max-h-[85vh]",
  xl: "h-auto max-h-[85vh]",
  full: "h-[85vh] max-h-[90vh]",
};

export default function BaseModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe: don't render anything on server
  if (!mounted) {
    return null;
  }

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <>
        {/* BACKDROP */}
        <motion.div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* GRADIENT BORDER */}
        <motion.div
          className={`
            fixed z-50
            top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            rounded-[28px]
            p-[2px]
            ${sizeClasses[size]}
          `}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            background: GRADIENT,
            backgroundSize: "400% 100%",
            animation: "walletBorder 36s linear infinite",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL BODY */}
          <div
            className={`
              ${sizeClasses[size]}
              ${heightClasses[size]}
              rounded-[26px]
              bg-[#0b0f14]
              text-white
              shadow-[0_30px_120px_rgba(0,0,0,0.7)]
              flex flex-col
              overflow-hidden
              ${className}
            `}
          >
            {/* HEADER */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-semibold text-white">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <div className="text-sm text-white/60 mt-1">
                      {subtitle}
                    </div>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* CONTENT */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}
