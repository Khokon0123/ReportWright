import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { fetchCampaignMetrics, getValidAccessToken, buildReportMetrics } from "@/lib/google-ads";
import { resolveDateRanges, type DateRangePreset } from "@/lib/date-ranges";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("clientId");
  const preset = (searchParams.get("preset") || "this_month") as DateRangePreset;
  const customStart = searchParams.get("startDate") ?? undefined;
  const customEnd = searchParams.get("endDate") ?? undefined;

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("google_ads_customer_id")
    .eq("id", clientId)
    .eq("user_id", userData.user.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  try {
    const { current, previous } = resolveDateRanges(preset, customStart, customEnd);
    const accessToken = await getValidAccessToken(userData.user.id);
    const customerId = client.google_ads_customer_id;

    const [currentCampaigns, previousCampaigns] = await Promise.all([
      fetchCampaignMetrics(accessToken, customerId, current.start, current.end),
      fetchCampaignMetrics(accessToken, customerId, previous.start, previous.end),
    ]);

    const metrics = buildReportMetrics(currentCampaigns, previousCampaigns, current.start, current.end);

    return NextResponse.json({ metrics, dateRange: current });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch Google Ads metrics" },
      { status: 500 }
    );
  }
}
