import axios from 'axios';

// Interface for JSON-RPC request
interface JsonRpcRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: any[];
}

// Interface for JSON-RPC response
interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Makes a JSON-RPC call to the Volt node through our local proxy
 */
async function rpcCall<T>(method: string, params: any[] = []): Promise<T> {
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };

  try {
    console.log(`Sending RPC request: ${method}`, JSON.stringify(request));
    
    // Use the local proxy instead of direct RPC URL
    const response = await axios.post<JsonRpcResponse>('/api/rpc', request);
    
    console.log(`Received RPC response:`, JSON.stringify(response.data));
    
    if (response.data.error) {
      throw new Error(`RPC Error: ${response.data.error.message}`);
    }
    
    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Network Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Gets the current root hash of the SMT
 */
export async function getRoot(): Promise<string> {
  return rpcCall<string>('getRoot');
}

/**
 * Gets the balance for an address
 */
export async function getBalance(address: string): Promise<bigint> {
  // Remove 0x prefix if present for consistency
  const cleanAddress = address.startsWith('0x') ? address.substring(2) : address;
  
  const balance = await rpcCall<number | string>('getBalance', [cleanAddress]);
  return BigInt(balance.toString());
}

/**
 * Gets the nonce for an address
 */
export async function getNonce(address: string): Promise<number> {
  // Remove 0x prefix if present for consistency
  const cleanAddress = address.startsWith('0x') ? address.substring(2) : address;
  
  return rpcCall<number>('getNonce', [cleanAddress]);
}

/**
 * Gets a proof for an address
 */
export async function getProof(address: string): Promise<any> {
  // Remove 0x prefix if present for consistency
  const cleanAddress = address.startsWith('0x') ? address.substring(2) : address;
  
  return rpcCall<any>('getProof', [cleanAddress]);
}

/**
 * Sends tokens from one address to another
 */
export async function sendTokens(
  fromAddress: string,
  toAddress: string,
  amount: number,
  nonce: number,
  signature: string
): Promise<string> {
  // Remove 0x prefix if present for consistency
  const cleanFromAddress = fromAddress.startsWith('0x') ? fromAddress.substring(2) : fromAddress;
  const cleanToAddress = toAddress.startsWith('0x') ? toAddress.substring(2) : toAddress;
  
  // Ensure parameters are in the correct format
  const params = [
    cleanFromAddress,
    cleanToAddress,
    amount, // Send as number as expected by the RPC
    nonce,
    signature
  ];
  
  console.log("Sending transaction with params:", JSON.stringify(params));
  
  return rpcCall<string>('send', params);
}

/**
 * Mints new tokens (requires treasury privileges)
 */
export async function mintTokens(
  fromAddress: string,
  signature: string,
  toAddress: string,
  amount: bigint
): Promise<boolean> {
  // Remove 0x prefix if present for consistency
  const cleanFromAddress = fromAddress.startsWith('0x') ? fromAddress.substring(2) : fromAddress;
  const cleanToAddress = toAddress.startsWith('0x') ? toAddress.substring(2) : toAddress;
  
  return rpcCall<boolean>('mint', [
    cleanFromAddress,
    signature,
    cleanToAddress,
    Number(amount), // Convert BigInt to number as expected by the RPC
  ]);
}

/**
 * Gets the total supply of tokens
 */
export async function getTotalSupply(): Promise<bigint> {
  const supply = await rpcCall<string>('get_total_supply');
  return BigInt(supply);
}

/**
 * Gets the maximum supply of tokens
 */
export async function getMaxSupply(): Promise<bigint> {
  const supply = await rpcCall<string>('get_max_supply');
  return BigInt(supply);
}

/**
 * Broadcasts a transaction update
 */
export async function broadcastUpdate(updateMsg: any): Promise<string> {
  return rpcCall<string>('broadcastUpdate', [updateMsg]);
}

/**
 * Gets the peer ID of the node
 */
export async function getPeerId(): Promise<string> {
  return rpcCall<string>('get_peer_id');
}