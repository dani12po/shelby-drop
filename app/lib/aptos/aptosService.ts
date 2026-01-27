/**
 * Aptos SDK Integration Service
 * 
 * Integration with Aptos SDK for blockchain operations
 * Compatible with Shelby Network (shelbynet)
 */

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { shelbyConfig } from "@/config/shelby";

export class AptosService {
  private client: Aptos;
  
  constructor() {
    // Initialize Aptos client with Shelby Network configuration
    const config = new AptosConfig({
      network: Network.CUSTOM,
      fullnode: shelbyConfig.aptosNodeUrl,
      indexer: shelbyConfig.aptosIndexerUrl,
    });
    
    this.client = new Aptos(config);
  }
  
  /**
   * Get account information
   */
  async getAccountInfo(address: string) {
    try {
      const accountInfo = await this.client.getAccountInfo({
        accountAddress: address,
      });
      return accountInfo;
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }
  
  /**
   * Get account resources
   */
  async getAccountResources(address: string) {
    try {
      const resources = await this.client.getAccountResources({
        accountAddress: address,
      });
      return resources;
    } catch (error) {
      console.error('Failed to get account resources:', error);
      throw error;
    }
  }
  
  /**
   * Get account modules
   */
  async getAccountModules(address: string) {
    try {
      const modules = await this.client.getAccountModules({
        accountAddress: address,
      });
      return modules;
    } catch (error) {
      console.error('Failed to get account modules:', error);
      throw error;
    }
  }
  
  /**
   * Get transaction by hash
   */
  async getTransaction(txHash: string) {
    try {
      const transaction = await this.client.getTransactionByHash({
        transactionHash: txHash,
      });
      return transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }
  
  /**
   * Get account transactions
   */
  async getAccountTransactions(address: string, limit?: number) {
    try {
      const transactions = await this.client.getAccountTransactions({
        accountAddress: address,
        options: {
          limit: limit || 10,
        },
      });
      return transactions;
    } catch (error) {
      console.error('Failed to get account transactions:', error);
      throw error;
    }
  }
  
  /**
   * Query indexer with GraphQL
   */
  async queryIndexer(query: string, variables?: any) {
    try {
      const response = await fetch(shelbyConfig.aptosIndexerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Indexer query failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to query indexer:', error);
      throw error;
    }
  }
  
  /**
   * Get current block information
   */
  async getCurrentBlock() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo();
      return ledgerInfo;
    } catch (error) {
      console.error('Failed to get current block:', error);
      throw error;
    }
  }
  
  /**
   * Check if transaction is confirmed
   */
  async isTransactionConfirmed(txHash: string): Promise<boolean> {
    try {
      const transaction = await this.getTransaction(txHash);
      return transaction.type === 'user_transaction';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, maxWaitTime = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const confirmed = await this.isTransactionConfirmed(txHash);
        if (confirmed) {
          return true;
        }
      } catch (error) {
        // Transaction might not be indexed yet
      }
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }
  
  /**
   * Get client instance
   */
  getClient(): Aptos {
    return this.client;
  }
}

// Singleton instance
export const aptosService = new AptosService();
export default aptosService;
