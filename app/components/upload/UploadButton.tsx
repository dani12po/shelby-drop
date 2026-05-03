"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";

type Props = {
  connected: boolean;
  onUpload: () => void;
};

export default function UploadButton({
  connected,
  onUpload,
}: Props) {
  // If not connected, don't render anything
  if (!connected) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onUpload}
      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-all"
    >
      <Upload size={16} strokeWidth={2} />
      Upload File
    </motion.button>
  );
}
