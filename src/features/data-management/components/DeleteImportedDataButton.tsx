"use client";

import { useState } from "react";
import { useChurnStore } from "@/store/churn-store";

export default function DeleteImportedDataButton() {
  const bumpDataVersion = useChurnStore((s) => s.bumpDataVersion);
  const setCustomers = useChurnStore((s) => s.setCustomers);
  const selectCustomer = useChurnStore((s) => s.selectCustomer);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete all imported customer data for your account?\n\nThis removes customers and related outreach drafts. Other users are not affected.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/customers", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      setCustomers([]);
      selectCustomer(null);
      bumpDataVersion();
      setFeedback({
        type: "success",
        text: `Removed ${data.deleted ?? 0} customer record(s) from your workspace.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Delete failed",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Data cleanup</h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">
        Permanently remove all imported customers for your login only.
      </p>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        {deleting ? "Deleting…" : "Delete My Imported Data"}
      </button>
      {feedback && (
        <p
          className={`mt-2 text-xs font-medium ${
            feedback.type === "success" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}
