import type { CampaignMetrics, PeriodMetrics, ReportMetrics } from "@/types/database";
import { createAdminClient } from "@/lib/supabase-admin";

const API_VERSION = "v24";
const BASE_URL = `https://googleads.googleapis.com/${API_VERSION}`;

interface GoogleConnectionRow {
  access_token: string;
  refresh_token: string;
  token_expiry: string;
}

/**
 * Returns a valid Google Ads access token for the user, refreshing it
 * via the OAuth refresh_token grant if it has expired.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("google_connections")
    .select("access_token, refresh_token, token_expiry")
    .eq("user_id", userId)
    .single<GoogleConnectionRow>();

  if (error || !data) {
    throw new Error("No Google Ads connection found for this user.");
  }

  const expiresAt = new Date(data.token_expiry).getTime();
  if (expiresAt - Date.now() > 60_000) {
    return data.access_token;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh Google access token: ${await res.text()}`);
  }

  const refreshed = await res.json();
  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await supabase
    .from("google_connections")
    .update({ access_token: refreshed.access_token, token_expiry: newExpiry })
    .eq("user_id", userId);

  return refreshed.access_token;
}

function gAdsHeaders(accessToken: string, loginCustomerId?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    "Content-Type": "application/json",
  };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
  return headers;
}

export interface GoogleAdsAccount {
  customerId: string;
  name: string;
}

/** Lists Google Ads accounts directly accessible to the authenticated user. */
export async function listAccessibleAccounts(accessToken: string): Promise<GoogleAdsAccount[]> {
  const res = await fetch(`${BASE_URL}/customers:listAccessibleCustomers`, {
    headers: gAdsHeaders(accessToken),
  });

  if (!res.ok) {
    throw new Error(`Failed to list Google Ads accounts: ${await res.text()}`);
  }

  const { resourceNames = [] } = await res.json();
  const accounts: GoogleAdsAccount[] = [];

  for (const resourceName of resourceNames as string[]) {
    const customerId = resourceName.split("/")[1];
    try {
      const name = await fetchAccountName(accessToken, customerId);
      accounts.push({ customerId, name: name ?? customerId });
    } catch {
      accounts.push({ customerId, name: customerId });
    }
  }

  return accounts;
}

async function fetchAccountName(accessToken: string, customerId: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/googleAds:search`, {
    method: "POST",
    headers: gAdsHeaders(accessToken, customerId),
    body: JSON.stringify({ query: "SELECT customer.descriptive_name FROM customer LIMIT 1" }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0]?.customer?.descriptiveName ?? null;
}

interface GAQLCampaignRow {
  campaign: { id: string; name: string };
  metrics: {
    impressions: string;
    clicks: string;
    costMicros: string;
    conversions: number;
  };
}

/** Pulls campaign-level metrics for a customer over a date range (YYYY-MM-DD). */
export async function fetchCampaignMetrics(
  accessToken: string,
  customerId: string,
  startDate: string,
  endDate: string
): Promise<CampaignMetrics[]> {
  const query = `
    SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks,
           metrics.cost_micros, metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
  `;

  const res = await fetch(`${BASE_URL}/customers/${customerId}/googleAds:search`, {
    method: "POST",
    headers: gAdsHeaders(accessToken, customerId),
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Google Ads API error: ${await res.text()}`);
  }

  const data = await res.json();
  const rows: GAQLCampaignRow[] = data.results ?? [];

  return rows.map((row) => ({
    campaignId: row.campaign.id,
    campaignName: row.campaign.name,
    impressions: Number(row.metrics.impressions ?? 0),
    clicks: Number(row.metrics.clicks ?? 0),
    costMicros: Number(row.metrics.costMicros ?? 0),
    conversions: Number(row.metrics.conversions ?? 0),
  }));
}

function aggregatePeriod(campaigns: CampaignMetrics[]): PeriodMetrics {
  const impressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const costMicros = campaigns.reduce((sum, c) => sum + c.costMicros, 0);
  const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const spend = costMicros / 1_000_000;

  return {
    impressions,
    clicks,
    ctr: impressions > 0 ? clicks / impressions : 0,
    costMicros,
    spend,
    conversions,
    cpc: clicks > 0 ? spend / clicks : 0,
    campaigns,
  };
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

function pickBestAndWorst(campaigns: CampaignMetrics[]) {
  const withSpend = campaigns.filter((c) => c.costMicros > 0);
  const pool = withSpend.length > 0 ? withSpend : campaigns;
  if (pool.length === 0) return { best: null, worst: null };

  const score = (c: CampaignMetrics) =>
    c.conversions > 0 ? c.conversions : c.clicks > 0 ? c.clicks / 1000 : 0;

  const sorted = [...pool].sort((a, b) => score(b) - score(a));
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

export function buildReportMetrics(
  currentCampaigns: CampaignMetrics[],
  previousCampaigns: CampaignMetrics[],
  rangeStart: string,
  rangeEnd: string
): ReportMetrics {
  const current = aggregatePeriod(currentCampaigns);
  const previous = aggregatePeriod(previousCampaigns);
  const { best, worst } = pickBestAndWorst(current.campaigns);

  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);
  const today = new Date();
  const daysInRange = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  );
  const daysElapsed = Math.min(
    daysInRange,
    Math.max(1, Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1)
  );
  const projectedSpend = (current.spend / daysElapsed) * daysInRange;

  return {
    current,
    previous,
    deltas: {
      impressions: percentChange(current.impressions, previous.impressions),
      clicks: percentChange(current.clicks, previous.clicks),
      ctr: percentChange(current.ctr, previous.ctr),
      spend: percentChange(current.spend, previous.spend),
      conversions: percentChange(current.conversions, previous.conversions),
      cpc: percentChange(current.cpc, previous.cpc),
    },
    bestCampaign: best,
    worstCampaign: worst,
    spendPacing: {
      monthlyBudgetEstimate: null,
      projectedSpend,
      daysElapsed,
      daysInRange,
    },
  };
}
