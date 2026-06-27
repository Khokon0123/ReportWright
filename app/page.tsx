import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 sm:px-10">
        <Logo className="text-lg" />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-black/70 hover:text-black">
            Log in
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
        <span className="mb-4 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
          Built for marketing agencies
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Client-ready Google Ads reports in{" "}
          <span className="text-accent">60 seconds</span>, not 11 hours.
        </h1>
        <p className="mt-5 max-w-xl text-base text-black/60 sm:text-lg">
          Connect Google Ads, pick a client, and ReportWright pulls the metrics,
          writes the narrative, and exports a branded PDF — automatically.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/signup">
            <Button className="px-6 py-3 text-base">Start free</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="px-6 py-3 text-base">
              I have an account
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-black/10 px-6 py-6 text-center text-xs text-black/40 sm:px-10">
        © {new Date().getFullYear()} ByteWright LLC. All rights reserved.
      </footer>
    </div>
  );
}
