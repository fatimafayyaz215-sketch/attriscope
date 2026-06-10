"use client";

import { useEffect, useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area,
} from "recharts";
import { useChurnStore } from "@/store/churn-store";

interface TrendPoint { week: string; engagement: number; count: number; }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const visible = payload.filter((p) => p.name !== "EngagementArea");
  if (!visible.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl px-5 py-4 text-xs min-w-40">
      <p className="font-bold text-gray-800 mb-3 text-[11px] uppercase tracking-widest border-b border-gray-100 pb-2">{label}</p>
      {visible.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
            <span className="text-gray-500 font-medium">{p.name}</span>
          </div>
          <span className="font-bold text-gray-900 tabular-nums">
            {p.name === "Engagement" ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EngagementTrendChart() {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const dataVersion = useChurnStore((s) => s.dataVersion);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setTrend(d.trend ?? []);
          setTotalCustomers(d.total ?? 0);
        }
      })
      .catch(() => {});
  }, [dataVersion]);

  const hasData = totalCustomers > 0;

  const chartData = hasData
    ? trend
    : [
        { week: "0–7d", engagement: 0, count: 0 },
        { week: "8–30d", engagement: 0, count: 0 },
        { week: "31–60d", engagement: 0, count: 0 },
        { week: "61–90d", engagement: 0, count: 0 },
      ];

  const first = trend[0]?.engagement ?? 0;
  const last  = trend[trend.length - 1]?.engagement ?? 0;
  const delta = first - last;
  const isFalling = delta > 5;
  const isRising  = delta < -5;

  const avgEngagement = hasData
    ? Math.round(trend.reduce((s, p) => s + p.engagement, 0) / trend.length)
    : 0;

  const maxCount = Math.max(...chartData.map((d) => d.count), 0);
  const barYMax = maxCount > 0 ? Math.ceil(maxCount * 1.15) : 10;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
      {/* Gradient header band */}
      <div className="bg-linear-to-r from-[#0a235c] to-[#1e40af] px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Engagement Trend</h2>
            <p className="text-xs text-blue-200 mt-0.5">Days inactive · bars = customers per window, line = engagement rate</p>
          </div>
          <div className="flex items-center gap-3">
            {hasData && (
              <>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Avg Rate</p>
                  <p className="text-xl font-bold text-white leading-tight">{avgEngagement}%</p>
                </div>
                <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 ${
                  isFalling ? "bg-red-500/20 text-red-300" : isRising ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-blue-200"
                }`}>
                  {isFalling ? `↓ −${delta}% drop` : isRising ? `↑ +${Math.abs(delta)}% rise` : "● Stable"}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-64 min-w-0 px-4 pt-6 pb-2">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 44, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1e40af" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />

            <YAxis
              yAxisId="left"
              domain={[0, barYMax]}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#34d399" }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: "#6b7280" }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0f9ff", radius: 8 }} />

            <Area
              yAxisId="right"
              dataKey="engagement"
              name="EngagementArea"
              fill="url(#areaGrad)"
              stroke="transparent"
              isAnimationActive
              legendType="none"
            />

            <Bar
              yAxisId="left"
              dataKey="count"
              name="Customers"
              fill="url(#barGrad)"
              radius={[8, 8, 2, 2]}
              maxBarSize={56}
              isAnimationActive
              opacity={hasData ? 1 : 0.15}
            />

            <Line
              yAxisId="right"
              dataKey="engagement"
              name="Engagement"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, fill: "#fff", strokeWidth: 2.5, stroke: "#10b981" }}
              activeDot={{ r: 7, stroke: "#10b981", strokeWidth: 2.5, fill: "#fff" }}
              type="monotone"
              isAnimationActive
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer legend */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-linear-to-b from-blue-400 to-blue-700" />
            <span className="text-gray-500 font-medium">Customers in window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-gray-500 font-medium">Avg engagement rate</span>
          </div>
        </div>
        {!hasData && (
          <span className="text-gray-400 italic">Upload data to see trends</span>
        )}
      </div>
    </div>
  );
}
