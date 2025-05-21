"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";

export default function Home() {
  const router = useRouter();
  const { wallet, isLoading } = useWallet();

  useEffect(() => {
    // Wait until wallet loading state is resolved
    if (isLoading) return;
    
    // Redirect based on wallet state
    if (wallet) {
      router.push("/dashboard");
    } else {
      router.push("/wallet");
    }
  }, [wallet, isLoading, router]);

  // Return a minimal loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold">Loading Volt...</h2>
      </div>
    </div>
  );
}
