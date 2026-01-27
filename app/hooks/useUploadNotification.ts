/**
 * Upload Notification Hook
 * 
 * Manages upload notifications with proper state management
 * Integrates with existing notification system
 */

import { useState, useCallback } from "react";
import { useNotificationContext } from "@/components/notifications/NotificationProvider";

export type UploadNotificationState = {
  id: string;
  type: "uploading" | "success" | "error";
  fileName?: string;
  fileSize?: string;
  wallet?: string;
  txHash?: string;
  error?: string;
  progress?: number;
};

export function useUploadNotification() {
  const { notify, remove } = useNotificationContext();
  const [activeUploads, setActiveUploads] = useState<Map<string, UploadNotificationState>>(new Map());

  // Start upload notification
  const startUpload = useCallback((fileName: string, fileSize?: string, wallet?: string) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const uploadState: UploadNotificationState = {
      id,
      type: "uploading",
      fileName,
      fileSize,
      wallet,
      progress: 0,
    };

    setActiveUploads(prev => new Map(prev.set(id, uploadState)));

    // Show initial notification
    notify({
      title: "📤 Mengupload ke Shelby...",
      message: `Sedang mengupload ${fileName} ke Shelby network`,
      type: "info",
      wallet,
    });

    return id;
  }, [notify]);

  // Update upload progress
  const updateProgress = useCallback((id: string, progress: number) => {
    setActiveUploads(prev => {
      const updated = new Map(prev);
      const upload = updated.get(id);
      
      if (upload) {
        updated.set(id, { ...upload, progress });
      }
      
      return updated;
    });
  }, []);

  // Complete upload successfully
  const completeUpload = useCallback((id: string, txHash: string, wallet?: string) => {
    const upload = activeUploads.get(id);
    
    if (!upload) return;

    // Update state
    const completedState: UploadNotificationState = {
      ...upload,
      type: "success",
      txHash,
      progress: 100,
    };

    setActiveUploads(prev => new Map(prev.set(id, completedState)));

    // Show success notification with transaction info
    notify({
      title: "✅ Upload Berhasil",
      message: `File ${upload.fileName} berhasil diupload ke Shelby network`,
      type: "success",
      txHash,
      wallet,
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(id);
        return updated;
      });
    }, 10000);
  }, [activeUploads, notify]);

  // Fail upload
  const failUpload = useCallback((id: string, error: string, txHash?: string, wallet?: string) => {
    const upload = activeUploads.get(id);
    
    if (!upload) return;

    // Update state
    const failedState: UploadNotificationState = {
      ...upload,
      type: "error",
      error,
      txHash,
      progress: 0,
    };

    setActiveUploads(prev => new Map(prev.set(id, failedState)));

    // Show error notification
    notify({
      title: "❌ Upload Gagal",
      message: error || "Terjadi kesalahan saat upload",
      type: "error",
      txHash,
      wallet,
      error,
    });

    // Auto-remove after 15 seconds
    setTimeout(() => {
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(id);
        return updated;
      });
    }, 15000);
  }, [activeUploads, notify]);

  // Remove upload notification
  const removeUpload = useCallback((id: string) => {
    setActiveUploads(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  // Get active upload by ID
  const getUpload = useCallback((id: string) => {
    return activeUploads.get(id);
  }, [activeUploads]);

  // Get all active uploads
  const getAllUploads = useCallback(() => {
    return Array.from(activeUploads.values());
  }, [activeUploads]);

  return {
    // State
    activeUploads: Array.from(activeUploads.values()),
    
    // Actions
    startUpload,
    updateProgress,
    completeUpload,
    failUpload,
    removeUpload,
    
    // Getters
    getUpload,
    getAllUploads,
  };
}
