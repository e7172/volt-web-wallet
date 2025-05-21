"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { CURRENCY_SYMBOL } from "@/lib/config";
import { sendTokens, getNonce } from "@/lib/api";
import { signMessage, createTransactionMessage } from "@/lib/wallet";
import { toast } from "sonner";

export default function SendPage() {
  const router = useRouter();
  const { wallet, balance, nonce, refreshBalance } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no wallet is connected, redirect to wallet page
    if (!wallet) {
      router.push("/wallet");
    }
  }, [wallet, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet) {
      toast.error("No wallet connected");
      return;
    }

    // Validate recipient address - allow any non-empty string
    if (!recipient || recipient.trim() === "") {
      setError("Please enter a recipient address");
      return;
    }

    // Clean up recipient address - remove 0x prefix if present
    const cleanRecipient = recipient.trim().startsWith("0x") 
      ? recipient.trim().substring(2) 
      : recipient.trim();

    // Validate amount
    const amountValue = parseInt(amount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Invalid amount - must be a positive whole number");
      return;
    }
    
    // Check if balance is sufficient
    if (BigInt(amountValue) > balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get the latest nonce
      const latestNonce = await getNonce(wallet.address);
      
      // Create transaction message in the exact format expected by the Rust backend
      const messageBytes = createTransactionMessage(
        wallet.address,
        cleanRecipient,
        amountValue,
        latestNonce
      );
      
      // Sign the transaction
      const signatureHex = signMessage(messageBytes, wallet.privateKey);
      
      console.log("From address:", wallet.address);
      console.log("To address:", cleanRecipient);
      console.log("Amount:", amountValue);
      console.log("Nonce:", latestNonce);
      console.log("Signature:", signatureHex);
      
      // Send the transaction
      const txHash = await sendTokens(
        wallet.address,
        cleanRecipient,
        amountValue,
        latestNonce,
        signatureHex
      );
      
      toast.success(`Transaction sent! Hash: ${txHash}`);
      
      // Refresh balance
      await refreshBalance();
      
      // Clear form
      setRecipient("");
      setAmount("");
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to send transaction:", err);
      setError(err instanceof Error ? err.message : "Failed to send transaction");
      toast.error("Failed to send transaction");
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="page-container">
      <Header />
      <main className="main-content flex items-center justify-center">
        <Card className="card-container shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Send {CURRENCY_SYMBOL}</CardTitle>
            <CardDescription>Transfer tokens to another address</CardDescription>
          </CardHeader>
          <form onSubmit={handleSend}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="balance">Available Balance</Label>
                <div className="text-2xl font-bold text-primary">
                  {balance.toString()} {CURRENCY_SYMBOL}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the full address of the recipient (with or without 0x prefix)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="pr-16"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-sm text-muted-foreground">{CURRENCY_SYMBOL}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter whole numbers only (no decimals)
                </p>
              </div>
              
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-4 border-t">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Tokens"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}