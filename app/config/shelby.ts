/**
 * Shelby Environment Configuration
 * 
 * Centralized environment configuration for Shelby Network integration
 * All configuration values are read from process.env
 */

export const shelbyConfig = {
  // Network configuration
  aptosNetwork: process.env.APTOS_NETWORK || 'devnet',
  shelbyNetwork: process.env.SHELBY_NETWORK || 'shelbynet',
  
  // Account configuration (server-side only)
  accountAddress: process.env.SHELBY_ACCOUNT_ADDRESS || '',
  accountPrivateKey: process.env.SHELBY_ACCOUNT_PRIVATE_KEY || '',
  
  // API configuration
  apiKey: process.env.SHELBY_API_KEY || '',
  
  // Aptos API endpoints
  aptosNodeUrl: process.env.APTOS_NODE_URL || 'https://api.shelbynet.shelby.xyz/v1',
  aptosIndexerUrl: process.env.APTOS_INDEXER_URL || 'https://api.shelbynet.shelby.xyz/v1/graphql',
  
  // Explorer URLs
  aptosExplorerBase: process.env.APTOS_EXPLORER_BASE || 'https://explorer.aptoslabs.com',
  shelbyExplorerBase: process.env.SHELBY_EXPLORER_BASE || 'https://explorer.shelby.xyz/shelbynet',
  
  // Shelby configuration
  signingSecret: process.env.SHELBY_SIGNING_SECRET || '',
  endpoint: process.env.SHELBY_ENDPOINT || 'https://gateway.shelby.xyz',
  bucket: process.env.SHELBY_BUCKET || 'shelby-drop',
  origin: process.env.SHELBY_ORIGIN || 'https://explorer.shelby.xyz',
  
  // Helper methods
  getTransactionUrl: (txHash: string) => {
    const baseUrl = process.env.APTOS_EXPLORER_BASE || 'https://explorer.aptoslabs.com';
    const network = process.env.APTOS_NETWORK || 'devnet';
    return `${baseUrl}/txn/${txHash}?network=${network}`;
  },
  
  getExplorerUrl: (walletAddress: string) => {
    const baseUrl = process.env.SHELBY_EXPLORER_BASE || 'https://explorer.shelby.xyz/shelbynet';
    return `${baseUrl}/account/${walletAddress}`;
  },
  
  getShelbyTransactionUrl: (txHash: string) => {
    const baseUrl = process.env.SHELBY_EXPLORER_BASE || 'https://explorer.shelby.xyz/shelbynet';
    return `${baseUrl}/tx/${txHash}`;
  },
  
  getFileUrl: (wallet: string, filename: string) => {
    const gateway = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || 'https://gateway.shelby.xyz';
    return `${gateway}/${wallet}/${filename}`;
  }
};

// Validation helpers
export const validateConfig = () => {
  const required = [
    'SHELBY_ACCOUNT_ADDRESS',
    'SHELBY_ACCOUNT_PRIVATE_KEY',
    'SHELBY_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

export default shelbyConfig;
