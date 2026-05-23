"use client";

import { useChurnStore } from "@/store/churn-store";

export default function WeightTuning() {
  const { weights, setWeights } = useChurnStore();

  const update = (key: keyof typeof weights, val: string) =>
    setWeights({ ...weights, [key]: parseInt(val) });

  const total = weights.inactivity + weights.usage + weights.support + weights.payment;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
        <h2 className="text-sm font-bold text-gray-900">Manual Weight Tuning</h2>
      </div>
      <p className="text-xs text-gray-400 mb-8 ml-9">
        Total weight: <span className={`font-bold ${total === 100 ? "text-teal-600" : "text-amber-600"}`}>{total}%</span>
        {total !== 100 && <span className="ml-1 text-amber-600">(should equal 100%)</span>}
      </p>

      <div className="flex flex-col gap-12">

        {/* Inactivity */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Login / Inactivity</h3>
              <p className="text-xs text-gray-400">Days since last login or usage (capped at 90 days).</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-[#2548B4]">{weights.inactivity}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input type="range" min={0} max={100} value={weights.inactivity} onChange={(e) => update("inactivity", e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#2548B4]" />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Low Relevance</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Critical Signal</span>
            </div>
          </div>
        </div>

        {/* Usage Drop */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Usage Drop</h3>
              <p className="text-xs text-gray-400">Decline in sessions, content views, or features used.</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-amber-600">{weights.usage}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input type="range" min={0} max={100} value={weights.usage} onChange={(e) => update("usage", e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-600" />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sometimes</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Frequently</span>
            </div>
          </div>
        </div>

        {/* Support Complaints */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Support Complaints</h3>
              <p className="text-xs text-gray-400">Number of unresolved support tickets (capped at 10).</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-teal-600">{weights.support}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input type="range" min={0} max={100} value={weights.support} onChange={(e) => update("support", e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Minimal</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">High Impact</span>
            </div>
          </div>
        </div>

        {/* Payment Delays */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Payment Delays</h3>
              <p className="text-xs text-gray-400">Late or missed subscription payments (binary signal).</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-purple-600">{weights.payment}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input type="range" min={0} max={100} value={weights.payment} onChange={(e) => update("payment", e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ignored</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Critical</span>
            </div>
          </div>
        </div>

      </div>

      {/* Priority instructions */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">How to Set Your Priorities</p>
        <div className="flex flex-col gap-3 text-xs text-gray-500 leading-relaxed">
          <div className="flex gap-2.5 items-start">
            <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
            <p>Think about <span className="font-semibold text-gray-700">what usually signals a customer is about to leave</span> in your business — and give that signal a higher weight.</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
            <p>If <span className="font-semibold text-gray-700">all 4 signals are equally important</span>, set each to <span className="font-semibold text-blue-700">25%</span> — the system treats them as equal priorities.</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
            <p>If one signal matters more — for example, <span className="font-semibold text-gray-700">payment delays are your strongest churn indicator</span> — raise that slider higher than the rest.</p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-blue-600 font-bold shrink-0 mt-0.5">→</span>
            <p>The total is recommended to be <span className="font-semibold text-gray-700">100%</span>. Use <span className="font-semibold text-gray-700">Reset to Default</span> anytime to go back to equal weights (25% each).</p>
          </div>
        </div>
      </div>

    </div>
  );
}
