"use client";

import { useEffect, useState } from "react";
import { useChurnStore } from "@/store/churn-store";

interface Stats { total: number; high: number; medium: number; low: number; }

export default function RiskDistributionChart() {
  const [stats, setStats] = useState<Stats | null>(null);
  const dataVersion = useChurnStore((s) => s.dataVersion);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => { if (!d.error) setStats(d); }).catch(() => {});
  }, [dataVersion]);

  const pct = (n: number) => stats && stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;
  const highPct = stats ? pct(stats.high) : 55;
  const medPct = stats ? pct(stats.medium) : 40;
  const lowPct = stats ? pct(stats.low) : 90;
  // normalise bar heights relative to the tallest bar
  const maxPct = Math.max(highPct, medPct, lowPct, 1);
  const barH = (v: number) => `${Math.round((v / maxPct) * 100)}%`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-bold text-gray-900">Risk Distribution</h2>
        {stats && (
          <span className="text-xs text-gray-400">{stats.total.toLocaleString()} total</span>
        )}
      </div>

      <div className="flex-1 flex items-end justify-between px-6 pb-6 border-b border-gray-100 min-h-[200px] gap-4">
        <div className="w-1/3 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-red-600">{highPct}%</span>
          <div className="w-full bg-[#E53E3E] rounded-t-sm transition-all hover:opacity-90" style={{ height: barH(highPct), minHeight: "4px" }} />
          <span className="text-xs font-semibold text-gray-600">High</span>
          {stats && <span className="text-[10px] text-gray-400">{stats.high}</span>}
        </div>
        <div className="w-1/3 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-amber-600">{medPct}%</span>
          <div className="w-full bg-[#D69E2E] rounded-t-sm transition-all hover:opacity-90" style={{ height: barH(medPct), minHeight: "4px" }} />
          <span className="text-xs font-semibold text-gray-600">Med</span>
          {stats && <span className="text-[10px] text-gray-400">{stats.medium}</span>}
        </div>
        <div className="w-1/3 flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-teal-600">{lowPct}%</span>
          <div className="w-full bg-[#148E7F] rounded-t-sm transition-all hover:opacity-90" style={{ height: barH(lowPct), minHeight: "4px" }} />
          <span className="text-xs font-semibold text-gray-600">Low</span>
          {stats && <span className="text-[10px] text-gray-400">{stats.low}</span>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">Total Tracked</span>
        <span className="font-bold text-gray-900">{stats ? stats.total.toLocaleString() : "—"} Customers</span>
      </div>
    </div>
  );
}
