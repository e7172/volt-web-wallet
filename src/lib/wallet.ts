import * as bip39 from 'bip39';
import { ed25519 } from '@noble/curves/ed25519';
import { STORAGE_KEYS } from './config';

export interface WalletData {
  mnemonic: string;
  address: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

/**
 * Generates a new wallet with a random mnemonic
 */
export function generateWallet(): WalletData {
  const mnemonic = bip39.generateMnemonic();
  return createWalletFromMnemonic(mnemonic);
}

/**
 * Creates a wallet from an existing mnemonic
 */
export function createWalletFromMnemonic(mnemonic: string): WalletData {
  // Validate mnemonic
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic');
  }

  try {
    // Generate seed from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Use the first 32 bytes of the seed as private key
    const privateKeyBytes = seed.slice(0, 32);
    const privateKey = new Uint8Array(privateKeyBytes);
    
    // Generate public key from private key
    const publicKey = ed25519.getPublicKey(privateKey);
    
    // Use the public key as the address (similar to the Rust implementation)
    const address = Buffer.from(publicKey).toString('hex');
    
    return {
      mnemonic,
      address,
      privateKey,
      publicKey,
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error('Failed to create wallet from mnemonic');
  }
}

/**
 * Creates a transaction message for signing in the exact format expected by the Rust backend
 */
export function createTransactionMessage(
  from: string, 
  to: string, 
  amount: number, 
  nonce: number
): Uint8Array {
  // Clean addresses - remove 0x prefix if present
  const fromHex = from.startsWith('0x') ? from.substring(2) : from;
  const toHex = to.startsWith('0x') ? to.substring(2) : to;
  
  // Create the transaction object exactly as the Rust backend expects
  const transaction = {
    from: fromHex,
    to: toHex,
    amount: amount,
    nonce: nonce
  };
  
  // Convert to JSON string and then to bytes - exactly matching the Rust implementation
  const jsonStr = JSON.stringify(transaction);
  console.log("Message to sign:", jsonStr);
  
  return new TextEncoder().encode(jsonStr);
}

/**
 * Signs a message with the wallet's private key
 * Returns the signature as a hex string
 */
export function signMessage(message: Uint8Array, privateKey: Uint8Array): string {
  // Sign the message using ed25519
  const signature = ed25519.sign(message, privateKey);
  
  // Convert signature to hex string
  return Buffer.from(signature).toString('hex');
}

/**
 * Verifies a signature
 */
export function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return ed25519.verify(signature, message, publicKey);
}

/**
 * Saves wallet data to local storage
 */
export function saveWallet(wallet: WalletData): void {
  localStorage.setItem(STORAGE_KEYS.MNEMONIC, wallet.mnemonic);
  localStorage.setItem(STORAGE_KEYS.ADDRESS, wallet.address);
  
  // Note: We don't store the private key directly in localStorage for security reasons
  // In a production app, you might want to encrypt it with a password
  const walletData = {
    mnemonic: wallet.mnemonic,
    address: wallet.address,
  };
  
  localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(walletData));
}

/**
 * Loads wallet data from local storage
 */
export function loadWallet(): WalletData | null {
  const mnemonic = localStorage.getItem(STORAGE_KEYS.MNEMONIC);
  
  if (!mnemonic) {
    return null;
  }
  
  try {
    return createWalletFromMnemonic(mnemonic);
  } catch (error) {
    console.error('Failed to load wallet:', error);
    return null;
  }
}

/**
 * Clears wallet data from local storage
 */
export function clearWallet(): void {
  localStorage.removeItem(STORAGE_KEYS.MNEMONIC);
  localStorage.removeItem(STORAGE_KEYS.ADDRESS);
  localStorage.removeItem(STORAGE_KEYS.WALLET);
}

/**
 * Formats an address for display (shortens it)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}