"use client";

import { motion } from "framer-motion";

export default function CinematicBackground() {
  return (
    <>
      {/* SOFT LIGHT BLOOM */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, rgba(120,180,255,0.18), transparent 70%)",
        }}
      />

      {/* NOISE GRAIN */}
      <div className="noise-layer pointer-events-none fixed inset-0 z-10" />

      {/* FLOATING PARTICLES */}
      <div className="particles pointer-events-none fixed inset-0 z-10">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </>
  );
}
