"use client";

import { useEffect, useState } from "react";
import { useChurnStore } from "@/store/churn-store";

interface Stats {
  total: number;
  high: number;
  medium: number;
  low: number;
  avgScore: number;
}

export default function StatCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const dataVersion = useChurnStore((s) => s.dataVersion);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setStats(d); })
      .catch(() => {});
  }, [dataVersion]);

  const fmt = (n: number | undefined) => (n ?? 0).toLocaleString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Total Customers */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Total Customers</h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-gray-900">{stats ? fmt(stats.total) : "—"}</div>
          <div className="flex items-center text-emerald-500 text-xs font-bold gap-1 pb-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Imported
          </div>
        </div>
      </div>

      {/* High Risk Count */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">High Risk Count</h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-red-600">{stats ? fmt(stats.high) : "—"}</div>
          <div className="flex items-center text-red-500 text-xs font-bold gap-1 pb-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {stats && stats.total > 0 ? `${Math.round((stats.high / stats.total) * 100)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Medium Risk */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Medium Risk</h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-amber-500">{stats ? fmt(stats.medium) : "—"}</div>
          <div className="pb-1 text-amber-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Avg Risk Score */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Avg Risk Score</h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-gray-900">{stats ? stats.avgScore : "—"}</div>
          <div className="pb-1">
            <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider ${
              (stats?.avgScore ?? 0) >= 70 ? "bg-red-50 text-red-700" :
              (stats?.avgScore ?? 0) >= 40 ? "bg-amber-50 text-amber-700" :
              "bg-teal-50 text-teal-700"
            }`}>
              {(stats?.avgScore ?? 0) >= 70 ? "HIGH" : (stats?.avgScore ?? 0) >= 40 ? "MED" : "LOW"}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
