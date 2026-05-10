"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import OnboardingFooter from "@/features/onboarding/components/OnboardingFooter";
import WeightSlider from "@/features/onboarding/components/WeightSlider";

export default function OnboardingStep2Page() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Defaults match scoring.ts DEFAULT_WEIGHTS
  const [inactivity, setInactivity] = useState(30);
  const [usage, setUsage] = useState(25);
  const [support, setSupport] = useState(25);
  const [payment, setPayment] = useState(20);

  const total = inactivity + usage + support + payment;

  // Signals for Impact Analysis — real proportional contribution to scoring
  const signals = useMemo(() => [
    { label: "Inactivity", value: inactivity, color: "#2548B4" },
    { label: "Usage Drop", value: usage,      color: "#d97706" },
    { label: "Support",    value: support,    color: "#0d9488" },
    { label: "Payment",    value: payment,    color: "#7c3aed" },
  ], [inactivity, usage, support, payment]);

  const dominant = [...signals].sort((a, b) => b.value - a.value)[0];

  // Blue shade driven by average weight
  const avg = useMemo(() => total / 4, [total]);
  const l = Math.round(50 - avg * 0.25);
  const s = Math.round(58 + avg * 0.22);
  const engineBg  = `hsl(227, ${s}%, ${l}%)`;
  const formulaBg = `hsl(227, ${Math.min(s + 6, 95)}%, ${Math.max(l - 9, 10)}%)`;
  const impactBg  = `hsl(227, ${Math.max(s - 8, 40)}%, ${Math.min(l + 7, 60)}%)`;

  // Normalized proportions — exactly what the scoring engine computes
  const norm = (v: number) => total > 0 ? (v / total).toFixed(2) : "0.00";
  const pct  = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;

  const saveAndContinue = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_inactivity: inactivity,
          weight_usage:      usage,
          weight_support:    support,
          weight_payment:    payment,
        }),
      });
    } finally {
      setSaving(false);
      router.push("/onboarding/step-3");
    }
  };

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
            <p className="text-gray-600 text-sm leading-relaxed mb-2 sm:mb-4 max-w-lg">
              Set how much each risk signal contributes to a customer&apos;s churn score. These weights are saved and applied every time you upload customer data.
            </p>
            <p className="text-[11px] text-gray-400 mb-6 sm:mb-8 max-w-lg">
              The scoring engine divides by the total — so proportions matter, not the exact numbers. You can adjust these anytime in Settings.
            </p>

            <div className="flex flex-col gap-4 sm:gap-6 flex-1">
              <WeightSlider
                title="Inactivity Period"
                description="Days since last user authentication (capped at 90 days)"
                value={inactivity}
                onChange={setInactivity}
                color="#2548B4"
              />
              <WeightSlider
                title="Usage Frequency"
                description="Logins and feature interaction events"
                value={usage}
                onChange={setUsage}
                color="#d97706"
              />
              <WeightSlider
                title="Support Tickets"
                description="Volume of unresolved support complaints (capped at 10)"
                value={support}
                onChange={setSupport}
                color="#0d9488"
              />
              <WeightSlider
                title="Payment Delays"
                description="Late or missed subscription payments (binary signal)"
                value={payment}
                onChange={setPayment}
                color="#7c3aed"
              />
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="w-full lg:w-[45%] bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6">

            {/* Live Predictive Engine Box */}
            <div
              className="rounded-xl p-6 sm:p-8 text-white shadow-lg transition-colors duration-500"
              style={{ backgroundColor: engineBg }}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="font-semibold text-base sm:text-lg text-blue-50">Live Predictive Engine</h3>
              </div>

              {/* Formula — shows real normalized coefficients */}
              <div
                className="rounded-lg p-4 sm:p-5 mb-4 border border-blue-800/50 transition-colors duration-500"
                style={{ backgroundColor: formulaBg }}
              >
                <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-2 sm:mb-3">
                  Formula Transparency
                </p>
                <p className="font-mono text-[11px] sm:text-sm text-blue-100 leading-relaxed">
                  RiskScore =<br />
                  &nbsp; ({norm(inactivity)} × inactivity)<br />
                  &nbsp; + ({norm(usage)} × usage_drop)<br />
                  &nbsp; + ({norm(support)} × support)<br />
                  &nbsp; + ({norm(payment)} × payment)
                </p>
                <p className="text-[9px] text-blue-400 mt-2">
                  Coefficients = weight ÷ total ({total}) — automatically normalized
                </p>
              </div>

              {/* Impact Analysis — real weight distribution */}
              <div
                className="rounded-lg p-4 sm:p-5 border-l-4 border-emerald-400 flex flex-col gap-3 transition-colors duration-500"
                style={{ backgroundColor: impactBg }}
              >
                <div className="flex items-center gap-2 text-white font-semibold">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  Impact Analysis
                </div>
                <p className="text-[11px] text-blue-200 leading-relaxed">
                  Dominant signal: <span className="font-bold text-white">{dominant.label}</span> drives{" "}
                  <span className="font-bold text-emerald-300">{pct(dominant.value)}%</span> of every risk score.
                </p>
                {/* Proportional bars — exactly how scoring engine sees these weights */}
                <div className="flex flex-col gap-2 mt-1">
                  {signals.map((sig) => (
                    <div key={sig.label} className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wide w-16 shrink-0">{sig.label}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct(sig.value)}%`, backgroundColor: sig.color }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-blue-100 w-7 text-right">{pct(sig.value)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weight sum indicator */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">
                Weight Total
              </p>
              <div className="flex justify-between text-sm font-medium text-gray-800 mb-2">
                <span>Sum of all weights</span>
                <span className={total === 100 ? "text-teal-600 font-bold" : total > 100 ? "text-red-500 font-bold" : "text-amber-600 font-bold"}>
                  {total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${total === 100 ? "bg-teal-500" : total > 100 ? "bg-red-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.min((total / 100) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {total === 100
                  ? "Weights sum to 100 — cleanly normalized."
                  : total > 100
                  ? `${total - 100} over 100. The formula still works correctly (it normalizes automatically), but 100 is the conventional target.`
                  : `${100 - total} unallocated. The formula normalizes automatically — this is fine.`}
              </p>
            </div>

          </div>

        </div>
      </main>

      <OnboardingFooter
        onBack={() => router.push("/onboarding")}
        onContinue={saveAndContinue}
        continueText={saving ? "Saving…" : "Save & Continue"}
        canContinue={!saving}
      />
    </div>
  );
}
