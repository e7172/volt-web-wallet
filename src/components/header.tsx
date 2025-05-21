"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/wallet";
import { CURRENCY_SYMBOL } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const { wallet, balance, disconnectWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Send", path: "/send" },
    { name: "Receive", path: "/receive" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="font-bold text-xl text-primary">Volt</div>
          </Link>
          {wallet && (
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {wallet ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
                <span className="font-medium text-sm">
                  {balance.toString()} {CURRENCY_SYMBOL}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback>
                        {formatAddress(wallet.address).substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                    {copied ? "Copied!" : `Copy Address: ${formatAddress(wallet.address)}`}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/backup"} className="cursor-pointer">
                    Backup Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-destructive">
                    Disconnect Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/wallet">
              <Button>Connect Wallet</Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {wallet && (
        <div className="md:hidden flex justify-around border-t py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary flex flex-col items-center ${
                pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}