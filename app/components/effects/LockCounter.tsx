"use client";

import { motion } from "framer-motion";

export default function LockCounter({
  days,
}: {
  days: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
      }}
      className="text-sm text-white/70"
    >
      Locked for {days} days
    </motion.div>
  );
}
