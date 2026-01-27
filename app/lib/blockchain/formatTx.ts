/**
 * Blockchain Transaction Formatting Utilities
 * 
 * Helper functions for formatting blockchain data in notifications
 * with consistent styling and proper explorer links.
 */

/**
 * Shortens a hash/address for display
 * Example: 0x1234567890abcdef -> 0x1234...cdef
 */
export function shortenHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (!hash || hash.length <= startChars + endChars) {
    return hash;
  }
  
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Shortens wallet address for display
 * Uses standard 6+4 format for addresses
 */
export function shortenWallet(wallet: string): string {
  return shortenHash(wallet, 6, 4);
}

/**
 * Shortens transaction hash for display
 * Uses 8+4 format for better readability
 */
export function shortenTxHash(txHash: string): string {
  return shortenHash(txHash, 8, 4);
}

/**
 * Builds transaction explorer URL
 * Priority: Shelby Explorer -> Aptos Explorer
 */
export function buildTxExplorerUrl(txHash: string): string {
  if (!txHash) return '';
  
  // Priority 1: Shelby Explorer (preferred)
  const shelbyExplorer = `https://explorer.shelby.xyz/shelbynet/tx/${txHash}`;
  
  // Priority 2: Aptos Explorer (fallback)
  const aptosExplorer = `https://explorer.aptoslabs.com/txn/${txHash}?network=devnet`;
  
  // Return Shelby Explorer by default
  return shelbyExplorer;
}

/**
 * Builds wallet explorer URL
 */
export function buildWalletExplorerUrl(wallet: string): string {
  if (!wallet) return '';
  
  return `https://explorer.shelby.xyz/shelbynet/account/${wallet}`;
}

/**
 * Validates if a string looks like a valid hash/address
 */
export function isValidHash(hash: string): boolean {
  if (!hash) return false;
  
  // Check if it starts with 0x and has reasonable length
  return /^0x[a-fA-F0-9]{10,}$/.test(hash);
}

/**
 * Validates wallet address format
 */
export function isValidWalletAddress(wallet: string): boolean {
  if (!wallet) return false;
  
  // Aptos addresses are 0x + 64 hex chars
  return /^0x[a-fA-F0-9]{64}$/.test(wallet);
}

/**
 * Extracts transaction hash from various SDK response formats
 * Normalizes different field names to single `txHash` field
 */
export function normalizeTxHash(response: any): string | null {
  if (!response) return null;
  
  // Check various possible field names
  const possibleFields = [
    'txHash',
    'transactionHash', 
    'hash',
    'transaction_hash',
    'tx_hash'
  ];
  
  for (const field of possibleFields) {
    if (response[field] && typeof response[field] === 'string') {
      const hash = response[field];
      if (isValidHash(hash)) {
        return hash;
      }
    }
  }
  
  return null;
}

/**
 * Transaction display component props
 */
export type TransactionDisplayProps = {
  txHash?: string;
  wallet?: string;
  status?: 'success' | 'failed';
  error?: string;
};

/**
 * Generates notification message with transaction info
 */
export function formatNotificationMessage(props: TransactionDisplayProps): {
  title: string;
  message: string;
  txInfo?: {
    hash: string;
    shortHash: string;
    url: string;
  };
  walletInfo?: {
    address: string;
    shortAddress: string;
    url: string;
  };
} {
  const { txHash, wallet, status, error } = props;
  
  // Base message
  let title = '';
  let message = '';
  
  if (status === 'success') {
    title = '✅ Transaksi berhasil';
    message = 'Operasi selesai dengan sukses';
  } else if (status === 'failed') {
    title = '❌ Transaksi gagal';
    message = error || 'Terjadi kesalahan saat memproses transaksi';
  } else {
    title = '⏳ Memproses transaksi';
    message = 'Transaksi sedang diproses';
  }
  
  // Transaction info
  let txInfo;
  if (txHash && isValidHash(txHash)) {
    txInfo = {
      hash: txHash,
      shortHash: shortenTxHash(txHash),
      url: buildTxExplorerUrl(txHash)
    };
  }
  
  // Wallet info
  let walletInfo;
  if (wallet && isValidWalletAddress(wallet)) {
    walletInfo = {
      address: wallet,
      shortAddress: shortenWallet(wallet),
      url: buildWalletExplorerUrl(wallet)
    };
  }
  
  return {
    title,
    message,
    txInfo,
    walletInfo
  };
}
