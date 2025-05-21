"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/wallet";
import { CURRENCY_SYMBOL, NETWORK_NAME } from "@/lib/config";
import { getTotalSupply } from "@/lib/api";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { wallet, balance, nonce, isLoading, refreshBalance } = useWallet();
  const [totalSupply, setTotalSupply] = useState<bigint>(BigInt(0));
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // If no wallet is connected, redirect to wallet page
    if (!wallet && !isLoading) {
      router.push("/wallet");
    }
  }, [wallet, isLoading, router]);

  useEffect(() => {
    // Fetch total supply
    const fetchTotalSupply = async () => {
      try {
        const supply = await getTotalSupply();
        setTotalSupply(supply);
      } catch (error) {
        console.error("Failed to fetch total supply:", error);
      }
    };

    fetchTotalSupply();
  }, []);

  const copyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBalance();
      toast.success("Balance updated");
    } catch (error) {
      toast.error("Failed to refresh balance");
    } finally {
      setRefreshing(false);
    }
  };

  if (!wallet) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="page-container">
      <Header />
      <main className="main-content align-center justify-center items-center flex">
        <div className="grid-container justify-center items-center self-center align-center max-w-4xl gap-4 mt-4">
          <Card className="full-width-card shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Wallet Overview</CardTitle>
              <CardDescription>Your {NETWORK_NAME} wallet details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="flex items-center gap-2">
                  <div className="address-display flex-1">
                    {wallet.address}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyAddress}
                    className="h-8 px-3 flex-shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="grid gap-6 md:grid-cols-2 mt-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Balance</div>
                  <div className="text-3xl font-bold text-primary">
                    {balance.toString()} <span className="text-lg">{CURRENCY_SYMBOL}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Nonce</div>
                  <div className="text-3xl font-bold">{nonce}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                {refreshing ? "Refreshing..." : "Refresh Balance"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/backup")}
                className="gap-2"
              >
                Backup Wallet
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow mt-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Send</span>
              </CardTitle>
              <CardDescription>Transfer tokens to another address</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Send {CURRENCY_SYMBOL} tokens to any address on the {NETWORK_NAME} network.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/send")} className="w-full">
                Send Tokens
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow mt-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Receive</span>
              </CardTitle>
              <CardDescription>Receive tokens from others</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Share your address to receive {CURRENCY_SYMBOL} tokens from others.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/receive")} className="w-full">
                Receive Tokens
              </Button>
            </CardFooter>
          </Card>

          
        </div>
      </main>
    </div>
  );
}