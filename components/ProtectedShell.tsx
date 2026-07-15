"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { HelpChat } from "@/components/HelpChat";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active ? "text-black" : "text-black/50 hover:text-black"
      }`}
    >
      {children}
    </Link>
  );
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/8 bg-white/95 px-6 py-4 backdrop-blur sm:px-10">
        <Link href="/dashboard">
          <Logo className="text-lg" />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/settings">Settings</NavLink>
          <SignOutButton />
        </nav>
      </header>
      <main className="flex-1 bg-black/[0.018] px-6 py-10 sm:px-10">{children}</main>
      <HelpChat />
    </div>
  );
}
