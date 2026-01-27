/**
 * Shelby Environment Configuration
 * 
 * Centralized environment configuration for Shelby Network integration
 * All configuration values are read from process.env
 */

export const shelbyConfig = {
  // Shelby Network Configuration
  network: process.env.NEXT_PUBLIC_SHELBY_NETWORK || 'shelbynet',
  endpoint: process.env.SHELBY_ENDPOINT || 'https://gateway.shelby.xyz',
  bucket: process.env.SHELBY_BUCKET || 'shelby-drop',
  origin: process.env.SHELBY_ORIGIN || 'https://explorer.shelby.xyz',
  s3GatewayOrigin: process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || 'https://gateway.shelby.xyz',
  
  // API Configuration
  apiKey: process.env.SHELBY_API_KEY || 'https://api.shelbynet.shelby.xyz',
  
  // Signing Configuration
  signingSecret: process.env.SHELBY_SIGNING_SECRET || '',
  
  // Wallet Configuration
  walletAddress: process.env.SHELBY_WALLET_ADDRESS || '',
  walletPrivateKey: process.env.SHELBY_WALLET_PRIVATE_KEY || '',
  
  // Aptos Configuration
  aptosNetwork: process.env.APTOS_NETWORK || 'shelbynet',
  aptosIndexerUrl: process.env.APTOS_INDEXER_URL || 'https://api.shelbynet.shelby.xyz/v1/graphql',
  aptosFullnodeUrl: process.env.APTOS_FULLNODE_URL || 'https://api.shelbynet.shelby.xyz/v1',
  
  // Helper Methods
  getExplorerUrl: (wallet?: string) => {
    const baseUrl = process.env.SHELBY_ORIGIN || 'https://explorer.shelby.xyz';
    const network = process.env.NEXT_PUBLIC_SHELBY_NETWORK || 'shelbynet';
    return wallet ? `${baseUrl}/${network}/account/${wallet}` : `${baseUrl}/${network}`;
  },
  
  getTransactionUrl: (txHash: string) => {
    const baseUrl = process.env.SHELBY_ORIGIN || 'https://explorer.shelby.xyz';
    const network = process.env.NEXT_PUBLIC_SHELBY_NETWORK || 'shelbynet';
    return `${baseUrl}/${network}/tx/${txHash}`;
  },
  
  getAptosExplorerUrl: (txHash: string) => {
    return `https://explorer.aptoslabs.com/txn/${txHash}?network=shelbynet`;
  },
  
  getFileUrl: (wallet: string, filename: string) => {
    const gateway = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || 'https://gateway.shelby.xyz';
    return `${gateway}/${wallet}/${filename}`;
  }
};

// Validation helpers
export const validateConfig = () => {
  const required = [
    'SHELBY_WALLET_ADDRESS',
    'SHELBY_WALLET_PRIVATE_KEY',
    'SHELBY_SIGNING_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

export default shelbyConfig;
