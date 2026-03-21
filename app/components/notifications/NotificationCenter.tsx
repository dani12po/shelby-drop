"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useNotifications } from "./useNotifications";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

// Helper function for notification style
function getNotifStyle(type?: string) {
  switch(type) {
    case 'success': return {
      icon: <CheckCircle2 size={16} strokeWidth={2} color="#10b981" />,
      accent: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)'
    }
    case 'error': return {
      icon: <AlertCircle size={16} strokeWidth={2} color="#ef4444" />,
      accent: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)'
    }
    default: return {
      icon: <Info size={16} strokeWidth={2} color="#3b82f6" />,
      accent: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.2)'
    }
  }
}

const variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

export default function NotificationCenter() {
  const { notifications, remove } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR-safe: don't Render anything on server
  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '8px',
        width: '360px',
        maxWidth: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}
    >
      <AnimatePresence>
        {notifications.slice(-3).map((n) => ( // Max 3 notifications
          <motion.div
            key={n.id}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ pointerEvents: 'auto' }}
            onClick={() => remove(n.id)}
          >
            {/* NOTIFICATION BODY */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '11px',
              background: '#0b0f14',
              border: `1px solid ${getNotifStyle(n.type).border}`,
              backdropFilter: 'blur(20px)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
              {/* Accent line kiri */}
              <div style={{
                width: '3px', height: '100%', minHeight: '20px',
                borderRadius: '2px', flexShrink: 0,
                background: getNotifStyle(n.type).accent
              }} />
              
              {/* Icon */}
              <div style={{ flexShrink: 0, marginTop: '1px' }}>
                {getNotifStyle(n.type).icon}
              </div>
              
              {/* Message */}
              <p style={{
                flex: 1, fontSize: '0.825rem', color: '#e2e8f0',
                margin: 0, lineHeight: 1.5
              }}>
                {n.message}
              </p>
              
              {/* Close */}
              <button
                onClick={e => { e.stopPropagation(); remove(n.id) }}
                style={{
                  flexShrink: 0, background: 'none', border: 'none',
                  color: '#475569', cursor: 'pointer', padding: '2px',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
