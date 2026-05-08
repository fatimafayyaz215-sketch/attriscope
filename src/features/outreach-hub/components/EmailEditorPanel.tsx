"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChurnStore } from "@/store/churn-store";

type Tone = "professional" | "friendly" | "urgent";

export default function EmailEditorPanel() {
  const searchParams = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");
  const { selectedCustomerId, customers } = useChurnStore();
  const effectiveId = urlCustomerId ?? selectedCustomerId;
  const customer = customers.find((c) => c.id === effectiveId);

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Reset + auto-generate when customer changes
  useEffect(() => {
    if (customer) {
      setToEmail(customer.email ?? "");
      setSent(false);
      setSavedAt(null);
      if (!emailBody) generateEmail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveId]);

  const generateEmail = async () => {
    if (!effectiveId) return;
    setGenerating(true); setError("");
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: effectiveId, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSubject(data.subject);
      setEmailBody(data.body);
      setToEmail(data.toEmail ?? customer?.email ?? "");
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!effectiveId) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: effectiveId, subject, body: emailBody, toEmail }),
      });
      if (!res.ok) throw new Error("Send failed");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  if (!effectiveId) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center h-[calc(100vh-120px)] lg:h-[800px]">
        <div className="text-center p-12">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Select a Customer First</h3>
          <p className="text-sm text-gray-500">Go to Risk Analysis, select a high-risk customer, then click &quot;Outreach →&quot; to draft a retention email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[calc(100vh-120px)] lg:h-[800px]">
      {/* AI Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-[#fafbfe] rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-4 items-start">
          <div className="text-blue-600 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-0.5">AI-Drafted Retention Email</h2>
            <p className="text-xs text-gray-500">Personalized for {customer?.name ?? "selected customer"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateEmail}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {generating ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            {generating ? "Generating…" : "Regenerate"}
          </button>

          {/* Tone selector */}
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="professional">Tone: Professional</option>
            <option value="friendly">Tone: Friendly</option>
            <option value="urgent">Tone: Urgent</option>
          </select>
        </div>
      </div>

      {/* Email Headers */}
      {error && <div className="px-6 py-2 bg-red-50 text-xs text-red-600 font-medium">{error}</div>}
      {sent && <div className="px-6 py-2 bg-emerald-50 text-xs text-emerald-700 font-medium">Email marked as sent successfully!</div>}

      <div className="border-b border-gray-100 flex flex-col">
        <div className="flex items-center border-b border-gray-50 px-6 py-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">To</span>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="flex-1 text-sm text-gray-900 focus:outline-none bg-transparent font-medium"
            placeholder="customer@example.com"
          />
        </div>
        <div className="flex items-center px-6 py-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 text-sm text-gray-900 focus:outline-none bg-transparent font-medium"
            placeholder="Email subject…"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {generating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-600">Generating personalized email…</p>
            </div>
          </div>
        )}
        <textarea
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          className="w-full h-full resize-none text-sm text-gray-800 leading-relaxed focus:outline-none bg-transparent"
          spellCheck={false}
          placeholder="Click Regenerate to generate a personalized retention email…"
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {savedAt ? `Draft saved at ${savedAt}` : "Not yet generated"}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={generateEmail}
            disabled={generating}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={sendEmail}
            disabled={sending || sent || !emailBody}
            className="px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {sent ? "Sent ✓" : sending ? "Sending…" : "Send Email"}
            {!sent && !sending && (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
