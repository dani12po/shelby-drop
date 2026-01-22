"use client";

import { motion } from "framer-motion";
import { spring } from "@/app/lib/motion";
import { useState } from "react";

export default function UploadBox() {
  const [days, setDays] = useState(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="mt-6 flex items-center gap-3"
    >
      <label className="text-xs text-white/60">
        <input type="file" className="hidden" />
        <span className="cursor-pointer underline">Choose file</span>
      </label>

      <input
        type="number"
        min={3}
        max={99999}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="
          w-[80px] px-2 py-1 rounded
          bg-white/10 text-white text-sm
          outline-none
        "
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        className="
          px-4 py-2 rounded-full
          bg-white text-black text-sm
        "
      >
        Upload
      </motion.button>
    </motion.div>
  );
}
