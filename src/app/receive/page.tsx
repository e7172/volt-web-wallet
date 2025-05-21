"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { CURRENCY_SYMBOL } from "@/lib/config";
import { toast } from "sonner";

export default function ReceivePage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If no wallet is connected, redirect to wallet page
    if (!wallet) {
      router.push("/wallet");
    }
  }, [wallet, router]);

  const copyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
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
            <CardTitle className="text-2xl">Receive {CURRENCY_SYMBOL}</CardTitle>
            <CardDescription>Share your address to receive tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 flex flex-col items-center">
            <div className="qr-container shadow-md">
              <QRCodeSVG 
                value={wallet.address}
                size={240}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            
            <div className="space-y-2 w-full">
              <div className="text-sm font-medium text-muted-foreground text-center">
                Your Wallet Address
              </div>
              <div className="address-display">
                {wallet.address}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Share this address with others to receive {CURRENCY_SYMBOL} tokens
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full" 
              onClick={copyAddress}
            >
              {copied ? "Copied!" : "Copy Address"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}