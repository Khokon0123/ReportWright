import { createClient } from "@/lib/supabase-server";
import { ConnectGoogleAdsCard } from "@/components/dashboard/ConnectGoogleAdsCard";
import { AddClientDialog } from "@/components/dashboard/AddClientDialog";
import { GenerateReportDialog } from "@/components/dashboard/GenerateReportDialog";
import { ReportsTable } from "@/components/dashboard/ReportsTable";
import type { Client, ReportWithClient } from "@/types/database";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user!.id;

  const [{ data: connection }, { data: clients }, { data: reports }] = await Promise.all([
    supabase.from("google_connections").select("id").eq("user_id", userId).maybeSingle(),
    supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("*, clients(client_name, google_ads_customer_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const hasConnection = Boolean(connection);
  const clientList = (clients ?? []) as Client[];
  const reportList = (reports ?? []) as ReportWithClient[];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-black/60">
          Manage your clients and generate reports.
        </p>
      </div>

      {!hasConnection && <ConnectGoogleAdsCard />}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Clients</h2>
          {hasConnection && (
            <AddClientDialog
              existingCustomerIds={clientList.map((c) => c.google_ads_customer_id)}
            />
          )}
        </div>

        {clientList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/15 px-6 py-10 text-center text-sm text-black/50">
            {hasConnection
              ? "No clients yet. Add one from your connected Google Ads accounts."
              : "Connect Google Ads to start adding clients."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clientList.map((client) => (
              <div
                key={client.id}
                className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-5"
              >
                <div>
                  <p className="font-medium">{client.client_name}</p>
                  <p className="font-mono text-xs text-black/40">
                    {client.google_ads_customer_id}
                  </p>
                </div>
                <GenerateReportDialog clientId={client.id} clientName={client.client_name} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Report history</h2>
        <ReportsTable reports={reportList} />
      </section>
    </div>
  );
}
