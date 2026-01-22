"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "./useNotifications";

const variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

export default function NotificationCenter() {
  const { notifications, remove } = useNotifications();

  return (
    <div
      className="
        fixed
        top-[64px]
        right-[24px]
        z-[100]
        flex
        flex-col
        gap-2
        pointer-events-none
      "
    >
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`
              pointer-events-auto
              px-4 py-2
              rounded-md
              text-sm
              shadow-lg
              backdrop-blur
              border
              ${
                n.type === "success" &&
                "bg-green-500/20 border-green-400/30 text-green-200"
              }
              ${
                n.type === "error" &&
                "bg-red-500/20 border-red-400/30 text-red-200"
              }
              ${
                n.type === "info" &&
                "bg-blue-500/20 border-blue-400/30 text-blue-200"
              }
              ${
                n.type === "warning" &&
                "bg-yellow-500/20 border-yellow-400/30 text-yellow-200"
              }
            `}
            onClick={() => remove(n.id)}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
