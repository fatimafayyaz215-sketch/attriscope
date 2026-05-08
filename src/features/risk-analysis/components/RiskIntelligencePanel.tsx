"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChurnStore, type CustomerRow } from "@/store/churn-store";

export default function RiskIntelligencePanel() {
  const router = useRouter();
  const { customers, selectedCustomerId, updateCustomer } = useChurnStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const customer: CustomerRow | undefined = customers.find((c) => c.id === selectedCustomerId);

  // Auto-fetch explanation if we have a selected customer but no explanation yet
  useEffect(() => {
    if (customer && !customer.ai_explanation && !analyzing) {
      fetchExplanation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId]);

  const fetchExplanation = async () => {
    if (!customer) return;
    setAnalyzing(true); setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      updateCustomer(customer.id, { ai_explanation: data.explanation });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!customer) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h3 className="text-sm font-bold text-gray-700 mb-1">No Customer Selected</h3>
        <p className="text-xs text-gray-400">Click any customer in the table to see their risk intelligence.</p>
      </div>
    );
  }

  const scoreColor = customer.risk_level === "high" ? "text-red-600 border-red-200 bg-red-50" : customer.risk_level === "medium" ? "text-amber-600 border-amber-200 bg-amber-50" : "text-teal-600 border-teal-200 bg-teal-50";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Risk Intelligence</h2>
          <p className="text-xs text-gray-400 mt-0.5">{customer.name}</p>
        </div>
        <div className="text-blue-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
        {/* Risk Score Alert */}
        <div className={`border rounded-lg p-4 flex gap-4 ${scoreColor}`}>
          <div className="flex-shrink-0 flex items-center justify-center bg-white border text-xl font-bold rounded-md w-12 h-12 shadow-sm" style={{ borderColor: "inherit", color: "inherit" }}>
            {customer.risk_score}
          </div>
          <div>
            <h3 className="text-sm font-bold mb-0.5">
              {customer.risk_level === "high" ? "Critical Risk Detected" : customer.risk_level === "medium" ? "Elevated Risk" : "Low Risk"}
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">{customer.name} requires {customer.risk_level === "high" ? "immediate" : "proactive"} outreach.</p>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Insights</h3>
            <button
              onClick={fetchExplanation}
              disabled={analyzing}
              className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {analyzing ? (
                <><div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Analyzing…</>
              ) : (
                <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Refresh</>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-4">
            {customer.ai_explanation ? (
              <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{customer.ai_explanation}&rdquo;</p>
            ) : analyzing ? (
              <p className="text-xs text-gray-400 animate-pulse">Generating AI explanation…</p>
            ) : (
              <p className="text-xs text-gray-400">No explanation yet. Click Refresh to generate.</p>
            )}
          </div>
        </div>

        {/* Key Indicators */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Key Indicators</h3>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Days Inactive
              </div>
              <span className={`font-bold ${customer.days_inactive > 14 ? "text-red-600" : "text-emerald-500"}`}>{customer.days_inactive}d</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                Usage Drop
              </div>
              <span className={`font-bold ${customer.usage_drop > 0.3 ? "text-red-600" : "text-emerald-500"}`}>{Math.round(customer.usage_drop * 100)}%</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Open Tickets
              </div>
              <span className={`font-bold ${customer.support_complaints > 0 ? "text-amber-500" : "text-emerald-500"}`}>{customer.support_complaints}</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Payment
              </div>
              <span className={`font-bold ${customer.payment_delay ? "text-red-600" : "text-emerald-500"}`}>{customer.payment_delay ? "Delayed" : "Current"}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
        <button
          onClick={() => { router.push(`/outreach-hub?customerId=${customer.id}`); }}
          className="w-full bg-[#0a235c] hover:bg-[#071944] text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Generate Retention Email
        </button>
      </div>
    </div>
  );
}
