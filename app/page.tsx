import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/8 bg-white/90 px-6 py-4 backdrop-blur sm:px-10">
        <Logo className="text-lg" />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-black/60 hover:text-black transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button className="px-5">Get started free</Button>
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center px-6 pb-20 pt-24 text-center sm:px-10">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Built for marketing agencies
          </span>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Client reports in{" "}
            <span className="text-accent">60 seconds</span>,<br className="hidden sm:block" />
            not 11 hours.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-black/55">
            Connect Google Ads, pick a client, and ReportWright pulls the metrics,
            writes the narrative, and exports a branded PDF — automatically.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button className="px-7 py-3 text-base">Start free →</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="px-7 py-3 text-base">
                Log in
              </Button>
            </Link>
          </div>

          {/* Mock preview card */}
          <div className="mt-16 w-full max-w-2xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/5">
            <div className="flex items-center gap-1.5 bg-black/[0.03] px-4 py-3 border-b border-black/8">
              <span className="h-3 w-3 rounded-full bg-red-400/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <span className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-black/40 font-mono">reportwright.app/reports/…</span>
            </div>
            <div className="p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-base">Sunrise Dental Clinic</p>
                  <p className="text-xs text-black/45 mt-0.5">May 1, 2026 → May 31, 2026</p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-lg border border-black/12 px-3 py-1.5 text-xs font-medium text-black/60">Save</span>
                  <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white">Export PDF</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {[
                  { label: "Impressions", value: "48,200", delta: "+17.6%", up: true },
                  { label: "Clicks", value: "1,840", delta: "+21.1%", up: true },
                  { label: "CTR", value: "3.82%", delta: "+3.0%", up: true },
                  { label: "Spend", value: "$3,240", delta: "+8.7%", up: false },
                  { label: "Conversions", value: "67", delta: "+24.1%", up: true },
                  { label: "CPC", value: "$1.76", delta: "-10.2%", up: true },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-black/8 p-2.5">
                    <p className="text-[10px] text-black/45">{m.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{m.value}</p>
                    <p className={`text-[10px] font-medium ${m.up ? "text-green-600" : "text-orange-500"}`}>{m.delta}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-black/8 bg-black/[0.02] p-3.5">
                <p className="text-xs font-medium text-black/70 mb-1.5">AI Narrative Preview</p>
                <p className="text-xs leading-relaxed text-black/55">
                  Sunrise Dental Clinic had an exceptional month in May 2026, with conversions surging
                  24% to 67 total appointments booked — the strongest month this quarter…
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-black/[0.02] border-y border-black/8 px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-black/40 mb-3">
              How it works
            </p>
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Three steps, then done.
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Connect Google Ads",
                  desc: "One-click OAuth. ReportWright securely links to your Google Ads accounts — no API keys to manage.",
                },
                {
                  step: "02",
                  title: "Pick a client & range",
                  desc: "Select which client account and date range you need. This month, last month, or custom.",
                },
                {
                  step: "03",
                  title: "Get a branded PDF",
                  desc: "Metrics are pulled, an AI narrative is written, and a branded PDF lands in your browser — ready to send.",
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-6">
                  <span className="text-3xl font-bold text-accent/20">{item.step}</span>
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-black/55">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-black/40 mb-3">
              Features
            </p>
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Everything your team needs.
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: "📊",
                  title: "Real campaign metrics",
                  desc: "Impressions, clicks, CTR, spend, conversions, CPC — with month-over-month delta for every metric.",
                },
                {
                  icon: "✍️",
                  title: "AI-written narrative",
                  desc: "An executive summary, bullet-point recap, and next-month recommendations written by AI in your voice.",
                },
                {
                  icon: "📄",
                  title: "Branded PDF export",
                  desc: "Your agency logo, client name, and date range on a clean single-page PDF — ready to email.",
                },
                {
                  icon: "✏️",
                  title: "Editable before sending",
                  desc: "Review and tweak the AI narrative directly in the app. What gets exported is exactly what you approve.",
                },
                {
                  icon: "👥",
                  title: "Multi-client support",
                  desc: "Add every Google Ads account you manage. Each client gets their own report history.",
                },
                {
                  icon: "⚡",
                  title: "60-second generation",
                  desc: "From click to complete PDF in under a minute. What used to take an afternoon takes a coffee break.",
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-4 rounded-2xl border border-black/10 p-5">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-black/55">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-accent px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold text-white">
              Stop spending Fridays on reports.
            </h2>
            <p className="mt-4 text-base text-white/70">
              ReportWright handles the data, the writing, and the PDF. You just hit send.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button className="bg-white !text-accent hover:bg-white/90 px-8 py-3 text-base font-semibold">
                Get started free →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/8 px-6 py-6 text-center text-xs text-black/35 sm:px-10">
        © {new Date().getFullYear()} ByteWright LLC · ReportWright · All rights reserved.
      </footer>
    </div>
  );
}
