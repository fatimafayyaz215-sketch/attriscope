"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import OnboardingFooter from "@/features/onboarding/components/OnboardingFooter";
import WeightSlider from "@/features/onboarding/components/WeightSlider";
import { DEFAULT_INDUSTRY, capWeightUpdate, getIndustryDefaultWeights, sumWeights } from "@/lib/industry-defaults";

type WeightKey = "inactivity" | "usage" | "support" | "payment";

export default function OnboardingStep2Page() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(true);

  const initialWeights = getIndustryDefaultWeights(DEFAULT_INDUSTRY);
  const [inactivity, setInactivity] = useState(initialWeights.inactivity);
  const [usage, setUsage] = useState(initialWeights.usage);
  const [support, setSupport] = useState(initialWeights.support);
  const [payment, setPayment] = useState(initialWeights.payment);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setInactivity(d.weight_inactivity);
          setUsage(d.weight_usage);
          setSupport(d.weight_support);
          setPayment(d.weight_payment);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDefaults(false));
  }, []);

  const weights = { inactivity, usage, support, payment };
  const total = sumWeights(weights);

  const updateWeight = (key: WeightKey, nextValue: number) => {
    const nextWeights = capWeightUpdate(weights, key, nextValue);
    setInactivity(nextWeights.inactivity);
    setUsage(nextWeights.usage);
    setSupport(nextWeights.support);
    setPayment(nextWeights.payment);
  };

  const signals = useMemo(() => [
    { label: "Inactivity", value: inactivity, color: "#2548B4" },
    { label: "Usage Drop", value: usage, color: "#d97706" },
    { label: "Support", value: support, color: "#0d9488" },
    { label: "Payment", value: payment, color: "#7c3aed" },
  ], [inactivity, usage, support, payment]);

  const dominant = [...signals].sort((a, b) => b.value - a.value)[0];

  const avg = useMemo(() => total / 4, [total]);
  const l = Math.round(50 - avg * 0.25);
  const s = Math.round(58 + avg * 0.22);
  const engineBg = `hsl(227, ${s}%, ${l}%)`;
  const formulaBg = `hsl(227, ${Math.min(s + 6, 95)}%, ${Math.max(l - 9, 10)}%)`;
  const impactBg = `hsl(227, ${Math.max(s - 8, 40)}%, ${Math.min(l + 7, 60)}%)`;

  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;

  const saveAndContinue = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_inactivity: inactivity,
          weight_usage: usage,
          weight_support: support,
          weight_payment: payment,
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
              Set how much each risk signal contributes to a customer&apos;s churn score. This screen is preloaded from your selected industry profile and these weights are saved for future uploads.
            </p>
            <p className="text-[11px] text-gray-400 mb-6 sm:mb-8 max-w-lg">
              The total cannot go above 100%. You can adjust these anytime in Settings.
            </p>

            <div className="flex flex-col gap-4 sm:gap-6 flex-1">
              <WeightSlider
                title="Inactivity Period"
                description="Days since last login — cap adjusts by plan: 28 days (monthly), 85 days (yearly)"
                value={inactivity}
                onChange={(value) => updateWeight("inactivity", value)}
                color="#2548B4"
              />
              <WeightSlider
                title="Usage Frequency"
                description="Logins and feature interaction events"
                value={usage}
                onChange={(value) => updateWeight("usage", value)}
                color="#d97706"
              />
              <WeightSlider
                title="Support Tickets"
                description="Unresolved support tickets — cap adjusts by plan: 5 (monthly), 9 (yearly)"
                value={support}
                onChange={(value) => updateWeight("support", value)}
                color="#0d9488"
              />
              <WeightSlider
                title="Payment Delays"
                description="Late or missed subscription payments (binary signal)"
                value={payment}
                onChange={(value) => updateWeight("payment", value)}
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

              {/* Priority setup box */}
              <div
                className="rounded-lg p-4 sm:p-5 mb-4 border border-blue-800/50 transition-colors duration-500"
                style={{ backgroundColor: formulaBg }}
              >
                <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-3">
                  Priority Setup
                </p>
                <div className="flex flex-col gap-2">
                  {signals.map((sig) => (
                    <div key={sig.label} className="flex justify-between items-center">
                      <span className="text-[11px] text-blue-200">{sig.label}</span>
                      <span className="text-sm font-bold text-white">{sig.value}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-blue-400 mt-3 leading-relaxed">
                  These weights come from your selected industry profile. You can rebalance them here as long as the total stays at or below 100%.
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
                <span className={total === 100 ? "text-teal-600 font-bold" : "text-amber-600 font-bold"}>
                  {total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${total === 100 ? "bg-teal-500" : "bg-amber-400"}`}
                  style={{ width: `${Math.min((total / 100) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {total === 100
                  ? "Weights sum to 100 — the full budget is allocated."
                  : `${100 - total}% remains available for allocation.`}
              </p>
            </div>

          </div>

        </div>
      </main>

      <OnboardingFooter
        onBack={() => router.push("/onboarding")}
        onContinue={saveAndContinue}
        continueText={saving ? "Saving…" : "Save & Continue"}
        canContinue={!saving && !loadingDefaults}
      />
    </div>
  );
}
