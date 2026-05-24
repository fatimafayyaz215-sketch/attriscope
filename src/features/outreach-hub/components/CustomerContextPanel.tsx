"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useChurnStore, type CustomerRow } from "@/store/churn-store";

type SortKey = "risk_score" | "name" | "days_inactive";
type FilterLevel = "all" | "high" | "medium" | "low";

export default function CustomerContextPanel() {
  const searchParams = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");
  const { customers, selectedCustomerId, selectCustomer, setCustomers } = useChurnStore();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("risk_score");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");

  const effectiveId = selectedCustomerId ?? urlCustomerId;

  // Always load customers on mount so the picker works
  useEffect(() => {
    if (customers.length === 0) {
      setLoading(true);
      fetch("/api/customers?limit=1000")
        .then((r) => r.json())
        .then((d) => { if (!d.error) setCustomers(d.customers); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (urlCustomerId) selectCustomer(urlCustomerId);
  }, [urlCustomerId, customers.length, setCustomers, selectCustomer]);

  const customer: CustomerRow | undefined = customers.find((c) => c.id === effectiveId);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (filterLevel !== "all") list = list.filter((c) => c.risk_level === filterLevel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "risk_score") return b.risk_score - a.risk_score;
      if (sortBy === "days_inactive") return b.days_inactive - a.days_inactive;
      return a.name.localeCompare(b.name);
    });
  }, [customers, search, filterLevel, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-10 flex justify-center shadow-sm">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // --- No customer selected: show picker ---
  if (!customer) {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Select a Customer</h2>
          <p className="text-xs text-gray-500 mt-0.5">Pick a customer to draft a retention email.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, company, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="all">All Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="risk_score">Sort: Risk Score</option>
              <option value="days_inactive">Sort: Days Inactive</option>
              <option value="name">Sort: Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Customer list */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No customers match your filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {filteredCustomers.map((c) => {
                const badgeColor =
                  c.risk_level === "high"
                    ? "bg-red-50 text-red-600"
                    : c.risk_level === "medium"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-teal-50 text-teal-700";
                const barColor =
                  c.risk_level === "high" ? "bg-red-500" : c.risk_level === "medium" ? "bg-amber-400" : "bg-teal-500";
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => selectCustomer(c.id)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div>
                          <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {c.name}
                          </span>
                          <span className="block text-[11px] text-gray-400">{c.company || c.email || "—"}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                          {c.risk_level.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor}`} style={{ width: `${c.risk_score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 shrink-0">{c.risk_score}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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

  // --- Customer selected: show context + change button ---
  return (
    <div className="flex flex-col gap-6">
      {/* Change customer */}
      <button
        onClick={() => selectCustomer(null)}
        className="self-start flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Change Customer
      </button>

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
