import type { CampaignMetrics, ReportMetrics } from "@/types/database";
import { MOCK_ACCOUNTS, getMockCampaignMetrics, getMockReportMetrics } from "@/lib/mock-data";

/**
 * Google Ads API calls are mocked for now (see lib/mock-data.ts) — connecting
 * via OAuth still works, but report data is always the demo dataset.
 */
export async function getValidAccessToken(_userId: string): Promise<string> {
  return "mock-access-token";
}

export interface GoogleAdsAccount {
  customerId: string;
  name: string;
}

/** Lists Google Ads accounts directly accessible to the authenticated user. */
export async function listAccessibleAccounts(_accessToken: string): Promise<GoogleAdsAccount[]> {
  return MOCK_ACCOUNTS;
}

/** Pulls campaign-level metrics for a customer over a date range (YYYY-MM-DD). */
export async function fetchCampaignMetrics(
  _accessToken: string,
  _customerId: string,
  _startDate: string,
  _endDate: string
): Promise<CampaignMetrics[]> {
  return getMockCampaignMetrics();
}

export function buildReportMetrics(
  _currentCampaigns: CampaignMetrics[],
  _previousCampaigns: CampaignMetrics[],
  _rangeStart: string,
  _rangeEnd: string
): ReportMetrics {
  return getMockReportMetrics();
}
