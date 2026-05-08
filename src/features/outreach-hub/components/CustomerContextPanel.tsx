"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useChurnStore, type CustomerRow } from "@/store/churn-store";

export default function CustomerContextPanel() {
  const searchParams = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");
  const { customers, selectedCustomerId, selectCustomer, setCustomers } = useChurnStore();
  const [loading, setLoading] = useState(false);

  const effectiveId = urlCustomerId ?? selectedCustomerId;

  // If customers not loaded yet, fetch them
  useEffect(() => {
    if (effectiveId && customers.length === 0) {
      setLoading(true);
      fetch("/api/customers?limit=500")
        .then((r) => r.json())
        .then((d) => { if (!d.error) setCustomers(d.customers); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (urlCustomerId) selectCustomer(urlCustomerId);
  }, [effectiveId, urlCustomerId, customers.length, setCustomers, selectCustomer]);

  const customer: CustomerRow | undefined = customers.find((c) => c.id === effectiveId);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-10 flex justify-center shadow-sm">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500 mb-2">No customer selected.</p>
        <p className="text-xs text-gray-400">Select a customer from Risk Analysis to generate an email.</p>
      </div>
    );
  }

  const churnPct = customer.risk_score;
  const riskBadgeColor = customer.risk_level === "high" ? "bg-red-100 text-red-700" : customer.risk_level === "medium" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700";

  const riskFactors: { icon: string; title: string; desc: string }[] = [];
  if (customer.days_inactive > 7)
    riskFactors.push({ icon: "clock", title: `${customer.days_inactive} Days Inactive`, desc: `Last active ${customer.days_inactive} days ago.` });
  if (customer.usage_drop > 0.1)
    riskFactors.push({ icon: "drop", title: `Usage Dropped ${Math.round(customer.usage_drop * 100)}%`, desc: "Significant drop in activity vs previous period." });
  if (customer.support_complaints > 0)
    riskFactors.push({ icon: "ticket", title: `${customer.support_complaints} Open Ticket(s)`, desc: "Unresolved support issues pending." });
  if (customer.payment_delay)
    riskFactors.push({ icon: "payment", title: "Payment Delayed", desc: "Subscription payment is overdue." });

  const joinDate = customer.created_at ? new Date(customer.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{customer.name}</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{customer.company || customer.email || "—"}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest text-center leading-tight ${riskBadgeColor}`}>
            {customer.risk_level}<br/>Risk
          </span>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            <span>Churn Probability</span>
            <span className={churnPct >= 70 ? "text-red-600" : churnPct >= 40 ? "text-amber-500" : "text-teal-600"} style={{ fontSize: "0.875rem" }}>{churnPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${churnPct >= 70 ? "bg-red-600" : churnPct >= 40 ? "bg-amber-500" : "bg-teal-500"}`} style={{ width: `${churnPct}%` }} />
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Risk Score</p>
            <p className="text-lg font-bold text-gray-900">{customer.risk_score}/100</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Since</p>
            <p className="text-lg font-bold text-gray-900">{joinDate}</p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Risk Factors</h3>
          <ul className="flex flex-col gap-5">
            {riskFactors.map((f, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{f.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Explanation */}
      {customer.ai_explanation && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">AI Analysis</h3>
          <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{customer.ai_explanation}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
