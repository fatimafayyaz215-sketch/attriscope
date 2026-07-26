"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useChurnStore } from "@/store/churn-store";

interface Stats { total: number; high: number; medium: number; low: number; }

const BARS = [
  { key: "high",   label: "High",   color: "#8b5cf6", bg: "#faf5ff" },
  { key: "medium", label: "Med",    color: "#f59e0b", bg: "#fffbeb" },
  { key: "low",    label: "Low",    color: "#10b981", bg: "#ecfdf5" },
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; value: number; pct: number; color: string } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
        <p className="font-bold text-gray-800">{d.label} Risk</p>
      </div>
      <p className="text-gray-600">{d.value.toLocaleString()} customers</p>
      <p className="text-gray-400">{d.pct}% of total</p>
    </div>
  );
}

export default function RiskDistributionChart() {
  const [stats, setStats] = useState<Stats | null>(null);
  const dataVersion = useChurnStore((s) => s.dataVersion);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => { if (!d.error) setStats(d); }).catch(() => {});
  }, [dataVersion]);

  const pct = (n: number) => stats && stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;

  const chartData = BARS.map((b) => ({
    label: b.label,
    color: b.color,
    bg: b.bg,
    value: stats ? stats[b.key as keyof Stats] as number : 0,
    pct: stats ? pct(stats[b.key as keyof Stats] as number) : 0,
  }));

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);
  // Y-axis ceiling: nearest clean number above maxVal (min 5 so empty chart still shows scale)
  const yMax = Math.max(Math.ceil(maxVal * 1.25), 5);

  const hasData = stats && stats.total > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold text-gray-900">Risk Distribution</h2>
        <span className="text-xs text-gray-400">{stats ? `${stats.total.toLocaleString()} total` : "No data"}</span>
      </div>
      <p className="text-xs text-gray-400 mb-5">Customer count by churn risk level</p>

      <div className="flex-1 min-h-80 min-w-0">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barCategoryGap="35%" margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 700, fill: "#374151" }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, yMax]}
              ticks={Array.from({ length: 5 }, (_, i) => Math.round((yMax / 4) * i))}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc", radius: 6 }} />
            <Bar dataKey="value" radius={[8, 8, 2, 2]} maxBarSize={88} isAnimationActive={true}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} fillOpacity={hasData ? 1 : 0.25} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v) => (typeof v === "number" && v > 0) ? v.toLocaleString() : ""}
                style={{ fontSize: 12, fontWeight: 800, fill: "#1f2937" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend row */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-4">
          {BARS.map((b) => (
            <div key={b.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-[11px] font-semibold text-gray-500">{b.label}</span>
            </div>
          ))}
        </div>
        <span className="text-xs font-bold text-gray-900">
          {stats ? `${stats.total.toLocaleString()} total` : "—"}
        </span>
      </div>
    </div>
  );
}
