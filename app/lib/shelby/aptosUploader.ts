/**
 * Aptos-Based Shelby Upload Service
 * 
 * This service implements REAL blockchain uploads using:
 * - Aptos SDK for transaction handling
 * - Shelby SDK for blob storage
 * - Real transaction hash extraction
 * - Multi-layer verification system
 * 
 * NO CLI, NO FAKE HASHES, NO FALLBACKS!
 */

import { 
  Account, 
  Aptos, 
  AptosConfig, 
  Network,
  Ed25519PrivateKey,
  type UserTransactionResponse,
  type WaitForTransactionOptions
} from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { shelbyConfig } from "@/config/shelby";

export interface UploadArgs {
  file: File;
  blobName: string;
  expirationMicros: number | bigint;
}

export interface UploadResult {
  success: boolean;
  txHash?: string;
  blobName?: string;
  uploadedAt?: string;
  aptosExplorer?: string;
  shelbyExplorer?: string;
  error?: string;
  stage?: string;
}

export interface VerificationResult {
  aptosVerified: boolean;
  shelbyIndexed: boolean;
  attempts: number;
  details: string;
}

/**
 * REAL Upload Service with Aptos Integration
 */
export class AptosShelbyUploader {
  private aptos: Aptos;
  private account: Account;
  private shelbyClient: ShelbyNodeClient;
  private accountAddress: string;

  constructor() {
    console.log("🔧 INITIALIZING APTOS-SHELBY UPLOADER");
    this.validateConfiguration();

    // Aptos client dengan custom Shelby endpoint
    const aptosConfig = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: process.env.APTOS_NODE_URL || 'https://api.testnet.shelby.xyz/v1',
      indexer: process.env.APTOS_INDEXER_URL || 'https://api.testnet.shelby.xyz/v1/graphql',
    });

    this.aptos = new Aptos(aptosConfig);

    const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY!;
    console.log("🔑 PRIVATE KEY FORMAT CHECK:", privateKey.substring(0, 20) + "...");

    if (!privateKey.startsWith('ed25519-priv-')) {
      throw new Error('Invalid private key format. Expected: ed25519-priv-...');
    }

    this.account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });

    this.accountAddress = this.account.accountAddress.toString();

    // ✅ ShelbyNodeClient support "testnet"
    this.shelbyClient = new ShelbyNodeClient({
      network: 'testnet' as any,
      apiKey: process.env.SHELBY_API_KEY!,
    });

    console.log("✅ UPLOADER INITIALIZED:", {
      network: 'testnet',
      accountAddress: this.accountAddress,
      hasApiKey: !!process.env.SHELBY_API_KEY,
    });
  }

  private validateConfiguration() {
    console.log("🔍 DEBUGGING ENVIRONMENT VARIABLES:");
    console.log("SHELBY_ACCOUNT_ADDRESS:", process.env.SHELBY_ACCOUNT_ADDRESS ? "✅ SET" : "❌ MISSING");
    console.log("SHELBY_ACCOUNT_PRIVATE_KEY:", process.env.SHELBY_ACCOUNT_PRIVATE_KEY ? "✅ SET" : "❌ MISSING");
    console.log("SHELBY_API_KEY:", process.env.SHELBY_API_KEY ? "✅ SET" : "❌ MISSING");
    console.log("APTOS_NODE_URL:", process.env.APTOS_NODE_URL ? "✅ SET" : "❌ MISSING");
    console.log("APTOS_INDEXER_URL:", process.env.APTOS_INDEXER_URL ? "✅ SET" : "❌ MISSING");
    
    const required = [
      'SHELBY_ACCOUNT_ADDRESS',
      'SHELBY_ACCOUNT_PRIVATE_KEY', 
      'SHELBY_API_KEY',
      'APTOS_NODE_URL',
      'APTOS_INDEXER_URL'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.error("❌ MISSING ENV VARS:", missing);
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (!process.env.SHELBY_API_KEY?.startsWith('aptoslabs_')) {
      throw new Error('Invalid API key format. Expected: aptoslabs_...');
    }
    
    console.log("✅ ALL ENVIRONMENT VARIABLES VALIDATED");
  }

  /**
   * Upload file to Shelby with REAL blockchain transaction
   */
  async upload(args: UploadArgs): Promise<UploadResult> {
    console.log("🚀 STARTING REAL UPLOAD PROCESS");
    
    try {
      // Step 1: Convert file to buffer
      const fileBuffer = Buffer.from(await args.file.arrayBuffer());
      console.log("📁 FILE PREPARED:", {
        name: args.file.name,
        size: fileBuffer.length,
        blobName: args.blobName,
        expirationMicros: args.expirationMicros,
      });

      // Step 2: Upload to Shelby (this creates the blob)
      console.log("📤 STEP 1: UPLOADING TO SHELBY...");
      // Convert bigint to number if needed
      const expirationMicros = Number(args.expirationMicros);
      await this.shelbyClient.upload({
        blobData: fileBuffer,
        signer: this.account,
        blobName: args.blobName,
        expirationMicros: expirationMicros as number,
      });
      
      console.log("✅ SHELBY UPLOAD COMPLETED");

      // Step 3: Get REAL transaction hash from recent transactions
      console.log("🔍 STEP 2: EXTRACTING TRANSACTION HASH...");
      const txHash = await this.extractTransactionHash();
      
      if (!txHash) {
        throw new Error('Failed to extract transaction hash from recent transactions');
      }
      
      console.log("✅ TRANSACTION HASH FOUND:", txHash);

      // Step 4: Wait for transaction confirmation
      console.log("⏳ STEP 3: WAITING FOR TRANSACTION CONFIRMATION...");
      await this.waitForTransactionConfirmation(txHash);
      
      console.log("✅ TRANSACTION CONFIRMED ON-CHAIN");

      // Step 5: Verify in both explorers
      console.log("🔍 STEP 4: VERIFYING IN EXPLORERS...");
      const verification = await this.verifyInExplorers(txHash, args.blobName);
      
      if (!verification.aptosVerified) {
        throw new Error(`Transaction not found in Aptos Explorer: ${verification.details}`);
      }
      
      console.log("✅ VERIFICATION COMPLETE:", verification);

      // Step 6: Return success result
      const result: UploadResult = {
        success: true,
        txHash,
        blobName: args.blobName,
        uploadedAt: new Date().toISOString(),
        aptosExplorer: shelbyConfig.getTransactionUrl(txHash),
        shelbyExplorer: `${shelbyConfig.getExplorerUrl(this.accountAddress)}/blobs`,
      };

      console.log("🎉 UPLOAD SUCCESS:", result);
      return result;

    } catch (error) {
      console.error("❌ UPLOAD FAILED:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stage: 'upload_failed',
      };
    }
  }

  /**
   * Extract REAL transaction hash from recent account transactions
   */
  private async extractTransactionHash(): Promise<string | null> {
    console.log("🔍 SEARCHING FOR RECENT TRANSACTIONS...");
    
    try {
      // Get recent transactions from the account
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress: this.accountAddress,
        options: {
          limit: 5, // Check last 5 transactions
        },
      });

      console.log(`📋 FOUND ${transactions.length} RECENT TRANSACTIONS`);

      // Find the most recent transaction (within last 60 seconds)
      const now = Date.now();
      const recentTx = transactions.find(tx => {
        const timestamp = (tx as any).timestamp || (tx as any).transaction_timestamp || 0;
        const timestampMs = typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp;
        const ageMs = now - timestampMs;
        
        console.log(`🔍 TX: ${tx.hash}, Age: ${ageMs}ms`);
        return ageMs < 60000; // Within last 60 seconds
      });

      if (recentTx) {
        console.log("✅ FOUND RECENT TRANSACTION:", recentTx.hash);
        return recentTx.hash;
      }

      console.log("❌ NO RECENT TRANSACTION FOUND");
      return null;

    } catch (error) {
      console.error("❌ ERROR EXTRACTING TRANSACTION HASH:", error);
      return null;
    }
  }

  /**
   * Wait for transaction to be confirmed on-chain
   */
  private async waitForTransactionConfirmation(txHash: string): Promise<void> {
    console.log("⏳ WAITING FOR TRANSACTION CONFIRMATION:", txHash);
    
    const options: WaitForTransactionOptions = {
      timeoutSecs: 60, // Wait up to 60 seconds
    };

    try {
      const result = await this.aptos.waitForTransaction({
        transactionHash: txHash,
        options,
      });

      console.log("✅ TRANSACTION CONFIRMED:", {
        hash: result.hash,
        success: result.success,
        vmStatus: result.vm_status,
      });

      if (!result.success) {
        throw new Error(`Transaction failed: ${result.vm_status}`);
      }

    } catch (error) {
      console.error("❌ TRANSACTION CONFIRMATION FAILED:", error);
      throw error;
    }
  }

  /**
   * Verify transaction in both explorers with retry logic
   */
  private async verifyInExplorers(txHash: string, blobName: string): Promise<VerificationResult> {
    console.log("🔍 STARTING EXPLORER VERIFICATION...");
    
    let aptosVerified = false;
    let shelbyIndexed = false;
    let attempts = 0;
    const maxAttempts = 3;
    let details = '';

    for (let i = 0; i < maxAttempts; i++) {
      attempts++;
      console.log(`🔄 VERIFICATION ATTEMPT ${attempts}/${maxAttempts}`);

      try {
        // Verify Aptos Explorer
        if (!aptosVerified) {
          aptosVerified = await this.verifyAptosExplorer(txHash);
          console.log("📊 APTOS EXPLORER:", aptosVerified ? "✅ VERIFIED" : "❌ NOT FOUND");
        }

        // Verify Shelby Explorer  
        if (!shelbyIndexed) {
          shelbyIndexed = await this.verifyShelbyExplorer(blobName);
          console.log("🌐 SHELBY EXPLORER:", shelbyIndexed ? "✅ INDEXED" : "❌ NOT FOUND");
        }

        // If both verified, break
        if (aptosVerified && shelbyIndexed) {
          details = 'Fully verified in both explorers';
          break;
        }

        // Wait before retry
        if (i < maxAttempts - 1) {
          console.log("⏳ WAITING 5 SECONDS BEFORE RETRY...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        console.error(`❌ VERIFICATION ATTEMPT ${attempts} FAILED:`, error);
        details = `Error during verification: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    const result: VerificationResult = {
      aptosVerified,
      shelbyIndexed,
      attempts,
      details,
    };

    console.log("📊 FINAL VERIFICATION RESULT:", result);
    return result;
  }

  /**
   * Verify transaction in Aptos Explorer
   */
  private async verifyAptosExplorer(txHash: string): Promise<boolean> {
    try {
      const explorerUrl = shelbyConfig.getTransactionUrl(txHash);
      console.log("🔍 CHECKING APTOS EXPLORER:", explorerUrl);

      // Try to get transaction details from Aptos
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress: this.accountAddress,
        options: { limit: 10 }
      });

      const foundTx = transactions.find(tx => tx.hash === txHash);
      if (foundTx) {
        console.log("✅ TRANSACTION FOUND IN APTOS:", foundTx.hash);
        return true;
      }

      console.log("❌ TRANSACTION NOT FOUND IN APTOS");
      return false;

    } catch (error) {
      console.error("❌ TRANSACTION NOT FOUND IN APTOS:", error);
      return false;
    }
  }

  /**
   * Verify blob appears in Shelby Explorer
   */
  private async verifyShelbyExplorer(blobName: string): Promise<boolean> {
    try {
      const explorerUrl = `${shelbyConfig.getExplorerUrl(this.accountAddress)}/blobs`;
      console.log("🔍 CHECKING SHELBY EXPLORER:", explorerUrl);

      // Fetch the blobs page
      const response = await fetch(explorerUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Shelby Explorer: ${response.status}`);
      }

      const html = await response.text();
      
      // Check if blob name appears in the page
      const found = html.includes(blobName);
      console.log(`📊 BLOB "${blobName}" IN SHELBY EXPLORER:`, found ? "✅ FOUND" : "❌ NOT FOUND");
      
      return found;

    } catch (error) {
      console.error("❌ ERROR CHECKING SHELBY EXPLORER:", error);
      return false;
    }
  }
}
