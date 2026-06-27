import { createClient } from "@/lib/supabase-server";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Card } from "@/components/ui/Card";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user!.id;

  const { data: profile } = await supabase
    .from("users")
    .select("agency_name, logo_url, email")
    .eq("id", userId)
    .single();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-black/60">{profile?.email}</p>
      </div>

      <Card>
        <SettingsForm
          userId={userId}
          initialAgencyName={profile?.agency_name ?? ""}
          initialLogoUrl={profile?.logo_url ?? null}
        />
      </Card>
    </div>
  );
}
