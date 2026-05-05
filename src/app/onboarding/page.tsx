"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import OnboardingFooter from "@/features/onboarding/components/OnboardingFooter";
import IndustryCard from "@/features/onboarding/components/IndustryCard";

const industries = [
  {
    id: "entertainment",
    title: "Entertainment",
    badge: "B2C, HIGH VOLUME",
    description: "Calibrates for engagement decay, seasonal trends, and viral adoption spikes to predict consumer drop-off.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    id: "saas",
    title: "Software / SaaS",
    badge: "B2B, STICKY",
    description: "Optimizes for account-level health scores, feature utilization patterns, and renewal cycle dependencies.",
    recommended: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
  {
    id: "education",
    title: "Education",
    badge: "COURSEWARE, RETENTION",
    description: "Focuses on completion rates, learning velocity, and milestone achievement as primary indicators of long-term retention.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("saas");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[72px]">
      <OnboardingHeader />

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-5xl">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
              Select your industry to calibrate our predictive models
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Our AI engines adapt their churn signals based on your specific business model and transaction volume dynamics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {industries.map((ind) => (
              <IndustryCard
                key={ind.id}
                id={ind.id}
                title={ind.title}
                badge={ind.badge}
                description={ind.description}
                icon={ind.icon}
                selected={selectedIndustry === ind.id}
                recommended={ind.recommended}
                onClick={setSelectedIndustry}
              />
            ))}
          </div>

          {/* Calibration Info Card */}
          <div className="bg-[#f4f4f9] rounded-2xl border border-gray-200 p-8 flex flex-col md:flex-row items-center gap-10 overflow-hidden shadow-sm">
            
            {/* Tablet Mockup Placeholder */}
            <div className="w-full md:w-1/2 bg-[#1a1f2c] rounded-2xl overflow-hidden shadow-2xl relative aspect-[16/10] border-[6px] border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-gray-900/90 flex flex-col p-5">
                 {/* Fake Dashboard UI */}
                 <div className="flex items-center gap-2 mb-6 opacity-40">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                   <div className="ml-4 h-2 w-24 bg-gray-600 rounded"></div>
                 </div>

                 {/* Fake chart */}
                 <div className="flex-1 flex items-end justify-between px-2 pb-2 border-b border-gray-700/50">
                    {[30, 45, 35, 60, 40, 75, 55, 80, 65, 90, 70, 85].map((h, i) => (
                      <div key={i} className="w-[6%] mx-[1%] relative group h-full flex items-end">
                        <div className="w-full bg-blue-500/40 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}>
                           <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400"></div>
                        </div>
                      </div>
                    ))}
                 </div>

                 <div className="mt-5 flex gap-4 opacity-70">
                    <div className="h-2 w-1/3 bg-gray-600 rounded"></div>
                    <div className="h-2 w-1/4 bg-blue-500/50 rounded"></div>
                 </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Precision Calibration</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Different industries exhibit unique &apos;Churn Signatures&apos;. By selecting your context, you enable our AI to weight specific behavioral signals higher than others.
              </p>
              
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-800">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  98% Accuracy on industry-specific weights
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-800">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Dynamic threshold adjustment
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <OnboardingFooter 
        onBack={() => router.push('/')}
        onContinue={() => router.push('/onboarding/step-2')}
        canContinue={!!selectedIndustry}
      />
    </div>
  );
}
