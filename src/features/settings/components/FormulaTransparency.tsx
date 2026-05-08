"use client";

import { useChurnStore } from "@/store/churn-store";

export default function FormulaTransparency() {
  const { weights } = useChurnStore();
  const total = weights.inactivity + weights.usage + weights.support + weights.payment;
  const w1 = (weights.inactivity / (total || 100)).toFixed(2);
  const w2 = (weights.usage / (total || 100)).toFixed(2);
  const w3 = (weights.support / (total || 100)).toFixed(2);
  const w4 = (weights.payment / (total || 100)).toFixed(2);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-[#0f172a] rounded-xl p-8 flex flex-col h-full shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
          <h2 className="text-sm font-bold text-white">Formula Transparency</h2>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div>
            <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-4">Live Predictive Engine</h3>
            <ul className="flex flex-col gap-6">
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 1</p>
                  <p className="text-gray-500 font-mono">Login_Inactivity(x)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-blue-400 font-bold text-lg">× {w1}</p>
                </div>
              </li>
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 2</p>
                  <p className="text-gray-500 font-mono">Usage_Drop(y)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-amber-400 font-bold text-lg">× {w2}</p>
                </div>
              </li>
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 3</p>
                  <p className="text-gray-500 font-mono">Support_Load(z)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-teal-400 font-bold text-lg">× {w3}</p>
                </div>
              </li>
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 4</p>
                  <p className="text-gray-500 font-mono">Payment_Delay(p)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-purple-400 font-bold text-lg">× {w4}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-gray-800">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Current Scoring Formula</p>
            <div className="bg-[#1e293b] rounded-lg p-4 font-mono text-xs text-blue-300 border border-blue-900/50 leading-relaxed">
              RiskScore = (<br />
              &nbsp;&nbsp;{w1}×x + {w2}×y +<br />
              &nbsp;&nbsp;{w3}×z + {w4}×p<br />
              ) × 100
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-amber-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
          <h3 className="text-sm font-bold text-gray-900">Impact Preview</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Inactivity &amp; usage together account for{" "}
          <span className="text-blue-600 font-bold">{weights.inactivity + weights.usage}%</span> of the score.
          Payment delay contributes{" "}
          <span className="text-purple-600 font-bold">{weights.payment}%</span>.
        </p>
      </div>
    </div>
  );
}
