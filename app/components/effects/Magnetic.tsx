"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode } from "react";

export default function Magnetic({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - rect.width / 2;
    const dy = e.clientY - rect.top - rect.height / 2;
    x.set(dx * 0.15);
    y.set(dy * 0.15);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={move}
      onMouseLeave={reset}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}
