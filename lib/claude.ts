import type { NarrativeSections, ReportMetrics } from "@/types/database";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

function formatPercent(value: number): string {
  const pct = (value * 100).toFixed(1);
  return `${value >= 0 ? "+" : ""}${pct}%`;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function summarizeMetrics(metrics: ReportMetrics): string {
  const { current, previous, deltas, bestCampaign, worstCampaign, spendPacing } = metrics;

  return `
Current period:
- Impressions: ${current.impressions.toLocaleString()}
- Clicks: ${current.clicks.toLocaleString()}
- CTR: ${(current.ctr * 100).toFixed(2)}%
- Spend: ${formatMoney(current.spend)}
- Conversions: ${current.conversions}
- CPC: ${formatMoney(current.cpc)}

Previous period:
- Impressions: ${previous.impressions.toLocaleString()}
- Clicks: ${previous.clicks.toLocaleString()}
- CTR: ${(previous.ctr * 100).toFixed(2)}%
- Spend: ${formatMoney(previous.spend)}
- Conversions: ${previous.conversions}
- CPC: ${formatMoney(previous.cpc)}

Period-over-period change:
- Impressions: ${formatPercent(deltas.impressions)}
- Clicks: ${formatPercent(deltas.clicks)}
- CTR: ${formatPercent(deltas.ctr)}
- Spend: ${formatPercent(deltas.spend)}
- Conversions: ${formatPercent(deltas.conversions)}
- CPC: ${formatPercent(deltas.cpc)}

Best performing campaign: ${bestCampaign ? `${bestCampaign.campaignName} (${bestCampaign.conversions} conversions, ${bestCampaign.clicks} clicks)` : "N/A"}
Worst performing campaign: ${worstCampaign ? `${worstCampaign.campaignName} (${worstCampaign.conversions} conversions, ${worstCampaign.clicks} clicks)` : "N/A"}

Spend pacing: ${formatMoney(current.spend)} spent over ${spendPacing.daysElapsed} of ${spendPacing.daysInRange} days. Projected end-of-period spend: ${formatMoney(spendPacing.projectedSpend)}.
`.trim();
}

export async function generateNarrative(
  agencyName: string,
  clientName: string,
  metrics: ReportMetrics
): Promise<NarrativeSections> {
  const systemPrompt = `You are a senior PPC analyst writing a client report for ${agencyName}. The numbers are: ${summarizeMetrics(metrics)}. Write 3 sections: 1) Executive Summary (2-3 sentences), 2) What Happened This Month (bullet points, plain English), 3) Recommendations for Next Month (3 bullets). Never invent numbers. Only reference the data provided.

Respond with ONLY a JSON object in this exact shape, no surrounding text or markdown fences:
{"executiveSummary": string, "whatHappened": string[], "recommendations": string[]}`;

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Write the report for client "${clientName}".` },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed: ${await res.text()}`);
  }

  const data = await res.json();
  const text: string = data.message?.content ?? "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return {
      executiveSummary: parsed.executiveSummary ?? "",
      whatHappened: Array.isArray(parsed.whatHappened) ? parsed.whatHappened : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch {
    return {
      executiveSummary: text,
      whatHappened: [],
      recommendations: [],
    };
  }
}
