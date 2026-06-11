"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChurnStore } from "@/store/churn-store";


interface AlertCustomer {
  id: string;
  name: string;
  company: string;
  risk_score: number;
  risk_level: string;
  days_inactive: number;
  usage_drop: number;
  support_complaints: number;
}

function primaryFactor(c: AlertCustomer): string {
  const scores = [
    { label: `Inactivity (${c.days_inactive}d)`, value: c.days_inactive / 90 },
    { label: `Usage Drop (${Math.round(c.usage_drop * 100)}%)`, value: c.usage_drop },
    { label: `Support Vol. (${c.support_complaints})`, value: c.support_complaints / 10 },
  ];
  scores.sort((a, b) => b.value - a.value);
  return scores[0].label;
}

export default function HighPriorityAlertsTable() {
  const router = useRouter();
  const selectCustomer = useChurnStore((s) => s.selectCustomer);
  const dataVersion = useChurnStore((s) => s.dataVersion);
  const [alerts, setAlerts] = useState<AlertCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);

    fetch("/api/customers?level=high&limit=5")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && !d.error) setAlerts(d.customers); })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [dataVersion]);

  const handleIntervene = (id: string) => {
    selectCustomer(id);
    router.push(`/outreach-hub?customerId=${id}`);
  };

  const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const avatarColors = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">High Priority Alerts</h2>
        <button onClick={() => router.push("/risk-analysis")} className="text-xs font-bold text-blue-700 hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No high-risk customers yet. Upload customer data to get started.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Risk Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Primary Factor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engagement</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alerts.map((a, i) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${avatarColors[i % avatarColors.length]}`}>
                        {initials(a.name)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{a.name}</div>
                        <div className="text-[11px] text-gray-500">{a.company || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider text-red-600 bg-red-50">
                      {a.risk_score} · HIGH
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{primaryFactor(a)}</td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${Math.max(5, 100 - a.risk_score)}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleIntervene(a.id)}
                      className="text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-4 py-1.5 rounded transition-colors shadow-sm"
                    >
                      Intervene
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>          </div>        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
        <button onClick={() => router.push("/risk-analysis")} className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
          Show All High-Risk Customers
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    </div>
  );
}
