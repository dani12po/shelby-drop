"use client";

import { motion } from "framer-motion";
import { useNotifications } from "@/components/notifications/useNotifications";

type Props = {
  connected: boolean;
  onUpload: () => void;
};

export default function UploadButton({
  connected,
  onUpload,
}: Props) {
  const { notify } = useNotifications();

  const handleClick = () => {
    if (!connected) {
      notify("info", "Connect your wallet to upload files");
      return;
    }
    onUpload();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="
        px-6 py-2
        rounded-full
        text-sm font-medium
        bg-white/10
        hover:bg-white/20
        transition
      "
    >
      Upload
    </motion.button>
  );
}
