"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function CursorHalo() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  const sx = useSpring(x, { stiffness: 120, damping: 25 });
  const sy = useSpring(y, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 150);
      y.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="
        pointer-events-none fixed top-0 left-0 z-0
        w-[300px] h-[300px] rounded-full
        bg-white/5 blur-[80px]
      "
    />
  );
}
