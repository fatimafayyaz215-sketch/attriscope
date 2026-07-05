"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useRouter } from "next/navigation";
import { useChurnStore } from "@/store/churn-store";
import { stripHtml } from "@/lib/outreach-email";

export type SavedDraftRow = {
  id: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  riskLevel: string;
  riskScore: number;
  toEmail: string;
  subject: string;
  body: string;
  savedAt: string;
};

type DraftsModalProps = {
  onDraftDeleted?: (customerId: string) => void;
};

export type DraftsModalHandle = {
  show: () => void;
};

function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function riskBadgeClass(level: string): string {
  if (level === "high") return "bg-red-50 text-red-600";
  if (level === "medium") return "bg-amber-50 text-amber-600";
  return "bg-teal-50 text-teal-700";
}

const DraftsModal = forwardRef<DraftsModalHandle, DraftsModalProps>(function DraftsModal(
  { onDraftDeleted },
  ref,
) {
  const router = useRouter();
  const selectCustomer = useChurnStore((s) => s.selectCustomer);
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<SavedDraftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<SavedDraftRow | null>(null);
  const [error, setError] = useState("");

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/outreach/drafts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load drafts");
      setDrafts(data.drafts ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load drafts");
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setDraftToDelete(null);
    setOpen(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      show: () => {
        setOpen(true);
        void fetchDrafts();
      },
    }),
    [fetchDrafts],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (draftToDelete) {
        setDraftToDelete(null);
        return;
      }
      closeModal();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeModal, draftToDelete]);

  const openDraft = (customerId: string) => {
    selectCustomer(customerId);
    router.replace(`/outreach-hub?customerId=${encodeURIComponent(customerId)}`);
    closeModal();
  };

  const confirmDeleteDraft = async () => {
    if (!draftToDelete) return;

    const draft = draftToDelete;
    setDeletingId(draft.id);
    setError("");
    try {
      const res = await fetch(`/api/outreach/draft?draftId=${encodeURIComponent(draft.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete draft");

      setDrafts((current) => current.filter((item) => item.id !== draft.id));
      setDraftToDelete(null);
      onDraftDeleted?.(draft.customerId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete draft");
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close drafts"
        className="fixed inset-0 z-[90] bg-black/40"
        onClick={() => {
          if (draftToDelete) {
            setDraftToDelete(null);
            return;
          }
          closeModal();
        }}
      />

      <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drafts-modal-title"
          className="pointer-events-auto flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
        >
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-[#fafbfe] px-6 py-4">
          <div>
            <h2 id="drafts-modal-title" className="text-base font-bold text-gray-900">
              Saved Drafts
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {loading ? "Loading…" : `${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchDrafts()}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900">No saved drafts yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Draft an email for a customer and click Save Draft to see it here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {drafts.map((draft) => {
                const preview = stripHtml(draft.body);
                const previewText =
                  preview.length > 120 ? `${preview.slice(0, 120).trim()}…` : preview;

                return (
                  <li key={draft.id} className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => openDraft(draft.customerId)}
                      className="min-w-0 flex-1 px-6 py-4 text-left transition-colors hover:bg-blue-50/50"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">{draft.customerName}</p>
                          <p className="truncate text-[11px] text-gray-400">
                            {draft.customerCompany || draft.toEmail}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadgeClass(draft.riskLevel)}`}
                        >
                          {draft.riskLevel}
                        </span>
                      </div>

                      <p className="mb-1 truncate text-sm font-medium text-gray-800">
                        {draft.subject || "(No subject)"}
                      </p>
                      {previewText && (
                        <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                          {previewText}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatSavedAt(draft.savedAt)}
                        </span>
                        <span>To: {draft.toEmail}</span>
                        <span>Score: {draft.riskScore}</span>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center border-l border-gray-100 px-3">
                      <button
                        type="button"
                        onClick={() => setDraftToDelete(draft)}
                        disabled={deletingId === draft.id}
                        aria-label={`Delete draft for ${draft.customerName}`}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === draft.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        </div>
      </div>

      {draftToDelete && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Cancel delete"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDraftToDelete(null)}
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-draft-title"
            aria-describedby="delete-draft-description"
            className="relative z-10 flex w-full max-w-md max-h-[85vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 sm:h-12 sm:w-12">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <h3 id="delete-draft-title" className="text-base font-bold text-gray-900 sm:text-lg">
                Delete this draft?
              </h3>
              <p
                id="delete-draft-description"
                className="mt-2 text-sm leading-relaxed text-gray-600 break-words"
              >
                You are about to permanently delete the draft for{" "}
                <span className="font-semibold text-gray-900">{draftToDelete.customerName}</span>.
                {draftToDelete.subject ? (
                  <>
                    {" "}
                    Subject:{" "}
                    <span className="font-medium break-words">
                      &ldquo;{draftToDelete.subject}&rdquo;
                    </span>
                  </>
                ) : null}{" "}
                This action cannot be undone.
              </p>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => setDraftToDelete(null)}
                disabled={deletingId === draftToDelete.id}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteDraft()}
                disabled={deletingId === draftToDelete.id}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 sm:w-auto"
              >
                {deletingId === draftToDelete.id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting…
                  </>
                ) : (
                  "Delete Draft"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default DraftsModal;
