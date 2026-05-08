"use client";

import { useEffect, useState } from "react";
import { useChurnStore } from "@/store/churn-store";

interface TrendPoint { week: string; engagement: number; count: number; }

export default function EngagementTrendChart() {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [avgDrop, setAvgDrop] = useState<number | null>(null);
  const dataVersion = useChurnStore((s) => s.dataVersion);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error && d.trend) {
          setTrend(d.trend);
          const vals: number[] = d.trend.map((t: TrendPoint) => t.engagement);
          if (vals.length >= 2) {
            setAvgDrop(vals[0] - vals[vals.length - 1]);
          }
        }
      })
      .catch(() => {});
  }, [dataVersion]);

  // Build SVG path from trend data (0-100 scale)
  const points = trend.length > 0 ? trend : [
    { week: "Week 1", engagement: 80, count: 0 },
    { week: "Week 2", engagement: 65, count: 0 },
    { week: "Week 3", engagement: 50, count: 0 },
    { week: "Week 4", engagement: 40, count: 0 },
  ];

  const W = 1000, H = 200;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map((p) => H - (p.engagement / 100) * H);
  const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x},${ys[i]}`).join(" ");
  const fillD = `${pathD} L ${W},${H} L 0,${H} Z`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Engagement Trend</h2>
          <p className="text-xs text-gray-500 mt-1">Active customer engagement by inactivity bucket</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 mt-4 md:mt-0 self-start">
          <button className="px-3 py-1 text-xs font-semibold bg-[#2548B4] text-white rounded-md shadow-sm">4 Weeks</button>
        </div>
      </div>

      <div className="flex-1 relative min-h-[200px] w-full bg-gray-50/50 rounded-lg border border-gray-100 p-4 pb-8 flex flex-col justify-end">
        <div className="absolute inset-x-4 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
          {[1, 2, 3, 4].map((i) => <div key={i} className="w-full h-px bg-gray-200" />)}
        </div>

        <div className="absolute inset-x-4 top-4 bottom-8">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A72FF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4A72FF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={fillD} fill="url(#engGrad)" />
            <path d={pathD} fill="none" stroke="#4A72FF" strokeWidth="4" strokeLinecap="round" />
            {xs.map((x, i) => (
              <circle key={i} cx={x} cy={ys[i]} r="5" fill="#4A72FF" />
            ))}
          </svg>
        </div>

        <div className="absolute bottom-2 inset-x-4 flex justify-between text-[10px] font-semibold text-gray-400">
          {points.map((p) => <span key={p.week}>{p.week}</span>)}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {avgDrop !== null && avgDrop > 0 ? (
          <>
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            <p className="text-xs font-bold text-red-500">~{avgDrop}% decrease in engagement across tracked customers.</p>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <p className="text-xs font-bold text-teal-500">{trend.length > 0 ? "Customer engagement is stable." : "Upload data to see engagement trends."}</p>
          </>
        )}
      </div>
    </div>
  );
}
