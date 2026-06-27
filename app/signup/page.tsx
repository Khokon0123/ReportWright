"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <Link href="/" className="mb-8">
        <Logo className="text-xl" />
      </Link>

      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-black/60">
          Start generating client reports in minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-black/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
