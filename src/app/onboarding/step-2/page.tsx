"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import OnboardingFooter from "@/features/onboarding/components/OnboardingFooter";
import WeightSlider from "@/features/onboarding/components/WeightSlider";

export default function OnboardingStep2Page() {
  const router = useRouter();
  
  const [inactivity, setInactivity] = useState(30);
  const [usage, setUsage] = useState(45);
  const [support, setSupport] = useState(25);

  // Compute average weight (0–100) to drive the blue shade of the preview panel.
  const avg = useMemo(() => (inactivity + usage + support) / 3, [inactivity, usage, support]);
  // Lightness: 50% at avg=0 → 25% at avg=100. Saturation: 58% → 80%.
  const l = Math.round(50 - avg * 0.25);
  const s = Math.round(58 + avg * 0.22);
  const engineBg   = `hsl(227, ${s}%, ${l}%)`;
  const formulaBg  = `hsl(227, ${Math.min(s + 6, 95)}%, ${Math.max(l - 9, 10)}%)`;
  const impactBg   = `hsl(227, ${Math.max(s - 8, 40)}%, ${Math.min(l + 7, 60)}%)`;

  // Dynamic precision uplift: scales with total weight, baseline 8.4 at sum=100.
  const total = inactivity + usage + support;
  const precisionUplift = (total * 0.084).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-14 sm:pt-16">
      <OnboardingHeader step={2} title="Weight Calibration" />

      <main className="flex-1 flex justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Column - Controls */}
          <div className="w-full lg:w-[55%] p-6 sm:p-10 flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-normal text-blue-700 mb-3 sm:mb-4 tracking-tight">
              Weight Calibration
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 sm:mb-10 max-w-lg">
              Fine-tune the weights for your predictive churn model to align with your business&apos;s unique risk factors and customer behavior patterns.
            </p>

            <div className="flex flex-col gap-4 sm:gap-6 flex-1">
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

          {/* Right Column - Live Preview */}
          <div className="w-full lg:w-[45%] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6">
            
            {/* Live Predictive Engine Box — color driven by slider average */}
            <div
              className="rounded-xl p-6 sm:p-8 text-white shadow-lg transition-colors duration-500"
              style={{ backgroundColor: engineBg }}
            >
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="font-semibold text-base sm:text-lg text-blue-50">Live Predictive Engine</h3>
              </div>

              <div
                className="rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 border border-blue-800/50 transition-colors duration-500"
                style={{ backgroundColor: formulaBg }}
              >
                <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-2 sm:mb-3">
                  Formula Transparency
                </p>
                <p className="font-mono text-sm sm:text-xl text-blue-100 tracking-tight break-all sm:break-normal">
                  RiskScore = ({(inactivity / 100).toFixed(2)} * x) + ({(usage / 100).toFixed(2)} * y) + ({(support / 100).toFixed(2)} * z)
                </p>
              </div>

              <div
                className="rounded-lg p-4 sm:p-6 border-l-4 border-emerald-400 shadow-inner flex flex-col gap-2 relative overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: impactBg }}
              >
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  Impact Analysis
                </div>
                <p className="text-xs text-blue-200 leading-relaxed mb-3 sm:mb-4">
                  Expected increase in overall forecast accuracy based on current weights.
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-emerald-400 tracking-tighter transition-all duration-300">
                    {precisionUplift}%
                  </span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Precision Uplift</span>
                </div>
              </div>
            </div>

            {/* Historical Benchmark Box */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3 sm:mb-4">
                Historical Benchmark
              </p>
              <div className="flex justify-between text-sm font-medium text-gray-800 mb-2">
                <span>Industry Average</span>
                <span>22.4%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 sm:mb-6">
                <div className="h-full bg-gray-300 rounded-full" style={{ width: '22.4%' }}></div>
              </div>
              <p className="text-xs text-gray-500 italic leading-relaxed">
                &quot;Optimal calibration typically weights Usage Frequency at 40%+ for high-retention SaaS models.&quot;
              </p>
            </div>

            {/* Dashboard Mockup (Bottom) */}
            <div className="flex-1 bg-[#121b2a] rounded-xl overflow-hidden shadow-inner border border-gray-800 relative min-h-25 sm:min-h-35">
               <div className="absolute inset-0 bg-linear-to-br from-blue-900/40 to-transparent flex flex-col p-4">
                 <div className="flex justify-between items-start opacity-40">
                   <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   </div>
                   <div className="w-1/3 h-2 bg-blue-500/30 rounded"></div>
                 </div>
                 
                 <div className="flex-1 flex items-center justify-center opacity-60">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-500/30 border-t-blue-400 border-r-blue-400 relative flex items-center justify-center">
                       <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-emerald-500/40 border-b-emerald-400 absolute"></div>
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
        continueText="Continue to Step 3"
      />
    </div>
  );
}
