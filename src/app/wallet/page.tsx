"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

export default function WalletPage() {
  const router = useRouter();
  const { wallet, isNewWallet, createNewWallet, importWallet } = useWallet();
  const [mnemonic, setMnemonic] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If wallet is already connected, redirect appropriately
  useEffect(() => {
    if (wallet) {
      if (isNewWallet) {
        router.push("/backup");
      } else {
        router.push("/dashboard");
      }
    }
  }, [wallet, isNewWallet, router]);

  const handleCreateWallet = () => {
    try {
      setIsLoading(true);
      createNewWallet();
      toast.success("Wallet created successfully!");
      // The useEffect will handle redirection to backup page
    } catch (error) {
      toast.error("Failed to create wallet");
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleImportWallet = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mnemonic.trim()) {
      toast.error("Please enter your recovery phrase");
      return;
    }

    try {
      setIsLoading(true);
      importWallet(mnemonic.trim());
      toast.success("Wallet imported successfully!");
      // The useEffect will handle redirection to dashboard
    } catch (error) {
      toast.error("Invalid recovery phrase");
      console.error(error);
      setIsLoading(false);
    }
  };

  // If already redirecting, don't render the page content
  if (wallet) {
    return null;
  }

  return (
    <div className="wallet-container">
      <Header />
      <main className="flex-1 flex items-center justify-center w-full p-4">
        <Card className="card-container shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Volt</CardTitle>
            <CardDescription>Create a new wallet or import an existing one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="import">Import</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground">
                    Create a new wallet to send and receive tokens on the Volt network.
                  </p>
                  <p className="text-muted-foreground">
                    Make sure to back up your recovery phrase after creation.
                  </p>
                </div>
                <Button 
                  className="w-full py-6 text-lg" 
                  onClick={handleCreateWallet}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create New Wallet"}
                </Button>
              </TabsContent>
              <TabsContent value="import" className="space-y-6">
                <form onSubmit={handleImportWallet} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="mnemonic">Recovery Phrase</Label>
                    <Input
                      id="mnemonic"
                      placeholder="Enter your 12-word recovery phrase"
                      value={mnemonic}
                      onChange={(e) => setMnemonic(e.target.value)}
                      className="h-24 py-2 px-3"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your 12-word recovery phrase separated by spaces
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Importing..." : "Import Wallet"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-xs text-muted-foreground text-center">
              Your private keys are stored locally and never leave your device
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}