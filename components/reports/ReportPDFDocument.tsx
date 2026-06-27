import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReportMetrics } from "@/types/database";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2pt solid #2563EB",
    paddingBottom: 16,
    marginBottom: 24,
  },
  logo: { width: 48, height: 48, objectFit: "contain" },
  agencyName: { fontSize: 14, fontWeight: 700 },
  reportTitle: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  reportSubtitle: { fontSize: 11, color: "#555555" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 8,
    color: "#2563EB",
  },
  paragraph: { fontSize: 11, lineHeight: 1.5 },
  bullet: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { width: 12, fontSize: 11 },
  bulletText: { flex: 1, fontSize: 11, lineHeight: 1.4 },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  metricBox: {
    width: "30%",
    border: "1pt solid #e5e5e5",
    borderRadius: 4,
    padding: 10,
  },
  metricLabel: { fontSize: 9, color: "#777777", marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: 700 },
  metricDelta: { fontSize: 9, marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
    borderTop: "0.5pt solid #e5e5e5",
    paddingTop: 8,
  },
});

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MetricBox({ label, value, delta }: { label: string; value: string; delta: number }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricDelta, { color: delta >= 0 ? "#15803d" : "#b91c1c" }]}>
        {formatPercent(delta)} vs. prior period
      </Text>
    </View>
  );
}

interface ReportPDFDocumentProps {
  agencyName: string;
  logoUrl: string | null;
  clientName: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  metrics: ReportMetrics;
  narrativeText: string;
}

export function ReportPDFDocument({
  agencyName,
  logoUrl,
  clientName,
  dateRangeStart,
  dateRangeEnd,
  metrics,
  narrativeText,
}: ReportPDFDocumentProps) {
  const sections = parseNarrative(narrativeText);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.reportTitle}>{clientName}</Text>
            <Text style={styles.reportSubtitle}>
              Performance report · {dateRangeStart} to {dateRangeEnd}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML <img> */}
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.agencyName}>{agencyName}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricBox label="Impressions" value={metrics.current.impressions.toLocaleString()} delta={metrics.deltas.impressions} />
          <MetricBox label="Clicks" value={metrics.current.clicks.toLocaleString()} delta={metrics.deltas.clicks} />
          <MetricBox label="CTR" value={`${(metrics.current.ctr * 100).toFixed(2)}%`} delta={metrics.deltas.ctr} />
          <MetricBox label="Spend" value={formatMoney(metrics.current.spend)} delta={metrics.deltas.spend} />
          <MetricBox label="Conversions" value={metrics.current.conversions.toLocaleString()} delta={metrics.deltas.conversions} />
          <MetricBox label="CPC" value={formatMoney(metrics.current.cpc)} delta={metrics.deltas.cpc} />
        </View>

        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.paragraph}>{sections.executiveSummary}</Text>

        {sections.whatHappened.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>What Happened This Month</Text>
            {sections.whatHappened.map((line, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </>
        )}

        {sections.recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommendations for Next Month</Text>
            {sections.recommendations.map((line, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{line}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer}>
          Prepared by {agencyName} with ReportWright · {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
}

function parseNarrative(text: string) {
  const lines = text.split("\n");
  const whatHappenedIdx = lines.findIndex((l) => l.trim().startsWith("What Happened"));
  const recommendationsIdx = lines.findIndex((l) => l.trim().startsWith("Recommendations"));

  const executiveSummary = lines
    .slice(0, whatHappenedIdx === -1 ? lines.length : whatHappenedIdx)
    .join("\n")
    .trim();

  const whatHappened = whatHappenedIdx === -1
    ? []
    : lines
        .slice(whatHappenedIdx + 1, recommendationsIdx === -1 ? undefined : recommendationsIdx)
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-"))
        .map((l) => l.replace(/^-\s*/, ""));

  const recommendations = recommendationsIdx === -1
    ? []
    : lines
        .slice(recommendationsIdx + 1)
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-"))
        .map((l) => l.replace(/^-\s*/, ""));

  return { executiveSummary, whatHappened, recommendations };
}
