"use client";

import { useChurnStore } from "@/store/churn-store";
import { notifyAdvisorIndustryChanged } from "@/lib/advisor-events";
import { getIndustryDefaultWeights } from "@/lib/industry-defaults";

export default function IndustrySelector() {
  const { industry, setIndustry, setWeights } = useChurnStore();

  const industries = [
    {
      id: "entertainment",
      name: "Entertainment",
      desc: "Optimized for streaming services and content libraries. Focuses on viewing habits.",
      tags: ["B2C", "HIGH VOLUME"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      ),
    },
    {
      id: "saas",
      name: "Software / SaaS",
      desc: "Calibration for recurring B2B licenses. Prioritizes feature adoption and API usage.",
      tags: ["B2B", "STICKY"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
      ),
    },
    {
      id: "education",
      name: "Education",
      desc: "Focused on learning management systems. Tracks progression and assessment rates.",
      tags: ["COURSEWARE", "RETENTION"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
        <h2 className="text-sm font-bold text-gray-900">Select Industry Vertical</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {industries.map((ind) => {
          const active = industry === ind.id;
          return (
            <button
              key={ind.id}
              type="button"
              onClick={() => {
                setIndustry(ind.id);
                setWeights(getIndustryDefaultWeights(ind.id));
                notifyAdvisorIndustryChanged(ind.id);
              }}
              className={`bg-white border-2 rounded-xl p-5 relative transition-all cursor-pointer hover:shadow-md text-left min-h-[252px] ${active ? "border-blue-600 shadow-sm" : "border-gray-200"}`}
            >
              {active && (
                <span className="absolute top-4 right-4 bg-blue-700 text-white text-[8px] font-bold px-2 py-1 rounded tracking-wider uppercase">Active</span>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${active ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"}`}>
                {ind.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{ind.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{ind.desc}</p>
              <div className="flex flex-wrap gap-2">
                {ind.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-bold text-gray-400 border border-gray-200 px-2 py-0.5 rounded tracking-wider">{tag}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
