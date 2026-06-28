import type { CampaignMetrics, PeriodMetrics, ReportMetrics } from "@/types/database";

export const MOCK_REPORT_DATA = {
  clientName: "Sunrise Dental Clinic",
  dateRange: "May 2026",
  metrics: {
    impressions: 48200,
    clicks: 1840,
    ctr: 3.82,
    spend: 3240.5,
    conversions: 67,
    cpc: 1.76,
    conversionRate: 3.64,
  },
  previousPeriod: {
    impressions: 41000,
    clicks: 1520,
    ctr: 3.71,
    spend: 2980.0,
    conversions: 54,
    cpc: 1.96,
    conversionRate: 3.55,
  },
  campaigns: [
    { name: "Brand Search", spend: 1200, clicks: 890, conversions: 34 },
    { name: "Competitor Keywords", spend: 980, clicks: 520, conversions: 18 },
    { name: "Display Remarketing", spend: 1060, clicks: 430, conversions: 15 },
  ],
};

export const MOCK_ACCOUNTS: { customerId: string; name: string }[] = [
  { customerId: "1234567890", name: "Sunrise Dental Clinic" },
];

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

function mockCampaigns(): CampaignMetrics[] {
  const totalClicks = MOCK_REPORT_DATA.campaigns.reduce((sum, c) => sum + c.clicks, 0);

  return MOCK_REPORT_DATA.campaigns.map((c, i) => ({
    campaignId: String(i + 1),
    campaignName: c.name,
    impressions: Math.round((c.clicks / totalClicks) * MOCK_REPORT_DATA.metrics.impressions),
    clicks: c.clicks,
    costMicros: Math.round(c.spend * 1_000_000),
    conversions: c.conversions,
  }));
}

/** Returns the mock per-campaign rows (used for "Add client" / metrics-fetching call sites). */
export function getMockCampaignMetrics(): CampaignMetrics[] {
  return mockCampaigns();
}

/** Returns a fully-built ReportMetrics object matching the literal mock numbers above. */
export function getMockReportMetrics(): ReportMetrics {
  const campaigns = mockCampaigns();

  const current: PeriodMetrics = {
    impressions: MOCK_REPORT_DATA.metrics.impressions,
    clicks: MOCK_REPORT_DATA.metrics.clicks,
    ctr: MOCK_REPORT_DATA.metrics.ctr / 100,
    costMicros: Math.round(MOCK_REPORT_DATA.metrics.spend * 1_000_000),
    spend: MOCK_REPORT_DATA.metrics.spend,
    conversions: MOCK_REPORT_DATA.metrics.conversions,
    cpc: MOCK_REPORT_DATA.metrics.cpc,
    campaigns,
  };

  const previous: PeriodMetrics = {
    impressions: MOCK_REPORT_DATA.previousPeriod.impressions,
    clicks: MOCK_REPORT_DATA.previousPeriod.clicks,
    ctr: MOCK_REPORT_DATA.previousPeriod.ctr / 100,
    costMicros: Math.round(MOCK_REPORT_DATA.previousPeriod.spend * 1_000_000),
    spend: MOCK_REPORT_DATA.previousPeriod.spend,
    conversions: MOCK_REPORT_DATA.previousPeriod.conversions,
    cpc: MOCK_REPORT_DATA.previousPeriod.cpc,
    campaigns: [],
  };

  const sortedByConversions = [...campaigns].sort((a, b) => b.conversions - a.conversions);

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
    bestCampaign: sortedByConversions[0] ?? null,
    worstCampaign: sortedByConversions[sortedByConversions.length - 1] ?? null,
    spendPacing: {
      monthlyBudgetEstimate: null,
      projectedSpend: current.spend,
      daysElapsed: 31,
      daysInRange: 31,
    },
  };
}
