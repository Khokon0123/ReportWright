"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { agency_name: agencyName } },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from("users")
        .update({ agency_name: agencyName })
        .eq("id", data.user.id);
    }

    setLoading(false);

    if (!data.session) {
      toast.success("Check your email to confirm your account.");
      router.push("/login");
      return;
    }

    toast.success("Account created!");
    router.push("/dashboard");
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
            Reporting that<br />runs itself.
          </p>
          <p className="mt-4 text-base text-white/65 leading-relaxed max-w-sm">
            Join agencies using ReportWright to turn Google Ads data into client-ready PDFs in seconds, not hours.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {[
              "Free to start — no credit card needed",
              "Connects to all Google Ads accounts you manage",
              "Branded PDF with AI narrative in 60 seconds",
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

          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1.5 text-sm text-black/50">
            Start generating reports in under 5 minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              id="agencyName"
              type="text"
              label="Agency name"
              autoComplete="organization"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Acme Marketing Co."
            />
            <Input
              id="email"
              type="email"
              label="Work email"
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
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            <Button type="submit" loading={loading} className="mt-2 w-full py-3">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-black/50">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
