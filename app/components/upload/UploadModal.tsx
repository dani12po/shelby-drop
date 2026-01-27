"use client";

import { useState } from "react";
import BaseModal from "@/components/ui/BaseModal";
import { uploadToShelbyCli } from "@/lib/shelby/cliUploadService";
import { useUploadNotification } from "@/hooks/useUploadNotification";

type Props = {
  wallet: string;
  onClose: () => void;
  onUploaded: (url: string) => void;
};

export default function UploadModal({
  wallet,
  onClose,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [days, setDays] = useState(7); // Default 7 days like CLI
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  
  const { startUpload, updateProgress, completeUpload, failUpload, removeUpload } = useUploadNotification();

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    
    // Start upload notification
    const id = startUpload(
      file.name,
      `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      wallet
    );
    
    setUploadId(id);

    try {
      // Update progress: Signing transaction
      updateProgress(id, 20);
      
      const result = await uploadToShelbyCli({
        file,
        wallet,
        retentionDays: days,
      });

      // Update progress: Uploading to Shelby
      updateProgress(id, 60);

      if (result.success && result.data) {
        // Update progress: Finalizing
        updateProgress(id, 90);
        
        // Complete upload with transaction hash
        completeUpload(id, result.data.txHash, result.data.userWallet);
        
        // Trigger Explorer refresh
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("explorer:refresh"));
        }

        // Call success callback
        onUploaded(result.data.blobName);
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
        
      } else {
        // Fail upload with error
        failUpload(id, result.error || "Upload failed", undefined, wallet);
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      // Fail upload with error
      failUpload(
        id, 
        error instanceof Error ? error.message : "Network error - coba lagi beberapa saat",
        undefined,
        wallet
      );
    } finally {
      setIsUploading(false);
      updateProgress(id || '', 100);
    }
  }

  function handleRetry() {
    if (uploadId) {
      removeUpload(uploadId);
      setUploadId(null);
    }
    handleUpload();
  }

  return (
    <BaseModal
      open={true}
      onClose={onClose}
      title="Shelby Drop Upload"
      subtitle={wallet}
      size="sm"
    >
      {/* CONTENT */}
      <div className="space-y-5">
        {/* FILE PICKER */}
        <label className="block text-sm">
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="cursor-pointer rounded-lg bg-white/10 py-3 text-center">
            {file ? file.name : "Choose file"}
          </div>
        </label>

        {/* DAYS */}
        <div className="flex items-center justify-between text-sm">
          <span>Storage days</span>
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(+e.target.value)}
            className="w-[90px] rounded-md bg-white/10 px-2 py-1 text-center"
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-6 flex flex-col items-center gap-[10px] -m-6">
        <button
          disabled={isUploading || !file}
          onClick={handleUpload}
          className="
            w-full
            rounded-full
            bg-white
            hover:bg-white/90
            transition
            py-3
            text-sm font-medium
            text-black
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {isUploading ? "Uploading to Shelby..." : "Upload to Shelby"}
        </button>

        <button
          onClick={onClose}
          className="
            w-full
            rounded-full
            text-xs
            text-white/50
            py-2
            hover:text-white/70
            transition
          "
        >
          Cancel
        </button>
      </div>
    </BaseModal>
  );
}
