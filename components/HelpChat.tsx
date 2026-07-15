"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const QUICK_REPLIES = [
  "How do I add a client?",
  "How does report generation work?",
  "Can I edit the AI narrative?",
  "How do I export a PDF?",
];

const FAQ: Record<string, string> = {
  "how do i add a client": "Go to the Dashboard and click **Add client**. You'll see your connected Google Ads accounts — pick one and give it a name.",
  "how does report generation work": "Click **Generate report** on any client card. Pick a date range (this month, last month, or custom), then hit Generate. ReportWright pulls the metrics and writes an AI narrative — usually done in under 60 seconds.",
  "can i edit the ai narrative": "Yes! On the report page you can edit the narrative text directly before exporting. Hit **Save** to preserve your edits, then **Export PDF** when it's ready.",
  "how do i export a pdf": "Open any completed report and click the **Export PDF** button in the top right. The PDF downloads instantly and is also saved to your account.",
  "how do i connect google ads": "From the Dashboard, click **Connect Google Ads**. You'll be redirected to Google to authorise access — once done, your accounts appear automatically.",
  "what is ctr": "CTR (Click-Through Rate) = Clicks ÷ Impressions. It shows what percentage of people who saw the ad actually clicked it. A higher CTR means the ad copy is resonating.",
  "what is cpc": "CPC (Cost Per Click) is how much was spent on average for each click. Lower CPC means you're getting clicks more efficiently.",
  "what is a conversion": "A conversion is a valuable action a user takes after clicking the ad — like booking an appointment, calling, or filling out a form. This is set up in Google Ads.",
};

function getReply(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, answer] of Object.entries(FAQ)) {
    const keywords = key.split(" ");
    const matches = keywords.filter((k) => lower.includes(k)).length;
    if (matches >= Math.min(3, keywords.length)) return answer;
  }
  return "I'm not sure about that one. Try asking about adding clients, generating reports, editing the narrative, or exporting PDFs.";
}

function renderText(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export function HelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm here to help with ReportWright. What do you need?" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    const reply: Message = { role: "assistant", text: getReply(text) };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="flex w-80 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-black/15">
          {/* Header */}
          <div className="flex items-center justify-between bg-accent px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">?</span>
              <div>
                <p className="text-sm font-semibold text-white">Help</p>
                <p className="text-xs text-white/60">ReportWright assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 overflow-y-auto p-4" style={{ maxHeight: 300 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-sm"
                      : "bg-black/5 text-black rounded-bl-sm"
                  }`}
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-black/8 px-3 py-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40 transition-opacity"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9l20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent-dark transition-colors"
        style={{ height: 52, width: 52 }}
        aria-label="Help"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
