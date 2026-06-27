import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${await res.text()}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}

export default async function ConnectCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; state?: string; error?: string };
}) {
  if (searchParams.error) {
    return <CallbackResult success={false} message="You declined Google Ads access, or the request was cancelled." />;
  }

  const expectedState = cookies().get("google_oauth_state")?.value;
  if (!searchParams.code || !searchParams.state || searchParams.state !== expectedState) {
    return <CallbackResult success={false} message="This connection request is invalid or expired. Please try again." />;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return <CallbackResult success={false} message="You must be logged in to connect Google Ads." />;
  }

  try {
    const tokens = await exchangeCodeForTokens(searchParams.code);

    if (!tokens.refresh_token) {
      return (
        <CallbackResult
          success={false}
          message="Google didn't return a refresh token. Revoke ReportWright's access in your Google Account and try connecting again."
        />
      );
    }

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error } = await supabase.from("google_connections").upsert(
      {
        user_id: userData.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokenExpiry,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;

    return <CallbackResult success={true} message="Google Ads connected successfully." />;
  } catch (err) {
    return (
      <CallbackResult
        success={false}
        message={err instanceof Error ? err.message : "Something went wrong connecting Google Ads."}
      />
    );
  }
}

function CallbackResult({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <Card className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold">
          {success ? "Connected" : "Connection failed"}
        </h1>
        <p className="mt-2 text-sm text-black/60">{message}</p>
        <Link href="/dashboard">
          <Button className="mt-6 w-full">Go to dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
