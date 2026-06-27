export type ReportStatus = "pending" | "generating" | "complete" | "failed";

export interface UserProfile {
  id: string;
  email: string;
  agency_name: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface GoogleConnection {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  connected_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  google_ads_customer_id: string;
  client_name: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  client_id: string;
  date_range_start: string;
  date_range_end: string;
  metrics_json: ReportMetrics | null;
  narrative_text: string | null;
  status: ReportStatus;
  pdf_url: string | null;
  created_at: string;
}

export interface ReportWithClient extends Report {
  clients: Pick<Client, "client_name" | "google_ads_customer_id"> | null;
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
}

export interface PeriodMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  costMicros: number;
  spend: number;
  conversions: number;
  cpc: number;
  campaigns: CampaignMetrics[];
}

export interface ReportMetrics {
  current: PeriodMetrics;
  previous: PeriodMetrics;
  deltas: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    conversions: number;
    cpc: number;
  };
  bestCampaign: CampaignMetrics | null;
  worstCampaign: CampaignMetrics | null;
  spendPacing: {
    monthlyBudgetEstimate: number | null;
    projectedSpend: number;
    daysElapsed: number;
    daysInRange: number;
  };
}

export interface NarrativeSections {
  executiveSummary: string;
  whatHappened: string[];
  recommendations: string[];
}
