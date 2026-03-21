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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 24px',
        borderRadius: '30px',
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 20px rgba(139,92,246,0.3)'
      }}
    >
      <Upload size={16} strokeWidth={2} />
      Upload File
    </motion.button>
  );
}
