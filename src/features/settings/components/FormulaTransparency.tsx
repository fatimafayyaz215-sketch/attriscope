"use client";

import { useState } from "react";
import { useChurnStore } from "@/store/churn-store";
import { BILLING_CAPS, BillingCycle, getRiskThresholds } from "@/lib/scoring";
import { normalizeIndustry } from "@/lib/industry-defaults";

export default function FormulaTransparency() {
  const { weights, industry } = useChurnStore();
  const [segment, setSegment] = useState<BillingCycle>("yearly");

  const caps = BILLING_CAPS[segment];
  const riskBands = getRiskThresholds(normalizeIndustry(industry));


  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-[#0f172a] rounded-xl p-8 flex flex-col h-full shadow-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
          <h2 className="text-sm font-bold text-white">Formula Transparency</h2>
        </div>

        {/* Segment Toggle */}
        <div className="mb-6">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">View Segment</p>
          <div className="flex rounded-lg overflow-hidden border border-gray-700 w-fit">
            {(["monthly", "yearly"] as BillingCycle[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSegment(s)}
                className={`px-4 py-1.5 text-xs font-bold capitalize transition-colors ${
                  segment === s
                    ? "bg-blue-700 text-white"
                    : "bg-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">

          {/* Variable list */}
          <div>
            <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-4">Live Predictive Engine</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex justify-between items-start text-xs gap-2">
                <div>
                  <p className="text-blue-400 font-bold uppercase tracking-tighter">Login / Inactivity</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Days since last login — cap: <span className="text-blue-400 font-semibold">{caps.inactivityDays} days</span></p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-500 text-[10px] uppercase">Priority Weight</p>
                  <p className="text-blue-400 font-bold text-lg">{weights.inactivity}%</p>
                </div>
              </li>
              <li className="flex justify-between items-start text-xs gap-2">
                <div>
                  <p className="text-amber-400 font-bold uppercase tracking-tighter">Usage Drop</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Session decline compared to previous period</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-500 text-[10px] uppercase">Priority Weight</p>
                  <p className="text-amber-400 font-bold text-lg">{weights.usage}%</p>
                </div>
              </li>
              <li className="flex justify-between items-start text-xs gap-2">
                <div>
                  <p className="text-teal-400 font-bold uppercase tracking-tighter">Support Complaints</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Support tickets raised — cap: <span className="text-teal-400 font-semibold">{caps.supportTickets} tickets</span></p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-500 text-[10px] uppercase">Priority Weight</p>
                  <p className="text-teal-400 font-bold text-lg">{weights.support}%</p>
                </div>
              </li>
              <li className="flex justify-between items-start text-xs gap-2">
                <div>
                  <p className="text-purple-400 font-bold uppercase tracking-tighter">Payment Delay</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Late or missed payment — yes or no</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-500 text-[10px] uppercase">Priority Weight</p>
                  <p className="text-purple-400 font-bold text-lg">{weights.payment}%</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Priority guidance */}
          <div className="pt-6 border-t border-gray-800 flex flex-col gap-3">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Priority Guide</p>
            <div className="flex gap-2 items-start">
              <span className="text-blue-400 font-bold shrink-0 text-xs mt-0.5">→</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">If all 4 signals matter equally — set each to <span className="text-white font-semibold">25%</span>. The system will weigh every factor the same.</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-blue-400 font-bold shrink-0 text-xs mt-0.5">→</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">If one signal is your strongest churn indicator — <span className="text-white font-semibold">give it more weight</span> than the rest to reflect its importance.</p>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-blue-400 font-bold shrink-0 text-xs mt-0.5">→</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">Risk levels: <span className="text-red-400 font-semibold">High ≥ {riskBands.high}</span> · <span className="text-amber-400 font-semibold">Medium {riskBands.medium}–{riskBands.high - 1}</span> · <span className="text-teal-400 font-semibold">Low &lt; {riskBands.medium}</span>.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

