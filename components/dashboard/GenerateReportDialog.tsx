"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { DateRangePreset } from "@/lib/date-ranges";

export function GenerateReportDialog({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<DateRangePreset>("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (preset === "custom" && (!startDate || !endDate)) {
      toast.error("Pick a start and end date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          preset,
          startDate: preset === "custom" ? startDate : undefined,
          endDate: preset === "custom" ? endDate : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate report");

      toast.success("Report generated!");
      setOpen(false);
      router.push(`/reports/${data.report.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Generate report</Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Generate report for ${clientName}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Date range</label>
            <div className="flex gap-2">
              {(["this_month", "last_month", "custom"] as DateRangePreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    preset === p
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-black/15 text-black/60 hover:border-black/30"
                  }`}
                >
                  {p === "this_month" ? "This month" : p === "last_month" ? "Last month" : "Custom"}
                </button>
              ))}
            </div>
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="startDate"
                type="date"
                label="Start"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                id="endDate"
                type="date"
                label="End"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          <Button onClick={handleGenerate} loading={loading} className="mt-2 w-full">
            Generate report
          </Button>
        </div>
      </Modal>
    </>
  );
}
