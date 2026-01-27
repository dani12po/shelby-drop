/**
 * Shelby Explorer Service
 * 
 * Service for fetching data from Shelby Explorer
 * Handles wallet file discovery and metadata extraction
 */

import { shelbyConfig } from "@/config/shelby";

export type ExplorerFile = {
  name: string;
  size?: string;
  type?: string;
  url?: string;
  modified?: string;
};

export type ExplorerSearchResult = {
  files: ExplorerFile[];
  total: number;
  wallet: string;
};

/**
 * Validates wallet address format (Aptos)
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address) return false;
  // Aptos addresses are 0x + 64 hex chars
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Fetches wallet files from Shelby Explorer
 * Parses HTML to extract file information
 */
export async function searchWalletFiles(wallet: string): Promise<ExplorerSearchResult> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  try {
    // Build Shelby Explorer URL
    const explorerUrl = `${shelbyConfig.origin}/${shelbyConfig.shelbyNetwork}/account/${wallet}/blobs`;
    
    const response = await fetch(explorerUrl, {
      headers: {
        'User-Agent': 'Shelby-Drop/1.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Shelby Explorer: ${response.status}`);
    }

    const html = await response.text();
    const files = parseExplorerHTML(html, wallet);
    
    return {
      files,
      total: files.length,
      wallet,
    };
  } catch (error) {
    console.error('Error searching wallet files:', error);
    throw new Error(`Failed to search wallet files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parses Shelby Explorer HTML to extract file information
 * Uses regex patterns to find file data in the HTML
 */
function parseExplorerHTML(html: string, wallet: string): ExplorerFile[] {
  const files: ExplorerFile[] = [];
  
  try {
    // Pattern to match file entries in the HTML
    // This is a fallback method since there's no public API
    const filePattern = /<tr[^>]*>[\s\S]*?<td[^>]*>([^<]+)<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<\/tr>/g;
    
    let match;
    while ((match = filePattern.exec(html)) !== null) {
      const [, name, size, type] = match;
      
      if (name && name.trim()) {
        files.push({
          name: name.trim(),
          size: size.trim() || undefined,
          type: type.trim() || undefined,
          url: getShelbyFileUrl(wallet, name.trim()),
        });
      }
    }
    
    // Fallback: look for any file-like patterns
    if (files.length === 0) {
      const fallbackPattern = /"([^"]+\.[^"]+)"/g;
      const foundNames = new Set<string>();
      
      while ((match = fallbackPattern.exec(html)) !== null) {
        const fileName = match[1];
        if (fileName.includes('.') && !fileName.includes(' ') && fileName.length < 100) {
          foundNames.add(fileName);
        }
      }
      
      Array.from(foundNames).forEach(name => {
        files.push({
          name,
          type: getFileType(name),
          url: getShelbyFileUrl(wallet, name),
        });
      });
    }
  } catch (error) {
    console.error("Error parsing explorer HTML:", error);
  }
  
  return files;
}

/**
 * Determines file type from filename
 */
function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (!ext) return 'unknown';
  
  const typeMap: Record<string, string> = {
    // Images
    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'svg': 'image', 'webp': 'image',
    // Videos
    'mp4': 'video', 'webm': 'video', 'mov': 'video', 'avi': 'video',
    // Audio
    'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio', 'flac': 'audio',
    // Documents
    'pdf': 'document', 'doc': 'document', 'docx': 'document', 'txt': 'document', 'md': 'document',
    // Code
    'js': 'code', 'ts': 'code', 'jsx': 'code', 'tsx': 'code', 'py': 'code', 'rs': 'code', 'go': 'code',
    // Archives
    'zip': 'archive', 'tar': 'archive', 'gz': 'archive', 'rar': 'archive',
  };
  
  return typeMap[ext] || 'file';
}

/**
 * Constructs Shelby Gateway URL for a file
 */
export function getShelbyFileUrl(wallet: string, filename: string): string {
  return `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${wallet}/files/${filename}`;
}
