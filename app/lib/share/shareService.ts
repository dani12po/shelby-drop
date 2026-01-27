/**
 * Share System for Shelby Drop
 * 
 * This system allows users to share files using short links
 * and handles deep linking for shared files.
 */

export type ShareCode = string;
export type ShareMapping = {
  wallet: string;
  filename: string;
  createdAt: string;
  expiresAt?: string;
};

const SHARE_CODE_LENGTH = 8;
const SHARE_STORAGE_KEY = 'shelby-drop-shares';

/**
 * Generates a random share code
 */
function generateShareCode(): ShareCode {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < SHARE_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a share mapping for a file
 */
export function createShare(wallet: string, filename: string): ShareCode {
  const code = generateShareCode();
  const mapping: ShareMapping = {
    wallet,
    filename,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  // Get existing shares
  const existingShares = getStoredShares();
  
  // Add new share
  existingShares[code] = mapping;
  
  // Save to localStorage
  try {
    localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(existingShares));
  } catch (error) {
    console.error('Failed to save share mapping:', error);
  }

  return code;
}

/**
 * Retrieves a share mapping by code
 */
export function getShareMapping(code: ShareCode): ShareMapping | null {
  try {
    const shares = getStoredShares();
    const mapping = shares[code];
    
    if (!mapping) {
      return null;
    }

    // Check if expired
    if (mapping.expiresAt && new Date(mapping.expiresAt) < new Date()) {
      // Remove expired share
      delete shares[code];
      localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
      return null;
    }

    return mapping;
  } catch (error) {
    console.error('Failed to retrieve share mapping:', error);
    return null;
  }
}

/**
 * Gets all stored shares from localStorage
 */
function getStoredShares(): Record<string, ShareMapping> {
  try {
    const stored = localStorage.getItem(SHARE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse stored shares:', error);
    return {};
  }
}

/**
 * Creates a share URL for a file
 */
export function createShareUrl(code: ShareCode, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
  return `${base}/${code}`;
}

/**
 * Parses a share URL to extract the share code
 */
export function parseShareUrl(url: string): ShareCode | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Look for a share code pattern in the path
    for (const part of pathParts) {
      if (part.length === SHARE_CODE_LENGTH && /^[A-Za-z0-9]+$/.test(part)) {
        return part;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Cleans up expired shares
 */
export function cleanupExpiredShares(): void {
  try {
    const shares = getStoredShares();
    const now = new Date();
    let hasChanges = false;

    for (const [code, mapping] of Object.entries(shares)) {
      if (mapping.expiresAt && new Date(mapping.expiresAt) < now) {
        delete shares[code];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
    }
  } catch (error) {
    console.error('Failed to cleanup expired shares:', error);
  }
}
