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
  shelbyIndexed?: boolean;
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

    // Aptos client with custom Shelby endpoint
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

    // BUG #7 FIX: Use proper ShelbyClientConfig with network + aptos + indexer
    // ShelbyNetwork accepts: Network.TESTNET, Network.LOCAL, Network.SHELBYNET
    this.shelbyClient = new ShelbyNodeClient({
      network: Network.TESTNET,
      apiKey: process.env.SHELBY_API_KEY!,
      aptos: {
        fullnode: process.env.APTOS_NODE_URL || 'https://api.testnet.shelby.xyz/v1',
        indexer: process.env.APTOS_INDEXER_URL || 'https://api.testnet.shelby.xyz/v1/graphql',
        network: Network.CUSTOM,
      },
      indexer: {
        baseUrl: process.env.APTOS_INDEXER_URL || 'https://api.testnet.shelby.xyz/v1/graphql',
        apiKey: process.env.SHELBY_API_KEY!,
      },
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

      // BUG #8 FIX: expirationMicros as BigInt — Date.now() * 1000 stays within safe integer range
      // Date.now() ≈ 1.7e12 ms → * 1000 = 1.7e15 (within Number.MAX_SAFE_INTEGER = 9e15)
      const expirationMicros = typeof args.expirationMicros === 'bigint'
        ? Number(args.expirationMicros)
        : args.expirationMicros;

      await this.shelbyClient.upload({
        blobData: fileBuffer,
        signer: this.account,
        blobName: args.blobName,
        expirationMicros: expirationMicros,
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

      // Step 5: Verify in explorers (non-blocking for Shelby indexing)
      console.log("🔍 STEP 4: VERIFYING IN EXPLORERS...");
      const verification = await this.verifyInExplorers(txHash, args.blobName);
      
      // BUG #6 FIX: Only require Aptos verification — Shelby indexing is best-effort
      if (!verification.aptosVerified) {
        throw new Error(`Transaction not found in Aptos Explorer: ${verification.details}`);
      }
      
      if (!verification.shelbyIndexed) {
        console.log("⚠️ Shelby indexing pending — upload is confirmed on-chain, blob will appear shortly");
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
        shelbyIndexed: verification.shelbyIndexed,
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
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress: this.accountAddress,
        options: {
          limit: 5,
        },
      });

      console.log(`📋 FOUND ${transactions.length} RECENT TRANSACTIONS`);

      // Find the most recent SUCCESSFUL transaction (within last 60 seconds)
      // Aptos timestamps are in MICROSECONDS — divide by 1000 to get ms
      const now = Date.now();
      const recentTx = transactions.find(tx => {
        // Skip failed transactions
        if (!(tx as any).success) {
          console.log(`⏭️ SKIPPING FAILED TX: ${tx.hash}`);
          return false;
        }

        const timestamp = (tx as any).timestamp || (tx as any).transaction_timestamp || 0;
        // Aptos returns microseconds — convert to ms by dividing by 1000
        const timestampMs = typeof timestamp === 'string'
          ? Math.floor(parseInt(timestamp) / 1000)
          : Math.floor(Number(timestamp) / 1000);
        const ageMs = now - timestampMs;
        
        console.log(`🔍 TX: ${tx.hash}, Age: ${ageMs}ms, Success: ${(tx as any).success}`);
        return ageMs >= 0 && ageMs < 60000; // Within last 60 seconds
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
      timeoutSecs: 60,
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
      
      // Provide a clearer error for insufficient funds
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('E_INSUFFICIENT_FUNDS') || msg.includes('INSUFFICIENT_FUNDS')) {
        throw new Error(
          'Insufficient WAL/APT balance on the Shelby storage account. ' +
          'Please top up the account at address ' + this.accountAddress + ' on Aptos testnet. ' +
          'You can get testnet tokens from the Aptos faucet: https://aptos.dev/en/network/faucet'
        );
      }
      
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
        if (!aptosVerified) {
          aptosVerified = await this.verifyAptosExplorer(txHash);
          console.log("📊 APTOS EXPLORER:", aptosVerified ? "✅ VERIFIED" : "❌ NOT FOUND");
        }

        if (!shelbyIndexed) {
          shelbyIndexed = await this.verifyShelbyExplorer(blobName);
          console.log("🌐 SHELBY EXPLORER:", shelbyIndexed ? "✅ INDEXED" : "⏳ NOT YET INDEXED");
        }

        if (aptosVerified && shelbyIndexed) {
          details = 'Fully verified in both explorers';
          break;
        }

        // If Aptos is verified, no need to keep retrying just for Shelby indexing
        if (aptosVerified && i < maxAttempts - 1) {
          console.log("⏳ WAITING 5 SECONDS FOR SHELBY INDEXING...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        console.error(`❌ VERIFICATION ATTEMPT ${attempts} FAILED:`, error);
        details = `Error during verification: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    if (aptosVerified && !shelbyIndexed) {
      details = 'Transaction confirmed on Aptos. Shelby indexing may take a few minutes.';
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
   * Verify transaction in Aptos (via SDK, not scraping)
   */
  private async verifyAptosExplorer(txHash: string): Promise<boolean> {
    try {
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
      console.error("❌ APTOS VERIFICATION ERROR:", error);
      return false;
    }
  }

  /**
   * Verify blob appears in Shelby Explorer (best-effort, non-blocking)
   */
  private async verifyShelbyExplorer(blobName: string): Promise<boolean> {
    try {
      const explorerUrl = `${shelbyConfig.getExplorerUrl(this.accountAddress)}/blobs`;
      console.log("🔍 CHECKING SHELBY EXPLORER:", explorerUrl);

      const response = await fetch(explorerUrl);
      if (!response.ok) {
        console.log(`⚠️ Shelby Explorer returned ${response.status} — skipping`);
        return false;
      }

      const html = await response.text();
      const found = html.includes(blobName);
      console.log(`📊 BLOB "${blobName}" IN SHELBY EXPLORER:`, found ? "✅ FOUND" : "⏳ NOT YET");
      
      return found;

    } catch (error) {
      console.error("⚠️ SHELBY EXPLORER CHECK FAILED (non-blocking):", error);
      return false;
    }
  }
}
