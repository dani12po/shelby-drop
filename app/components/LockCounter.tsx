import { motion } from "framer-motion";
import { spring } from "@/lib/motion";

export default function LockCounter({ days }: { days: number }) {
  return (
    <motion.span
      key={days}
      initial={{ y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      className="inline-block font-mono text-xs text-white/70"
    >
      🔒 {days} days
    </motion.span>
  );
}
