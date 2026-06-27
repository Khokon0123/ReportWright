import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getValidAccessToken, listAccessibleAccounts } from "@/lib/google-ads";

export async function GET() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(userData.user.id);
    const accounts = await listAccessibleAccounts(accessToken);
    return NextResponse.json({ accounts });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list Google Ads accounts" },
      { status: 500 }
    );
  }
}
