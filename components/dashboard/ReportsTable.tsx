import Link from "next/link";
import type { ReportWithClient } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-black/5 text-black/60",
  generating: "bg-accent/10 text-accent",
  complete: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function ReportsTable({ reports }: { reports: ReportWithClient[] }) {
  if (reports.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 px-6 py-10 text-center text-sm text-black/50">
        No reports generated yet. Generate your first report from a client above.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/[0.03] text-xs uppercase tracking-wide text-black/50">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Range</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Report</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="px-4 py-3 text-black/70">
                {new Date(report.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-medium">{report.clients?.client_name ?? "—"}</td>
              <td className="px-4 py-3 text-black/60">
                {report.date_range_start} → {report.date_range_end}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_STYLES[report.status] ?? STATUS_STYLES.pending
                  }`}
                >
                  {report.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/reports/${report.id}`} className="font-medium text-accent hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
