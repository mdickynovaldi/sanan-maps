"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions/auth";

interface HeaderProps {
  activeNav?: "explore" | "outlets" | "accessibility" | "about";
}

export function Header({ activeNav = "explore" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const navItems = [
    { id: "explore", label: "Explore", href: "/" },
    { id: "outlets", label: "Outlets", href: "/outlets" },
    { id: "accessibility", label: "Accessibility", href: "/accessibility" },
    { id: "about", label: "About", href: "/about" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <nav className="flex justify-between items-center w-full px-4 md:px-6 py-3 max-w-full mx-auto">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-amber-600 dark:text-amber-500 font-heading">
          <Logo className="h-8 w-8 shrink-0" />
          Sanan Explorer
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 font-heading font-medium text-sm">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "pb-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md px-2 py-1",
                activeNav === item.id
                  ? "text-amber-600 dark:text-amber-500 border-b-2 border-amber-500"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Trailing Icons */}
        <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Dashboard">
                <Link href="/dashboard/user">
                  <span className="material-symbols-outlined">dashboard</span>
                </Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" aria-label="Logout">
                  <span className="material-symbols-outlined">logout</span>
                </Button>
              </form>
            </>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Login">
              <Link href="/login">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </Button>
          )}
          {/* Mobile menu button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "block py-2 px-3 rounded-md font-medium text-sm",
                activeNav === item.id
                  ? "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <form action={signOut} className="mt-2">
              <button type="submit" className="block w-full text-left py-2 px-3 rounded-md font-medium text-sm text-red-600 hover:bg-red-50">
                Logout
              </button>
            </form>
          ) : (
            <Link href="/login" className="block py-2 px-3 rounded-md font-medium text-sm text-amber-600" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
