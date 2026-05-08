"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChurnStore, type CustomerRow } from "@/store/churn-store";

export default function RiskWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customers, selectedCustomerId, setCustomers, selectCustomer } = useChurnStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  // Sync search from URL param when navigated from TopBar
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "1000" });
    if (filter !== "all") params.set("level", filter);
    if (search) params.set("search", search);
    fetch(`/api/customers?${params}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setCustomers(d.customers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, search, setCustomers]);

  const displayCustomers = customers;

  const high = customers.filter((c) => c.risk_level === "high").length;
  const churnPct = customers.length > 0 ? Math.round((high / customers.length) * 100 * 10) / 10 : 0;

  const handleSelect = (c: CustomerRow) => {
    selectCustomer(c.id);
  };

  const exportCsv = () => {
    const headers = ["name", "email", "company", "risk_score", "risk_level", "days_inactive"];
    const rows = customers.map((c) =>
      headers.map((h) => `"${(c as unknown as Record<string, unknown>)[h] ?? ""}"`).join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "churn-risk-report.csv"; a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Risk Analysis Workspace</h1>
          <p className="text-sm text-gray-500">Predictive churn scoring across your customer base.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          >
            <option value="all">All Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : displayCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-gray-500 text-sm mb-3">No customers found. Upload a CSV to get started.</p>
            <button onClick={() => router.push("/data-management")} className="text-blue-700 text-sm font-bold hover:underline">Go to Data Management →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Risk Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key Factor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayCustomers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                const factors = [
                  { label: `${c.days_inactive}d inactive`, val: c.days_inactive / 90 },
                  { label: `${Math.round(c.usage_drop * 100)}% usage drop`, val: c.usage_drop },
                  { label: `${c.support_complaints} tickets`, val: c.support_complaints / 10 },
                ].sort((a, b) => b.val - a.val);
                const scoreColor = c.risk_level === "high" ? "text-red-600" : c.risk_level === "medium" ? "text-amber-500" : "text-teal-600";
                const barColor = c.risk_level === "high" ? "bg-red-600" : c.risk_level === "medium" ? "bg-amber-500" : "bg-teal-500";
                const badgeColor = c.risk_level === "high" ? "text-red-600 bg-red-50" : c.risk_level === "medium" ? "text-amber-600 bg-amber-50" : "text-teal-700 bg-teal-50";

                return (
                  <tr
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/50 border-l-2 border-l-blue-500" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-gray-900">{c.name}</div>
                        <div className="text-[11px] text-gray-500">{c.company || c.email || "—"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                          <div className={`h-full ${barColor}`} style={{ width: `${c.risk_score}%` }} />
                        </div>
                        <span className={`font-bold ${scoreColor}`}>{c.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider ${badgeColor}`}>
                        {c.risk_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{factors[0].label}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); selectCustomer(c.id); router.push(`/outreach-hub?customerId=${c.id}`); }}
                        className="text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Outreach →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Total High Risk</h3>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-red-600">{high}</div>
            <div className="text-xs font-bold text-gray-500 pb-1">of {customers.length} customers</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Churn Probability</h3>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">{churnPct}%</div>
            <div className="text-xs font-bold text-gray-500 pb-1">high-risk segment</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Customers Scored</h3>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
            <div className="text-xs font-bold text-teal-600 pb-1">Total tracked</div>
          </div>
        </div>
      </div>
    </div>
  );
}
