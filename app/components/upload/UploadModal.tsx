"use client";

import { useState } from "react";
import BaseModal from "@/components/ui/BaseModal";
import { UploadResultModal } from "./UploadResultModal";
import { UploadProgress, UploadStatus } from "@/lib/shelby/uploadPollingService";

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
  const [days, setDays] = useState(7); // Default 7 days
  const [isUploading, setIsUploading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadProgress | null>(null);

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('blobName', `${Date.now()}-${file.name}`);
      formData.append('retentionDays', days.toString());
      formData.append('wallet', wallet);

      // Initial progress
      setUploadResult({
        status: 'uploading',
        message: 'Uploading file to Shelby network...',
        progress: 10,
      });

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Success - show result modal with verification
        setUploadResult({
          status: 'transaction_submitted',
          txHash: result.data.txHash,
          aptosExplorer: result.data.explorerUrls.aptos,
          shelbyExplorer: result.data.explorerUrls.shelby,
          message: 'Transaction submitted to blockchain',
          progress: 25,
        });

        setShowResultModal(true);
        
        // Close upload modal
        onClose();
        
      } else {
        // Failed
        setUploadResult({
          status: 'failed',
          message: 'Upload failed',
          progress: 0,
          error: result.error || 'Unknown error',
          stage: result.stage,
        });

        setShowResultModal(true);
      }

    } catch (error) {
      console.error('Upload error:', error);
      
      setUploadResult({
        status: 'failed',
        message: 'Upload failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Network error',
      });

      setShowResultModal(true);
      
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
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
              disabled={isUploading}
            />
            <div className="cursor-pointer rounded-lg bg-white/10 py-3 text-center hover:bg-white/20 transition-colors disabled:opacity-50">
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
              disabled={isUploading}
              className="w-[90px] rounded-md bg-white/10 px-2 py-1 text-center disabled:opacity-50"
            />
          </div>

          {/* FILE INFO */}
          {file && (
            <div className="text-xs text-gray-400">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-6 flex flex-col items-center gap-[10px] -m-6">
          <button
            disabled={isUploading || !file}
            onClick={handleUpload}
            className="
              w-full py-3 px-6 rounded-xl bg-white text-black font-semibold
              hover:bg-gray-100 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isUploading ? 'Uploading...' : 'Upload to Shelby'}
          </button>
          
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </BaseModal>

      {/* RESULT MODAL */}
      {uploadResult && (
        <UploadResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          initialProgress={uploadResult}
          txHash={uploadResult.txHash}
          blobName={file?.name}
          walletAddress={wallet}
        />
      )}
    </>
  );
}
