"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import OnboardingFooter from "@/features/onboarding/components/OnboardingFooter";

export default function OnboardingStep3Page() {
  const router = useRouter();

  /** Mark onboarding done in user metadata, then navigate to dashboard. */
  const finish = async () => {
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { onboarding_completed: true } });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-14 sm:pt-16">
      <OnboardingHeader step={3} title="Data Connection (Final)" />

      <main className="flex-1 flex justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          {/* Left Column */}
            <div className="w-full lg:w-[45%] flex flex-col gap-3 sm:gap-4">
            
            {/* Top Intro Box */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 shadow-sm">
              <h1 className="text-2xl sm:text-3xl text-blue-800 font-normal leading-tight mb-3 sm:mb-4 tracking-tight">
                Finalizing Your Data Intelligence
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Securely connect your customer data to activate ChurnGuardAI&apos;s predictive engine. We&apos;ll handle the heavy lifting of mapping and encryption.
              </p>

              {/* Graphic Placeholder */}
              <div className="w-full aspect-2/1 bg-[#0B1521] rounded-lg overflow-hidden relative flex items-center justify-center border border-gray-800 shadow-inner">
                {/* Abstract Cloud/Circuit Graphic */}
                <div className="absolute inset-0 bg-linear-to-t from-teal-900/20 to-transparent"></div>
                
                {/* Cloud Outline */}
                <svg className="w-48 h-auto opacity-30 text-teal-400 absolute" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>

                {/* Circuit lines */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-full h-px bg-teal-500 absolute top-1/2"></div>
                  <div className="w-px h-full bg-teal-500 absolute left-1/2"></div>
                  <div className="w-full h-px bg-teal-500 absolute top-1/3"></div>
                  <div className="w-px h-full bg-teal-500 absolute left-1/3"></div>
                  <div className="w-full h-px bg-teal-500 absolute top-2/3"></div>
                  <div className="w-px h-full bg-teal-500 absolute left-2/3"></div>
                </div>

                {/* Core Chip */}
                <div className="relative z-10 w-16 h-16 bg-linear-to-br from-yellow-600 to-amber-700 rounded-lg transform rotate-45 border-4 border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.4)] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-amber-200/50 -rotate-45 flex items-center justify-center">
                    <div className="w-3 h-3 bg-amber-200"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex gap-5 items-start">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-800 tracking-widest uppercase mb-1">Auto-Mapping</h3>
                <p className="text-sm text-gray-600 leading-relaxed">System detects headers and maps them to AI features automatically, reducing manual configuration.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex gap-5 items-start">
              <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-700 tracking-widest uppercase mb-1">Data Privacy</h3>
                <p className="text-sm text-gray-600 leading-relaxed">All PII is encrypted at rest and anonymized during training to ensure enterprise-grade compliance.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex gap-5 items-start">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800 tracking-widest uppercase mb-1">Processing Time</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Large datasets (10k+ rows) typically process in under 2 minutes using our distributed compute engine.</p>
              </div>
            </div>

          </div>

          {/* Right Column */}
            <div className="w-full lg:w-[55%] flex flex-col gap-3 sm:gap-4">
            
            {/* Upload Box */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Required Columns Guide</h2>
              
              {/* Pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['Customer ID', 'Last Login', 'Subscription Start', 'MRR Value', 'Support Tickets'].map(col => (
                  <div key={col} className="bg-gray-100/80 border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {col}
                  </div>
                ))}
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-10 flex flex-col items-center justify-center text-center mb-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-medium mb-2">Drag and drop CSV files</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Maximum file size 50MB. Make sure your data is in UTF-8 format for best results.
                </p>
                <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Select File from Computer
                </button>
              </div>

              {/* Main CTA */}
              <button onClick={finish} className="w-full bg-[#148e7f] hover:bg-[#117a6d] active:scale-[0.99] text-white font-medium py-3.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm mb-4">
                Finish Setup &amp; Enter Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <div className="text-center">
                <button onClick={finish} className="text-sm font-bold tracking-widest uppercase text-gray-400 hover:text-gray-600 transition-colors">
                  Skip For Now
                </button>
              </div>

            </div>

            {/* Empty State Box */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-50">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-400">Upload a file to see data preview and mapping</p>
            </div>

          </div>

        </div>
      </main>

      <OnboardingFooter 
        onBack={() => router.push('/onboarding/step-2')}
        onContinue={finish}
        continueText="FINISH SETUP"
        continueIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        middleContent={
          <button onClick={finish} className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Skip For Now
          </button>
        }
      />
    </div>
  );
}
