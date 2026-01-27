/**
 * Shelby Explorer Data Adapter
 * 
 * This adapter converts Shelby Explorer data to the ExplorerItem format
 * used by the Explorer component.
 */

import type { ExplorerItem, ExplorerFileItem } from "@/types/explorer";
import type { FileItemData, FolderItem } from "@/lib/data";
import { searchWalletFiles, getShelbyFileUrl } from "@/lib/shelby/explorerService";

/**
 * Gets MIME type from filename
 */
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'svg': 'image/svg+xml', 'webp': 'image/webp',
    // Videos
    'mp4': 'video/mp4', 'webm': 'video/webm', 'mov': 'video/quicktime', 'avi': 'video/x-msvideo',
    // Audio
    'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg', 'flac': 'audio/flac',
    // Documents
    'pdf': 'application/pdf', 'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'txt': 'text/plain', 'md': 'text/markdown',
    // Code
    'js': 'text/javascript', 'ts': 'text/typescript', 'jsx': 'text/jsx', 'tsx': 'text/tsx', 'py': 'text/x-python', 'rs': 'text/x-rust', 'go': 'text/x-go',
    // Archives
    'zip': 'application/zip', 'tar': 'application/x-tar', 'gz': 'application/gzip', 'rar': 'application/x-rar-compressed',
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Converts Shelby files to ExplorerItem format
 */
export function adaptShelbyFilesToExplorerItems(
  wallet: string,
  shelbyFiles: Array<{ name: string; size?: string; type?: string }>
): ExplorerItem[] {
  return shelbyFiles.map((file, index) => {
    // Create FileItemData structure
    const fileData: FileItemData = {
      id: `shelby-${index}`,
      type: "file",
      name: file.name,
      path: [], // Shelby files are in root
      size: parseSize(file.size) || 0,
      mimeType: getMimeType(file.name),
      uploader: wallet,
      expiresAt: undefined, // Shelby files don't expire
      uploadedAt: new Date().toISOString(),
    };

    // Convert to ExplorerFileItem
    const explorerItem: ExplorerFileItem = {
      id: fileData.id,
      kind: "file",
      name: fileData.name,
      path: fileData.name, // Use filename as path since Shelby files are in root
      size: fileData.size,
      mimeType: fileData.mimeType || "application/octet-stream",
    };

    return explorerItem;
  });
}

/**
 * Parses size string to bytes
 */
function parseSize(sizeStr?: string): number | undefined {
  if (!sizeStr) return undefined;

  const units: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
  };

  const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
  if (!match) return undefined;

  const [, value, unit] = match;
  return Math.floor(parseFloat(value) * (units[unit.toUpperCase()] || 1));
}

/**
 * Loads wallet files from Shelby Explorer
 */
export async function loadWalletFilesFromShelby(wallet: string): Promise<{
  items: ExplorerItem[];
  rawItems: (FileItemData | FolderItem)[];
}> {
  try {
    // Search for files in Shelby Explorer
    const searchResult = await searchWalletFiles(wallet);
    
    // Convert to ExplorerItem format
    const explorerItems = adaptShelbyFilesToExplorerItems(wallet, searchResult.files);
    
    // Create raw items for compatibility - convert ExplorerFileItem back to FileItemData
    const rawItems: FileItemData[] = explorerItems.map((item) => {
      if (item.kind === 'file') {
        const fileItem: FileItemData = {
          id: item.id,
          type: "file",
          name: item.name,
          path: [], // Shelby files are in root
          size: item.size,
          mimeType: item.mimeType,
          uploader: wallet,
          uploadedAt: new Date().toISOString(),
        };
        return fileItem;
      }
      // This should never happen since we only create file items
      throw new Error('Unexpected folder item in Shelby adapter');
    });
    
    return {
      items: explorerItems,
      rawItems,
    };
  } catch (error) {
    console.error("Failed to load wallet files from Shelby:", error);
    // Return empty result on error
    return {
      items: [],
      rawItems: [],
    };
  }
}
