"use client";

import { useEffect, useRef, useState } from "react";
import { useChurnStore } from "@/store/churn-store";
import { notifyAdvisorIndustryChanged } from "@/lib/advisor-events";
import { getIndustryDefaultWeights, normalizeIndustry } from "@/lib/industry-defaults";

export default function SettingsFooter() {
  const { weights, industry, setWeights, setIndustry } = useChurnStore();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from API on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setWeights({
            inactivity: d.weight_inactivity,
            usage: d.weight_usage,
            support: d.weight_support,
            payment: d.weight_payment,
          });
          setIndustry(normalizeIndustry(d.industry));
        }
      })
      .catch(() => {});
  }, [setWeights, setIndustry]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  };

  const saveSettings = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          weight_inactivity: weights.inactivity,
          weight_usage: weights.usage,
          weight_support: weights.support,
          weight_payment: weights.payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setSavedAt(new Date().toLocaleString());
      notifyAdvisorIndustryChanged(industry);
      showToast("Settings saved");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = async () => {
    const defaultWeights = getIndustryDefaultWeights(industry);

    // Update store immediately so sliders reflect defaults right away
    setWeights(defaultWeights);

    setSaving(true);
    setError("");
    try {
      // Persist defaults to the database
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          weight_inactivity: defaultWeights.inactivity,
          weight_usage: defaultWeights.usage,
          weight_support: defaultWeights.support,
          weight_payment: defaultWeights.payment,
        }),
      });

      setSavedAt(new Date().toLocaleString());
      showToast("Industry defaults restored");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-center gap-8">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Saved</p>
          <p className="text-xs font-bold text-gray-700">{savedAt ?? "Not yet saved"}</p>
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {savedAt && !error && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">Saved</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={resetDefaults}
          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          Reset to Default
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-2.5 bg-[#1e293b] hover:bg-black text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
