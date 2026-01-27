/**
 * Production-Ready Upload Result UI Component
 * 
 * Displays comprehensive upload status with:
 * - Real-time progress updates
 * - Transaction hash with clickable link
 * - Explorer integration
 * - Professional status states
 * - No UI lies - only verified success
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, ExternalLink, Loader2, X } from 'lucide-react';
import { 
  UploadProgress, 
  UploadStatus, 
  UploadPollingService 
} from '@/lib/shelby/uploadPollingService';

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgress?: UploadProgress;
  txHash?: string;
  blobName?: string;
  walletAddress?: string;
}

export function UploadResultModal({
  isOpen,
  onClose,
  initialProgress,
  txHash,
  blobName,
  walletAddress,
}: UploadResultModalProps) {
  const [progress, setProgress] = useState<UploadProgress>(
    initialProgress || {
      status: 'uploading',
      message: 'Initializing upload...',
      progress: 0,
    }
  );
  
  const [isPolling, setIsPolling] = useState(false);
  const [pollingService] = useState(() => new UploadPollingService());

  // Start polling when modal opens with transaction hash
  useEffect(() => {
    if (isOpen && txHash && blobName && walletAddress && !isPolling) {
      setIsPolling(true);
      startPolling();
    }
  }, [isOpen, txHash, blobName, walletAddress]);

  const startPolling = async () => {
    if (!txHash || !blobName || !walletAddress) return;

    try {
      const result = await pollingService.verifyUpload(
        txHash,
        blobName,
        walletAddress,
        (update) => setProgress(update)
      );

      setProgress(result);
    } catch (error) {
      setProgress({
        status: 'failed',
        message: 'Verification failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsPolling(false);
    }
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'available_in_shelby':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'transaction_confirmed':
        return <CheckCircle2 className="w-6 h-6 text-blue-500" />;
      case 'indexing_on_shelby':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'available_in_shelby':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'transaction_confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'indexing_on_shelby':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getShortTxHash = (hash: string) => {
    if (!hash || hash.length < 10) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Status
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Display */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor(progress.status)}`}>
            {getStatusIcon(progress.status)}
            <div className="flex-1">
              <div className="font-medium capitalize">
                {progress.status.replace('_', ' ')}
              </div>
              <div className="text-sm opacity-75">
                {progress.message}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {progress.status !== 'available_in_shelby' && progress.status !== 'failed' && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {progress.txHash && (
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Transaction Hash
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono text-gray-800">
                  {getShortTxHash(progress.txHash)}
                </code>
                <a
                  href={progress.aptosExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Explorer Links */}
          <div className="mt-6 space-y-3">
            {progress.aptosExplorer && (
              <a
                href={progress.aptosExplorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-sm font-medium text-blue-900">
                  View on Aptos Explorer
                </span>
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </a>
            )}

            {progress.shelbyExplorer && (
              <a
                href={progress.shelbyExplorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <span className="text-sm font-medium text-green-900">
                  {progress.status === 'available_in_shelby' 
                    ? 'Open in Shelby Explorer' 
                    : 'Check Shelby Explorer'
                  }
                </span>
                <ExternalLink className="w-4 h-4 text-green-600" />
              </a>
            )}
          </div>

          {/* Error Display */}
          {progress.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {progress.error}
              </div>
            </div>
          )}

          {/* File Info */}
          {blobName && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <strong>File:</strong> {blobName}
              </div>
              {walletAddress && (
                <div className="text-sm text-gray-600">
                  <strong>Wallet:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            {progress.status === 'failed' && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Upload
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
