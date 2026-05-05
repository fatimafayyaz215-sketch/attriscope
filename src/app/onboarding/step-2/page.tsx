"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import OnboardingFooter from "@/features/onboarding/components/OnboardingFooter";
import WeightSlider from "@/features/onboarding/components/WeightSlider";

export default function OnboardingStep2Page() {
  const router = useRouter();
  
  const [inactivity, setInactivity] = useState(30);
  const [usage, setUsage] = useState(45);
  const [support, setSupport] = useState(25);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[72px]">
      <OnboardingHeader step={2} title="Weight Calibration" />

      <main className="flex-1 flex justify-center p-8">
        <div className="w-full max-w-6xl bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column - Controls */}
          <div className="w-full lg:w-[55%] p-10 flex flex-col">
            <h1 className="text-3xl font-normal text-blue-700 mb-4 tracking-tight">
              Weight Calibration
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-10 max-w-lg">
              Fine-tune the weights for your predictive churn model to align with your business's unique risk factors and customer behavior patterns.
            </p>

            <div className="flex flex-col gap-6 flex-1">
              <WeightSlider 
                title="Inactivity Period"
                description="Days since last user authentication"
                value={inactivity}
                onChange={setInactivity}
              />
              <WeightSlider 
                title="Usage Frequency"
                description="Logins and feature interaction events"
                value={usage}
                onChange={setUsage}
              />
              <WeightSlider 
                title="Support Tickets"
                description="Volume and sentiment of unresolved tickets"
                value={support}
                onChange={setSupport}
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="w-full lg:w-[45%] bg-gray-50 border-l border-gray-200 p-8 flex flex-col gap-6">
            
            {/* Live Predictive Engine Box */}
            <div className="bg-[#2643a6] rounded-xl p-8 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="font-semibold text-lg text-blue-50">Live Predictive Engine</h3>
              </div>

              <div className="bg-[#1c358f] rounded-lg p-5 mb-6 border border-blue-800/50">
                <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-3">
                  Formula Transparency
                </p>
                <p className="font-mono text-xl text-blue-100 tracking-tight">
                  RiskScore = ({(inactivity / 100).toFixed(2)} * x) + ({(usage / 100).toFixed(2)} * y) + ({(support / 100).toFixed(2)} * z)
                </p>
              </div>

              <div className="bg-[#3651b1] rounded-lg p-6 border-l-4 border-emerald-400 shadow-inner flex flex-col gap-2 relative overflow-hidden">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  Impact Analysis
                </div>
                <p className="text-xs text-blue-200 leading-relaxed mb-4 max-w-sm">
                  Expected increase in overall forecast accuracy based on current weights.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-400 tracking-tighter">8.4%</span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Precision Uplift</span>
                </div>
              </div>
            </div>

            {/* Historical Benchmark Box */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">
                Historical Benchmark
              </p>
              <div className="flex justify-between text-sm font-medium text-gray-800 mb-2">
                <span>Industry Average</span>
                <span>22.4%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6">
                <div className="h-full bg-gray-300 rounded-full" style={{ width: '22.4%' }}></div>
              </div>
              <p className="text-xs text-gray-500 italic leading-relaxed">
                "Optimal calibration typically weights Usage Frequency at 40%+ for high-retention SaaS models."
              </p>
            </div>

            {/* Dashboard Mockup (Bottom) */}
            <div className="flex-1 bg-[#121b2a] rounded-xl overflow-hidden shadow-inner border border-gray-800 relative min-h-[140px]">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent flex flex-col p-4">
                 {/* Fake UI elements */}
                 <div className="flex justify-between items-start opacity-40">
                   <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   </div>
                   <div className="w-1/3 h-2 bg-blue-500/30 rounded"></div>
                 </div>
                 
                 <div className="flex-1 flex items-center justify-center opacity-60">
                    {/* Circle diagram mock */}
                    <div className="w-24 h-24 rounded-full border-[4px] border-blue-500/30 border-t-blue-400 border-r-blue-400 relative flex items-center justify-center">
                       <div className="w-16 h-16 rounded-full border-[2px] border-emerald-500/40 border-b-emerald-400 absolute"></div>
                    </div>
                 </div>
               </div>
            </div>

          </div>

        </div>
      </main>

      <OnboardingFooter 
        onBack={() => router.push('/onboarding')}
        onContinue={() => router.push('/onboarding/step-3')}
        continueText="Continue to Step 3 →"
      />
    </div>
  );
}
