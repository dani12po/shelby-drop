"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useNotifications } from "./useNotifications";

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

  // SSR-safe: don't render anything on server
  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="
        fixed
        top-[64px]
        right-[24px]
        z-[70]
        flex
        flex-col
        gap-2
        pointer-events-none
        max-h-[calc(100vh-150px)]
        overflow-hidden
        w-[400px]
        max-w-[calc(100vw-48px)]
      "
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
            className="pointer-events-auto"
            onClick={() => remove(n.id)}
          >
            {/* GRADIENT BORDER */}
            <div
              className="
                p-[1px]
                rounded-[12px]
                shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              "
              style={{
                background: GRADIENT,
                backgroundSize: "400% 100%",
                animation: "walletBorder 36s linear infinite",
              }}
            >
              {/* NOTIFICATION BODY */}
              <div
                className="
                  px-4 py-3
                  rounded-[11px]
                  text-sm
                  backdrop-blur-xl
                  bg-[#0b0f14]/95
                  text-white
                  cursor-pointer
                  transition
                  hover:bg-[#0b0f14]
                  min-h-[auto]
                  w-full
                  whitespace-normal
                  break-words
                "
              >
                {n.message}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
