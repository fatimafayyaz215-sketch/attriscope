"use client";

import { useState, useEffect } from "react";
import { useChurnStore } from "@/store/churn-store";

export default function SettingsFooter() {
  const { weights, industry, setWeights, setIndustry } = useChurnStore();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");

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
          setIndustry(d.industry);
        }
      })
      .catch(() => {});
  }, [setWeights, setIndustry]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setWeights({ inactivity: 25, usage: 25, support: 25, payment: 25 });
    setIndustry("saas");
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
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
