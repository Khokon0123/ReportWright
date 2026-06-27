import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

export async function ProtectedShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 sm:px-10">
        <Link href="/dashboard">
          <Logo className="text-lg" />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/dashboard" className="font-medium text-black/70 hover:text-black">
            Dashboard
          </Link>
          <Link href="/settings" className="font-medium text-black/70 hover:text-black">
            Settings
          </Link>
          <SignOutButton />
        </nav>
      </header>
      <main className="flex-1 bg-black/[0.015] px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
