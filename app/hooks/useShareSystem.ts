"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  createShare, 
  getShareMapping, 
  createShareUrl, 
  parseShareUrl, 
  cleanupExpiredShares,
  type ShareCode,
  type ShareMapping 
} from "@/lib/share/shareService";

export function useShareSystem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareCode, setShareCode] = useState<ShareCode | null>(null);
  const [shareMapping, setShareMapping] = useState<ShareMapping | null>(null);
  const [isProcessingShare, setIsProcessingShare] = useState(false);

  // Check for share code in URL on mount
  useEffect(() => {
    // Cleanup expired shares first
    cleanupExpiredShares();

    // Check if there's a share code in the URL
    const urlCode = searchParams?.get('share') || 
                    parseShareUrl(window.location.href) ||
                    parseShareUrl(window.location.pathname);

    if (urlCode) {
      setIsProcessingShare(true);
      const mapping = getShareMapping(urlCode);
      
      if (mapping) {
        setShareCode(urlCode);
        setShareMapping(mapping);
        
        // Auto-open the shared file
        handleOpenSharedFile(mapping);
      } else {
        // Invalid or expired share code
        console.warn('Invalid or expired share code:', urlCode);
      }
      
      setIsProcessingShare(false);
    }
  }, [searchParams, router]);

  /**
   * Creates a share for a file
   */
  const createFileShare = (wallet: string, filename: string): string => {
    const code = createShare(wallet, filename);
    const url = createShareUrl(code);
    
    // Copy to clipboard
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        console.log('Share URL copied to clipboard:', url);
      }).catch(err => {
        console.error('Failed to copy share URL:', err);
      });
    }
    
    return url;
  };

  /**
   * Handles opening a shared file
   */
  const handleOpenSharedFile = (mapping: ShareMapping) => {
    // This will be handled by the ExplorerPage component
    // We just emit an event or update state here
    console.log('Opening shared file:', mapping);
  };

  /**
   * Clears the current share
   */
  const clearShare = () => {
    setShareCode(null);
    setShareMapping(null);
    
    // Update URL to remove share parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    router.replace(url.pathname + url.search);
  };

  return {
    shareCode,
    shareMapping,
    isProcessingShare,
    createFileShare,
    clearShare,
    hasActiveShare: !!shareMapping,
  };
}
