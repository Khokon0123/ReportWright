"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SettingsForm({
  userId,
  initialAgencyName,
  initialLogoUrl,
}: {
  userId: string;
  initialAgencyName: string;
  initialLogoUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [agencyName, setAgencyName] = useState(initialAgencyName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(path);
    const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ logo_url: url })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    setLogoUrl(url);
    toast.success("Logo updated");
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ agency_name: agencyName })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-black/5">
          {logoUrl ? (
            <Image src={logoUrl} alt="Agency logo" width={64} height={64} className="h-full w-full object-contain" unoptimized />
          ) : (
            <span className="text-xs text-black/30">No logo</span>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={handleLogoChange}
          />
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()} loading={uploading}>
            {logoUrl ? "Change logo" : "Upload logo"}
          </Button>
          <p className="mt-1 text-xs text-black/40">PNG, JPG, or SVG. Used on your PDF reports.</p>
        </div>
      </div>

      <Input
        id="agencyName"
        label="Agency name"
        value={agencyName}
        onChange={(e) => setAgencyName(e.target.value)}
        placeholder="Acme Marketing Co."
      />

      <Button onClick={handleSave} loading={saving} className="w-fit">
        Save changes
      </Button>
    </div>
  );
}
