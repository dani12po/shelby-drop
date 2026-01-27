/**
 * Professional Wallet Connect Component
 * Web3-style wallet connection with copy & disconnect UX
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Copy, LogOut, Wallet, ChevronDown, CheckCircle2 } from 'lucide-react';

interface WalletConnectProps {
  wallet: string | null;
  onConnect: (wallet: string) => void;
  onDisconnect: () => void;
}

export function WalletConnect({ wallet, onConnect, onDisconnect }: WalletConnectProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = () => {
    // Simulate wallet connection (in real app, would connect to wallet adapter)
    const mockWallet = '0x50093856644bfcf8e33e3979b52f1a71f79f24a6ed7da94aa92b5b4057e0d0bb';
    onConnect(mockWallet);
  };

  const handleCopyAddress = async () => {
    if (wallet) {
      try {
        await navigator.clipboard.writeText(wallet);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
    setIsDropdownOpen(false);
  };

  const handleDisconnect = () => {
    onDisconnect();
    setIsDropdownOpen(false);
  };

  const getShortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-600/25"
      >
        <Wallet size={16} />
        <span className="font-medium">Connect Wallet</span>
      </button>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/90 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-600/50 shadow-lg"
        >
          <span className="font-mono text-sm font-medium">{getShortAddress(wallet)}</span>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-50">
            <div className="p-2">
              <button
                onClick={handleCopyAddress}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-gray-800/50 rounded-md transition-colors"
              >
                <Copy size={16} />
                <span className="text-sm font-medium">Copy Address</span>
              </button>
              
              <div className="border-t border-gray-700/30 my-1" />
              
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Wallet address copied</span>
          </div>
        </div>
      )}
    </>
  );
}
