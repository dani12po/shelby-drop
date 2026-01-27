/**
 * Production-Ready Upload Polling Service
 * 
 * Implements proper blockchain verification with:
 * - Aptos transaction confirmation polling
 * - Shelby Explorer indexing polling
 * - Structured status updates
 * - Server-side verification logic
 */

export type UploadStatus = 
  | 'uploading'
  | 'transaction_submitted'
  | 'transaction_confirmed'
  | 'indexing_on_shelby'
  | 'available_in_shelby'
  | 'failed';

export interface UploadProgress {
  status: UploadStatus;
  txHash?: string;
  aptosExplorer?: string;
  shelbyExplorer?: string;
  message: string;
  progress: number; // 0-100
  error?: string;
  stage?: string;
}

export interface PollingConfig {
  aptosRetries: number;
  aptosInterval: number; // ms
  shelbyRetries: number;
  shelbyInterval: number; // ms
}

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { shelbyConfig } from "@/config/shelby";

export class UploadPollingService {
  private aptos: Aptos;
  private config: PollingConfig;

  constructor() {
    // Initialize Aptos client for verification
    const aptosConfig = new AptosConfig({
      network: Network.SHELBYNET,
      fullnode: shelbyConfig.aptosNodeUrl,
      indexer: shelbyConfig.aptosIndexerUrl,
    });
    
    this.aptos = new Aptos(aptosConfig);
    
    this.config = {
      aptosRetries: 10,
      aptosInterval: 3000, // 3 seconds
      shelbyRetries: 10,
      shelbyInterval: 15000, // 15 seconds
    };
  }

  /**
   * Start comprehensive upload verification
   */
  async verifyUpload(
    txHash: string,
    blobName: string,
    walletAddress: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadProgress> {
    console.log("🔄 STARTING COMPREHENSIVE UPLOAD VERIFICATION");
    
    try {
      // Phase 1: Aptos Transaction Confirmation
      onProgress?.({
        status: 'transaction_submitted',
        txHash,
        message: 'Transaction submitted to blockchain',
        progress: 25,
      });

      const aptosConfirmed = await this.verifyAptosTransaction(txHash, onProgress);
      if (!aptosConfirmed) {
        return {
          status: 'failed',
          message: 'Transaction confirmation failed',
          progress: 0,
          error: 'Transaction not found or failed on Aptos network',
        };
      }

      // Phase 2: Shelby Explorer Indexing
      onProgress?.({
        status: 'indexing_on_shelby',
        txHash,
        aptosExplorer: shelbyConfig.getTransactionUrl(txHash),
        message: 'Transaction confirmed, indexing on Shelby Explorer...',
        progress: 60,
      });

      const shelbyIndexed = await this.verifyShelbyIndexing(
        blobName,
        walletAddress,
        onProgress
      );

      if (shelbyIndexed) {
        return {
          status: 'available_in_shelby',
          txHash,
          aptosExplorer: shelbyConfig.getTransactionUrl(txHash),
          shelbyExplorer: `${shelbyConfig.getExplorerUrl(walletAddress)}/blobs`,
          message: 'File successfully uploaded and indexed in Shelby Explorer',
          progress: 100,
        };
      } else {
        return {
          status: 'transaction_confirmed',
          txHash,
          aptosExplorer: shelbyConfig.getTransactionUrl(txHash),
          shelbyExplorer: `${shelbyConfig.getExplorerUrl(walletAddress)}/blobs`,
          message: 'Transaction confirmed on Aptos, still indexing on Shelby Explorer',
          progress: 80,
        };
      }

    } catch (error) {
      console.error("❌ VERIFICATION FAILED:", error);
      return {
        status: 'failed',
        message: 'Verification process failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify Aptos transaction confirmation
   */
  private async verifyAptosTransaction(
    txHash: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<boolean> {
    console.log("🔍 VERIFYING APTOS TRANSACTION:", txHash);

    for (let attempt = 1; attempt <= this.config.aptosRetries; attempt++) {
      try {
        console.log(`🔄 APTOS VERIFICATION ATTEMPT ${attempt}/${this.config.aptosRetries}`);

        // Get transaction details
        const tx = await this.aptos.waitForTransaction({
          transactionHash: txHash,
          options: {
            timeoutSecs: 10, // Short timeout for polling
          },
        });

        console.log("✅ TRANSACTION FOUND:", {
          hash: tx.hash,
          success: tx.success,
          vmStatus: tx.vm_status,
        });

        if (tx.success) {
          onProgress?.({
            status: 'transaction_confirmed',
            txHash,
            aptosExplorer: shelbyConfig.getTransactionUrl(txHash),
            message: 'Transaction confirmed on Aptos blockchain',
            progress: 50,
          });

          return true;
        } else {
          throw new Error(`Transaction failed: ${tx.vm_status}`);
        }

      } catch (error) {
        console.error(`❌ APTOS VERIFICATION ATTEMPT ${attempt} FAILED:`, error);
        
        if (attempt === this.config.aptosRetries) {
          onProgress?.({
            status: 'failed',
            message: 'Transaction verification failed after all retries',
            progress: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return false;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.config.aptosInterval));
      }
    }

    return false;
  }

  /**
   * Verify file indexing in Shelby Explorer
   */
  private async verifyShelbyIndexing(
    blobName: string,
    walletAddress: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<boolean> {
    console.log("🔍 VERIFYING SHELBY INDEXING FOR BLOB:", blobName);

    const explorerUrl = `${shelbyConfig.getExplorerUrl(walletAddress)}/blobs`;

    for (let attempt = 1; attempt <= this.config.shelbyRetries; attempt++) {
      try {
        console.log(`🔄 SHELBY INDEXING ATTEMPT ${attempt}/${this.config.shelbyRetries}`);

        // Fetch Shelby Explorer page
        const response = await fetch(explorerUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch Shelby Explorer: ${response.status}`);
        }

        const html = await response.text();
        
        // Check if blob name appears in the page
        const found = html.includes(blobName);
        
        if (found) {
          console.log("✅ BLOB FOUND IN SHELBY EXPLORER");
          
          onProgress?.({
            status: 'available_in_shelby',
            shelbyExplorer: explorerUrl,
            message: 'File indexed and available in Shelby Explorer',
            progress: 100,
          });

          return true;
        }

        console.log("⏳ BLOB NOT YET INDEXED, CONTINUING TO WAIT...");

      } catch (error) {
        console.error(`❌ SHELBY INDEXING ATTEMPT ${attempt} FAILED:`, error);
      }

      // Update progress during indexing
      const progress = 60 + ((attempt / this.config.shelbyRetries) * 20); // 60-80%
      onProgress?.({
        status: 'indexing_on_shelby',
        shelbyExplorer: explorerUrl,
        message: `Indexing on Shelby Explorer... (${attempt}/${this.config.shelbyRetries})`,
        progress,
      });

      // Wait before retry (except last attempt)
      if (attempt < this.config.shelbyRetries) {
        await new Promise(resolve => setTimeout(resolve, this.config.shelbyInterval));
      }
    }

    console.log("⏳ SHELBY INDEXING NOT COMPLETED WITHIN TIMEOUT");
    return false;
  }

  /**
   * Get short transaction hash for display
   */
  getShortTxHash(txHash: string): string {
    if (!txHash || txHash.length < 10) return txHash;
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  }

  /**
   * Format progress percentage
   */
  getProgressMessage(status: UploadStatus): string {
    switch (status) {
      case 'uploading':
        return 'Uploading file to Shelby network...';
      case 'transaction_submitted':
        return 'Transaction submitted to blockchain';
      case 'transaction_confirmed':
        return 'Transaction confirmed on Aptos blockchain';
      case 'indexing_on_shelby':
        return 'Indexing on Shelby Explorer...';
      case 'available_in_shelby':
        return 'File available in Shelby Explorer';
      case 'failed':
        return 'Upload failed';
      default:
        return 'Processing...';
    }
  }
}
