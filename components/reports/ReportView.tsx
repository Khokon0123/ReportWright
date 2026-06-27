"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { pdf } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReportPDFDocument } from "@/components/reports/ReportPDFDocument";
import type { Report } from "@/types/database";

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ReportView({
  report,
  clientName,
  agencyName,
  logoUrl,
}: {
  report: Report;
  clientName: string;
  agencyName: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const [narrativeText, setNarrativeText] = useState(report.narrative_text ?? "");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(report.pdf_url);

  const metrics = report.metrics_json;

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("reports")
      .update({ narrative_text: narrativeText })
      .eq("id", report.id);
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Narrative saved");
    router.refresh();
  }

  async function handleExport() {
    if (!metrics) return;
    setExporting(true);

    try {
      const blob = await pdf(
        <ReportPDFDocument
          agencyName={agencyName}
          logoUrl={logoUrl}
          clientName={clientName}
          dateRangeStart={report.date_range_start}
          dateRangeEnd={report.date_range_end}
          metrics={metrics}
          narrativeText={narrativeText}
        />
      ).toBlob();

      const supabase = createClient();
      const path = `${report.user_id}/${report.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(path, blob, { upsert: true, contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("reports").getPublicUrl(path);
      const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      await supabase.from("reports").update({ pdf_url: url }).eq("id", report.id);
      setPdfUrl(url);

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${clientName.replace(/\s+/g, "-")}-report.pdf`;
      a.click();
      URL.revokeObjectURL(downloadUrl);

      toast.success("PDF exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{clientName}</h1>
          <p className="mt-1 text-sm text-black/60">
            {report.date_range_start} → {report.date_range_end}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSave} loading={saving}>
            Save
          </Button>
          <Button onClick={handleExport} loading={exporting}>
            Export PDF
          </Button>
        </div>
      </div>

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-accent hover:underline"
        >
          View last exported PDF →
        </a>
      )}

      {metrics && (
        <Card>
          <h2 className="mb-4 text-base font-semibold">Key metrics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricStat label="Impressions" value={metrics.current.impressions.toLocaleString()} delta={metrics.deltas.impressions} />
            <MetricStat label="Clicks" value={metrics.current.clicks.toLocaleString()} delta={metrics.deltas.clicks} />
            <MetricStat label="CTR" value={`${(metrics.current.ctr * 100).toFixed(2)}%`} delta={metrics.deltas.ctr} />
            <MetricStat label="Spend" value={formatMoney(metrics.current.spend)} delta={metrics.deltas.spend} />
            <MetricStat label="Conversions" value={metrics.current.conversions.toLocaleString()} delta={metrics.deltas.conversions} />
            <MetricStat label="CPC" value={formatMoney(metrics.current.cpc)} delta={metrics.deltas.cpc} />
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Narrative</h2>
          <span className="text-xs text-black/40">Editable before export</span>
        </div>
        <textarea
          value={narrativeText}
          onChange={(e) => setNarrativeText(e.target.value)}
          rows={18}
          className="w-full rounded-lg border border-black/15 bg-white p-3.5 text-sm leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </Card>
    </div>
  );
}

function MetricStat({ label, value, delta }: { label: string; value: string; delta: number }) {
  return (
    <div className="rounded-lg border border-black/10 p-3">
      <p className="text-xs text-black/50">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className={`text-xs ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
        {formatPercent(delta)} vs. prior
      </p>
    </div>
  );
}
