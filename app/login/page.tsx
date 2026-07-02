"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
    router.push(searchParams.get("redirectTo") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-accent p-12">
        <Link href="/">
          <Logo className="text-xl text-white [&>span]:text-white" />
        </Link>
        <div>
          <p className="text-4xl font-semibold leading-tight text-white">
            Your client reports,<br />written for you.
          </p>
          <p className="mt-4 text-base text-white/65 leading-relaxed max-w-sm">
            Connect Google Ads, pick a client, and get a branded PDF with AI-written narrative in under 60 seconds.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {[
              "Pull live campaign metrics automatically",
              "AI writes the executive summary & narrative",
              "Export a branded PDF ready to send",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-xs">✓</span>
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/35">© {new Date().getFullYear()} ByteWright LLC</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 block lg:hidden">
            <Logo className="text-xl" />
          </Link>

          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1.5 text-sm text-black/50">
            Log in to your ReportWright account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" loading={loading} className="mt-2 w-full py-3">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/50">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
