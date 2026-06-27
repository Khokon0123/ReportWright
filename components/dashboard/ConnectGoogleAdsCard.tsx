import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function ConnectGoogleAdsCard() {
  return (
    <Card className="flex flex-col items-start gap-3">
      <h2 className="text-lg font-semibold">Connect Google Ads</h2>
      <p className="text-sm text-black/60">
        Link your Google Ads account to start pulling client metrics and generating reports.
      </p>
      <Link
        href="/api/google/auth"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
      >
        Connect Google Ads
      </Link>
    </Card>
  );
}
