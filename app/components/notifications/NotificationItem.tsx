"use client";

import { motion } from "framer-motion";
import { Notification } from "./NotificationProvider";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        w-[280px] h-[50px]
        bg-black/70 backdrop-blur
        border-l-4 ${color}
        rounded-md
        px-3 flex items-center
        text-sm text-white
        shadow-lg
      `}
    >
      <span className="flex-1 truncate">
        {notification.message}
      </span>

      <button
        onClick={onClose}
        className="ml-2 text-white/60 hover:text-white"
      >
        ✕
      </button>
    </motion.div>
  );
}
