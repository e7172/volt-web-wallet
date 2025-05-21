"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

export default function BackupPage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // If no wallet is connected, redirect to wallet page
    if (!wallet) {
      router.push("/wallet");
    }
  }, [wallet, router]);

  const copyMnemonic = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.mnemonic);
    setCopied(true);
    toast.success("Recovery phrase copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    toast.success("Recovery phrase backup confirmed");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  if (!wallet) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container w-full py-12 flex justify-center items-center">
        <Card className="flex justify-center max-w-4xl" style={{justifyContent:'center', alignSelf:'center', alignContent:'center'}}>
          <CardHeader>
            <CardTitle>Backup Recovery Phrase</CardTitle>
            <CardDescription>
              Your recovery phrase is the only way to restore your wallet if you lose access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-900/30">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-500">Important Security Warning</h3>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 list-disc pl-5 space-y-1">
                  <li>Never share your recovery phrase with anyone</li>
                  <li>Store it in a secure location</li>
                  <li>Anyone with this phrase can access your funds</li>
                  <li>Volt will never ask for this phrase</li>
                </ul>
              </div>

              {showMnemonic ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Your Recovery Phrase
                  </div>
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <code className="break-all text-sm block">
                      {wallet.mnemonic}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Write these words down in the exact order shown above
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button onClick={() => setShowMnemonic(true)}>
                    Reveal Recovery Phrase
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {showMnemonic && (
              <Button 
                className="w-full" 
                onClick={copyMnemonic}
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant={confirmed ? "outline" : "default"}
                  className="w-full"
                  disabled={!showMnemonic}
                >
                  {confirmed ? "Backup Confirmed" : "I've Backed Up My Phrase"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Backup</DialogTitle>
                  <DialogDescription>
                    Please confirm that you have backed up your recovery phrase in a secure location.
                    Without this phrase, you cannot recover your wallet if you lose access.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    I understand that:
                  </p>
                  <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                    <li>My recovery phrase is the only way to restore my wallet</li>
                    <li>Volt does not store my recovery phrase</li>
                    <li>If I lose my recovery phrase, I will lose access to my funds</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button onClick={handleConfirm}>
                    I've Securely Backed Up My Phrase
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
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