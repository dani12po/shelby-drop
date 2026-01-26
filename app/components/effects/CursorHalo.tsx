"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function CursorHalo() {
  const [mounted, setMounted] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);

  const sx = useSpring(x, { stiffness: 120, damping: 25 });
  const sy = useSpring(y, { stiffness: 120, damping: 25 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // SSR-safe: only add event listeners on client
    if (!mounted) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX - 150);
      y.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mounted, x, y]);

  // SSR-safe: don't render on server
  if (!mounted) {
    return null;
  }

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
