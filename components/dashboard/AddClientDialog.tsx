"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { GoogleAdsAccount } from "@/lib/google-ads";

export function AddClientDialog({ existingCustomerIds }: { existingCustomerIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [selected, setSelected] = useState<GoogleAdsAccount | null>(null);
  const [clientName, setClientName] = useState("");
  const [saving, setSaving] = useState(false);

  async function openDialog() {
    setOpen(true);
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/google/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load accounts");
      setAccounts(data.accounts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load Google Ads accounts");
      setOpen(false);
    } finally {
      setLoadingAccounts(false);
    }
  }

  function selectAccount(account: GoogleAdsAccount) {
    setSelected(account);
    setClientName(account.name);
  }

  async function handleSave() {
    if (!selected || !clientName.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setSaving(false);
      toast.error("You must be logged in to add a client.");
      return;
    }

    const { error } = await supabase.from("clients").insert({
      user_id: userData.user.id,
      google_ads_customer_id: selected.customerId,
      client_name: clientName.trim(),
    });

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${clientName} added`);
    setOpen(false);
    setSelected(null);
    setClientName("");
    router.refresh();
  }

  const availableAccounts = accounts.filter(
    (a) => !existingCustomerIds.includes(a.customerId)
  );

  return (
    <>
      <Button variant="secondary" onClick={openDialog}>
        + Add client
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add a client">
        {loadingAccounts ? (
          <p className="text-sm text-black/60">Loading Google Ads accounts…</p>
        ) : availableAccounts.length === 0 ? (
          <p className="text-sm text-black/60">
            No additional Google Ads accounts found. Make sure the account is shared with the
            email you connected.
          </p>
        ) : selected ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-black/60">
              Google Ads ID: <span className="font-mono">{selected.customerId}</span>
            </p>
            <Input
              id="clientName"
              label="Client display name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(null)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        ) : (
          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {availableAccounts.map((account) => (
              <li key={account.customerId}>
                <button
                  onClick={() => selectAccount(account)}
                  className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-left text-sm hover:border-accent hover:bg-accent/5"
                >
                  <div className="font-medium">{account.name}</div>
                  <div className="font-mono text-xs text-black/40">{account.customerId}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
