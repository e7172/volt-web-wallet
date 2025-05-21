import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const rpcUrl = 'http://3.90.180.149:8545/rpc';
  
  try {
    const body = await request.json();
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('RPC proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to RPC server' },
      { status: 500 }
    );
  }
}