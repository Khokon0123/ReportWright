import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { fetchCampaignMetrics, getValidAccessToken, buildReportMetrics } from "@/lib/google-ads";
import { generateNarrative } from "@/lib/claude";
import { resolveDateRanges, type DateRangePreset } from "@/lib/date-ranges";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, preset, startDate, endDate } = body as {
    clientId?: string;
    preset?: DateRangePreset;
    startDate?: string;
    endDate?: string;
  };

  if (!clientId || !preset) {
    return NextResponse.json({ error: "clientId and preset are required" }, { status: 400 });
  }

  const [{ data: client, error: clientError }, { data: profile }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, client_name, google_ads_customer_id")
      .eq("id", clientId)
      .eq("user_id", userData.user.id)
      .single(),
    supabase.from("users").select("agency_name").eq("id", userData.user.id).single(),
  ]);

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  let dateRange;
  try {
    dateRange = resolveDateRanges(preset, startDate, endDate);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid date range" },
      { status: 400 }
    );
  }

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      user_id: userData.user.id,
      client_id: client.id,
      date_range_start: dateRange.current.start,
      date_range_end: dateRange.current.end,
      status: "generating",
    })
    .select()
    .single();

  if (insertError || !report) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }

  try {
    const accessToken = await getValidAccessToken(userData.user.id);
    const customerId = client.google_ads_customer_id;

    const [currentCampaigns, previousCampaigns] = await Promise.all([
      fetchCampaignMetrics(accessToken, customerId, dateRange.current.start, dateRange.current.end),
      fetchCampaignMetrics(accessToken, customerId, dateRange.previous.start, dateRange.previous.end),
    ]);

    const metrics = buildReportMetrics(
      currentCampaigns,
      previousCampaigns,
      dateRange.current.start,
      dateRange.current.end
    );

    const narrative = await generateNarrative(
      profile?.agency_name || "your agency",
      client.client_name,
      metrics
    );

    const narrativeText = [
      narrative.executiveSummary,
      "",
      "What Happened This Month:",
      ...narrative.whatHappened.map((b) => `- ${b}`),
      "",
      "Recommendations for Next Month:",
      ...narrative.recommendations.map((b) => `- ${b}`),
    ].join("\n");

    const { data: updated, error: updateError } = await supabase
      .from("reports")
      .update({
        metrics_json: metrics,
        narrative_text: narrativeText,
        status: "complete",
      })
      .eq("id", report.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ report: updated });
  } catch (err) {
    await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
