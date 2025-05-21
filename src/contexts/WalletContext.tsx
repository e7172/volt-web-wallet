"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletData, generateWallet, createWalletFromMnemonic, saveWallet, loadWallet, clearWallet } from '@/lib/wallet';
import { getBalance, getNonce } from '@/lib/api';

interface WalletContextType {
  wallet: WalletData | null;
  balance: bigint;
  nonce: number;
  isLoading: boolean;
  error: string | null;
  isNewWallet: boolean;
  createNewWallet: () => void;
  importWallet: (mnemonic: string) => void;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  setIsNewWallet: (value: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [nonce, setNonce] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewWallet, setIsNewWallet] = useState<boolean>(false);

  // Load wallet from local storage on initial render
  useEffect(() => {
    const loadSavedWallet = async () => {
      try {
        setIsLoading(true);
        const savedWallet = loadWallet();
        
        if (savedWallet) {
          setWallet(savedWallet);
          await fetchBalanceAndNonce(savedWallet.address);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet');
        console.error('Failed to load wallet:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedWallet();
  }, []);

  // Fetch balance and nonce for an address
  const fetchBalanceAndNonce = async (address: string) => {
    try {
      const [balanceValue, nonceValue] = await Promise.all([
        getBalance(address),
        getNonce(address)
      ]);
      
      setBalance(balanceValue);
      setNonce(nonceValue);
      return { balance: balanceValue, nonce: nonceValue };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account data');
      console.error('Failed to fetch account data:', err);
      throw err;
    }
  };

  // Create a new wallet
  const createNewWallet = () => {
    try {
      setIsLoading(true);
      const newWallet = generateWallet();
      setWallet(newWallet);
      saveWallet(newWallet);
      
      // Reset balance and nonce for new wallet
      setBalance(BigInt(0));
      setNonce(0);
      
      // Clear any previous errors
      setError(null);
      
      // Set flag for new wallet to trigger backup flow
      setIsNewWallet(true);
      
      // Fetch balance and nonce (will likely be 0 for new wallet)
      fetchBalanceAndNonce(newWallet.address).catch(console.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      console.error('Failed to create wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Import wallet from mnemonic
  const importWallet = (mnemonic: string) => {
    try {
      setIsLoading(true);
      const importedWallet = createWalletFromMnemonic(mnemonic);
      setWallet(importedWallet);
      saveWallet(importedWallet);
      
      // Clear any previous errors
      setError(null);
      
      // Not a new wallet since user already has the mnemonic
      setIsNewWallet(false);
      
      // Fetch balance and nonce
      fetchBalanceAndNonce(importedWallet.address).catch(console.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import wallet');
      console.error('Failed to import wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    clearWallet();
    setWallet(null);
    setBalance(BigInt(0));
    setNonce(0);
    setError(null);
    setIsNewWallet(false);
  };

  // Refresh balance and nonce
  const refreshBalance = async () => {
    if (!wallet) return;
    
    try {
      setIsLoading(true);
      await fetchBalanceAndNonce(wallet.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh balance');
      console.error('Failed to refresh balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    wallet,
    balance,
    nonce,
    isLoading,
    error,
    isNewWallet,
    createNewWallet,
    importWallet,
    disconnectWallet,
    refreshBalance,
    setIsNewWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}