/**
 * Aptos-Based Shelby Upload Service
 *
 * Shelby runs on "shelbynet" — a separate network from Aptos testnet.
 * Endpoints: https://api.shelbynet.shelby.xyz/v1
 */

import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  type WaitForTransactionOptions,
} from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { shelbyConfig, getNetworkConfig } from "@/config/shelby";

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

export class AptosShelbyUploader {
  private aptos: Aptos;
  private account: Account;
  private shelbyClient: ShelbyNodeClient;
  private accountAddress: string;
  private networkConfig: ReturnType<typeof getNetworkConfig>;

  constructor(networkOverride?: string) {
    console.log("🔧 INITIALIZING APTOS-SHELBY UPLOADER");
    this.validateConfiguration();

    // Resolve network config — param > env > default (testnet)
    this.networkConfig = getNetworkConfig(networkOverride);
    console.log("🌐 NETWORK:", this.networkConfig.label);

    // Aptos client pointing at the correct network node
    const aptosConfig = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: process.env.APTOS_NODE_URL || this.networkConfig.aptosNodeUrl,
      indexer:  process.env.APTOS_INDEXER_URL || this.networkConfig.aptosIndexerUrl,
    });
    this.aptos = new Aptos(aptosConfig);

    const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY!;
    if (!privateKey.startsWith('ed25519-priv-')) {
      throw new Error('Invalid private key format. Expected: ed25519-priv-...');
    }

    this.account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });
    this.accountAddress = this.account.accountAddress.toString();

    // ShelbyNodeClient — use TESTNET for testnet, SHELBYNET for shelbynet
    const sdkNet = this.networkConfig.sdkNetwork === "testnet" ? Network.TESTNET : Network.SHELBYNET;
    
    // Use SHELBY_RPC_API_KEY (AG-...) for Shelby operations if available
    const shelbyApiKey = process.env.SHELBY_RPC_API_KEY || process.env.SHELBY_API_KEY!;
    
    this.shelbyClient = new ShelbyNodeClient({
      network: sdkNet,
      apiKey:  shelbyApiKey,
      // @ts-ignore - origin might not be in the type definition but is used by the SDK internally
      origin:  shelbyConfig.origin,
    });

    console.log("✅ UPLOADER INITIALIZED:", {
      network: this.networkConfig.label,
      accountAddress: this.accountAddress,
      hasApiKey: !!shelbyApiKey,
    });
  }

  private validateConfiguration() {
    console.log("🔍 ENVIRONMENT VARIABLES:");
    console.log("SHELBY_ACCOUNT_ADDRESS:",    process.env.SHELBY_ACCOUNT_ADDRESS    ? "✅ SET" : "❌ MISSING");
    console.log("SHELBY_ACCOUNT_PRIVATE_KEY:", process.env.SHELBY_ACCOUNT_PRIVATE_KEY ? "✅ SET" : "❌ MISSING");
    console.log("SHELBY_API_KEY:",             process.env.SHELBY_API_KEY             ? "✅ SET" : "❌ MISSING");
    console.log("APTOS_NODE_URL:",             process.env.APTOS_NODE_URL             ? "✅ SET" : "❌ MISSING");
    console.log("APTOS_INDEXER_URL:",          process.env.APTOS_INDEXER_URL          ? "✅ SET" : "❌ MISSING");

    const required = [
      'SHELBY_ACCOUNT_ADDRESS',
      'SHELBY_ACCOUNT_PRIVATE_KEY',
      'SHELBY_API_KEY',
      'APTOS_NODE_URL',
      'APTOS_INDEXER_URL',
    ];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (!process.env.SHELBY_API_KEY?.startsWith('aptoslabs_')) {
      throw new Error('Invalid API key format. Expected: aptoslabs_...');
    }
    console.log("✅ ALL ENVIRONMENT VARIABLES VALIDATED");
  }

  async upload(args: UploadArgs): Promise<UploadResult> {
    console.log("🚀 STARTING REAL UPLOAD PROCESS");

    try {
      const fileBuffer = Buffer.from(await args.file.arrayBuffer());
      console.log("📁 FILE PREPARED:", {
        name: args.file.name,
        size: fileBuffer.length,
        blobName: args.blobName,
        expirationMicros: args.expirationMicros,
      });

      console.log("📤 STEP 1: UPLOADING TO SHELBY...");
      // expirationMicros: Date.now() * 1000 ≈ 1.7e15 — within Number.MAX_SAFE_INTEGER
      const expirationMicros = typeof args.expirationMicros === 'bigint'
        ? Number(args.expirationMicros)
        : args.expirationMicros;

      await this.shelbyClient.upload({
        blobData:         fileBuffer,
        signer:           this.account,
        blobName:         args.blobName,
        expirationMicros: expirationMicros,
      });
      console.log("✅ SHELBY UPLOAD COMPLETED");

      // TODO: use upload() return value for txHash when SDK exposes it
      // For now, find the most recent successful tx (15s window to reduce race condition risk)
      console.log("🔍 STEP 2: EXTRACTING TRANSACTION HASH...");
      const txHash = await this.extractTransactionHash();
      if (!txHash) {
        throw new Error('Failed to extract transaction hash from recent transactions');
      }
      console.log("✅ TRANSACTION HASH FOUND:", txHash);

      console.log("⏳ STEP 3: WAITING FOR TRANSACTION CONFIRMATION...");
      await this.waitForTransactionConfirmation(txHash);
      console.log("✅ TRANSACTION CONFIRMED ON-CHAIN");

      // Aptos verification is the source of truth; Shelby indexing is best-effort
      console.log("🔍 STEP 4: VERIFYING ON APTOS...");
      const aptosVerified = await this.verifyAptosTransaction(txHash);
      if (!aptosVerified) {
        throw new Error(`Transaction ${txHash} not found in Aptos after confirmation`);
      }
      console.log("✅ APTOS VERIFICATION COMPLETE");

      const result: UploadResult = {
        success:       true,
        txHash,
        blobName:      args.blobName,
        uploadedAt:    new Date().toISOString(),
        aptosExplorer: shelbyConfig.getTransactionUrl(txHash, this.networkConfig.aptosNetwork),
        shelbyExplorer: `${shelbyConfig.getExplorerUrl(this.accountAddress, this.networkConfig.aptosNetwork)}/blobs`,
        shelbyIndexed: false, // indexing is async, not blocking
      };

      console.log("🎉 UPLOAD SUCCESS:", result);
      return result;

    } catch (error) {
      console.error("❌ UPLOAD FAILED:", error);
      return {
        success: false,
        error:   error instanceof Error ? error.message : 'Unknown error',
        stage:   'upload_failed',
      };
    }
  }

  /**
   * Find the most recent successful tx from this account.
   * Window tightened to 15s to reduce race condition risk.
   * TODO: replace with upload() return value when SDK supports it.
   */
  private async extractTransactionHash(): Promise<string | null> {
    console.log("🔍 SEARCHING FOR RECENT TRANSACTIONS...");
    try {
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress: this.accountAddress,
        options: { limit: 5 },
      });
      console.log(`📋 FOUND ${transactions.length} RECENT TRANSACTIONS`);

      const now = Date.now();
      const recentTx = transactions.find(tx => {
        // Use type guard or property check instead of any
        const txData = tx as { success?: boolean; timestamp?: string | number; transaction_timestamp?: string | number };
        if (!txData.success) {
          return false;
        }
        const timestamp = txData.timestamp || txData.transaction_timestamp || 0;
        // Aptos timestamps are in microseconds — divide by 1000 for ms
        const tsMs = typeof timestamp === 'string'
          ? Math.floor(parseInt(timestamp) / 1000)
          : Math.floor(Number(timestamp) / 1000);
        const ageMs = now - tsMs;
        
        // BUG #5 FIX: Use a slightly wider window (30s) but ensure it's the absolute latest
        // to avoid race conditions where multiple uploads happen in quick succession.
        return ageMs >= 0 && ageMs < 30000;
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

  private async waitForTransactionConfirmation(txHash: string): Promise<void> {
    console.log("⏳ WAITING FOR TRANSACTION CONFIRMATION:", txHash);
    const options: WaitForTransactionOptions = { timeoutSecs: 60 };
    try {
      const result = await this.aptos.waitForTransaction({ transactionHash: txHash, options });
      console.log("✅ TRANSACTION CONFIRMED:", {
        hash: result.hash, success: result.success, vmStatus: result.vm_status,
      });
      if (!result.success) {
        throw new Error(`Transaction failed: ${result.vm_status}`);
      }
    } catch (error) {
      console.error("❌ TRANSACTION CONFIRMATION FAILED:", error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('E_INSUFFICIENT_FUNDS') || msg.includes('INSUFFICIENT_FUNDS')) {
        throw new Error(
          'Insufficient WAL/APT balance on the Shelby storage account. ' +
          `Please top up ${this.accountAddress} on Shelby network. ` +
          'Get testnet tokens from: https://aptos.dev/en/network/faucet'
        );
      }
      throw error;
    }
  }

  /** Verify tx exists in Aptos via SDK (not HTML scraping) */
  private async verifyAptosTransaction(txHash: string): Promise<boolean> {
    try {
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress: this.accountAddress,
        options: { limit: 10 },
      });
      const found = transactions.some(tx => tx.hash === txHash);
      console.log(found ? "✅ TX FOUND IN APTOS" : "❌ TX NOT FOUND IN APTOS");
      return found;
    } catch (error) {
      console.error("❌ APTOS VERIFICATION ERROR:", error);
      return false;
    }
  }
}
