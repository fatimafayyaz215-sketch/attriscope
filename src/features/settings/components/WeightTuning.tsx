"use client";

import { useState } from "react";

export default function WeightTuning() {
  const [weights, setWeights] = useState({
    inactivity: 30,
    usage: 45,
    support: 25
  });

  const handleSliderChange = (key: keyof typeof weights, val: string) => {
    setWeights(prev => ({ ...prev, [key]: parseInt(val) }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
        <h2 className="text-sm font-bold text-gray-900">Manual Weight Tuning</h2>
      </div>

      <div className="flex flex-col gap-12">
        {/* Inactivity Period */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inactivity Period</h3>
              <p className="text-xs text-gray-400">How heavily does non-login time contribute to churn risk?</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-[#2548B4]">{weights.inactivity}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input 
              type="range" 
              value={weights.inactivity}
              onChange={(e) => handleSliderChange('inactivity', e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#2548B4]" 
            />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Low Relevance</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Critical Signal</span>
            </div>
          </div>
        </div>

        {/* Usage Frequency */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Usage Frequency</h3>
              <p className="text-xs text-gray-400">Weight of consistent vs. sporadic feature engagement.</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-amber-600">{weights.usage}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input 
              type="range" 
              value={weights.usage}
              onChange={(e) => handleSliderChange('usage', e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-600" 
            />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sometimes</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Frequently</span>
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Support Tickets</h3>
              <p className="text-xs text-gray-400">Impact of open unresolved tickets or high ticket volume.</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weight</p>
              <p className="text-2xl font-bold text-teal-600">{weights.support}%</p>
            </div>
          </div>
          <div className="relative pt-2">
            <input 
              type="range" 
              value={weights.support}
              onChange={(e) => handleSliderChange('support', e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-teal-600" 
            />
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Minimal</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">High Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
