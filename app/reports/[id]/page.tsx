import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { ReportView } from "@/components/reports/ReportView";
import { Card } from "@/components/ui/Card";
import type { Report } from "@/types/database";

export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user!.id;

  const { data: report } = await supabase
    .from("reports")
    .select("*, clients(client_name)")
    .eq("id", params.id)
    .eq("user_id", userId)
    .single();

  if (!report) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("users")
    .select("agency_name, logo_url")
    .eq("id", userId)
    .single();

  if (report.status === "generating" || report.status === "pending") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 py-20 text-center">
        <Card>
          <p className="text-sm text-black/60">
            Generating this report — pulling Google Ads metrics and writing the narrative…
          </p>
        </Card>
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 py-20 text-center">
        <Card>
          <p className="text-sm text-red-600">
            This report failed to generate. Try generating it again from the dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <ReportView
      report={report as Report}
      clientName={report.clients?.client_name ?? "Client"}
      agencyName={profile?.agency_name || "Your Agency"}
      logoUrl={profile?.logo_url ?? null}
    />
  );
}
