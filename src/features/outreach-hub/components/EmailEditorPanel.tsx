"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useChurnStore } from "@/store/churn-store";
import EmailBodyEditor, { type EmailBodyEditorHandle } from "@/features/outreach-hub/components/EmailBodyEditor";
import { bodyLooksLikeHtml, stripHtml } from "@/lib/outreach-email";

type Tone = "professional" | "friendly" | "urgent" | "discount" | "event";

type OutreachDraft = {
  toEmail: string;
  subject: string;
  body: string;
  savedAt?: string;
};

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function draftBodyToEditorHtml(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  return bodyLooksLikeHtml(trimmed) ? trimmed : plainTextToHtml(trimmed);
}

function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type EmailEditorPanelProps = {
  onViewDrafts?: () => void;
  onRegisterDraftDeleteHandler?: (handler: (customerId: string) => void) => void;
};

export default function EmailEditorPanel({
  onViewDrafts,
  onRegisterDraftDeleteHandler,
}: EmailEditorPanelProps) {
  const searchParams = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");
  const { selectedCustomerId, customers } = useChurnStore();
  const effectiveId = selectedCustomerId ?? urlCustomerId;
  const customer = customers.find((c) => c.id === effectiveId);

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [eventName, setEventName] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const inFlightCustomerIdRef = useRef<string | null>(null);
  const initializedCustomerIdRef = useRef<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyEditorRef = useRef<EmailBodyEditorHandle | null>(null);

  const setEditorHtml = useCallback((html: string) => {
    bodyEditorRef.current?.setContent(html);
    setEmailBody(html);
  }, []);

  const clearAfterDraftDelete = useCallback(
    (customerId: string) => {
      if (customerId !== effectiveId) return;

      const currentCustomer = customers.find((c) => c.id === customerId);
      if (!currentCustomer) return;

      setSent(false);
      setError("");
      setSavedAt(null);
      setToEmail(currentCustomer.email ?? "");
      setSubject("");
      setEditorHtml("");
    },
    [customers, effectiveId, setEditorHtml],
  );

  useEffect(() => {
    onRegisterDraftDeleteHandler?.(clearAfterDraftDelete);
  }, [clearAfterDraftDelete, onRegisterDraftDeleteHandler]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const applyDraft = useCallback(
    (draft: OutreachDraft) => {
      setToEmail(draft.toEmail);
      setSubject(draft.subject);
      setEditorHtml(draftBodyToEditorHtml(draft.body));
      setSavedAt(draft.savedAt ? formatSavedAt(draft.savedAt) : null);
    },
    [setEditorHtml],
  );

  const generateEmail = useCallback(async (customerIdOverride?: string | null) => {
    const targetCustomerId = customerIdOverride ?? effectiveId;
    if (!targetCustomerId) return;
    if (tone === "event" && !eventName.trim()) {
      setError("Please enter an event name for event-based tone.");
      return;
    }

    if (inFlightCustomerIdRef.current === targetCustomerId) return;
    inFlightCustomerIdRef.current = targetCustomerId;

    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: targetCustomerId,
          tone,
          eventName: tone === "event" ? eventName.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const targetCustomerEmail = customers.find((c) => c.id === targetCustomerId)?.email ?? "";
      applyDraft({
        toEmail: data.toEmail ?? targetCustomerEmail,
        subject: data.subject ?? "",
        body: data.body ?? "",
        savedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      inFlightCustomerIdRef.current = null;
      setGenerating(false);
    }
  }, [applyDraft, customers, effectiveId, tone, eventName]);

  const generateEmailRef = useRef(generateEmail);

  useEffect(() => {
    generateEmailRef.current = generateEmail;
  }, [generateEmail]);

  const saveDraft = useCallback(async () => {
    if (!effectiveId) return;

    const body = bodyEditorRef.current?.getContent() ?? emailBody;
    const trimmedSubject = subject.trim();
    const trimmedTo = toEmail.trim();

    if (!trimmedTo) {
      setError("Recipient email is required.");
      return;
    }
    if (!trimmedSubject) {
      setError("Subject is required.");
      return;
    }
    if (!stripHtml(body)) {
      setError("Email body is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: effectiveId,
          toEmail: trimmedTo,
          subject: trimmedSubject,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save draft");
      setSavedAt(formatSavedAt(data.savedAt ?? new Date().toISOString()));
      showToast("Draft saved");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  }, [effectiveId, emailBody, showToast, subject, toEmail]);

  useEffect(() => {
    if (!effectiveId) {
      initializedCustomerIdRef.current = null;
      return;
    }

    const currentCustomer = customers.find((c) => c.id === effectiveId);
    if (!currentCustomer) return;

    if (initializedCustomerIdRef.current === effectiveId) return;
    initializedCustomerIdRef.current = effectiveId;

    let cancelled = false;

    const initCustomerEmail = async () => {
      setLoadingDraft(true);
      setSent(false);
      setError("");
      setSavedAt(null);
      setToEmail(currentCustomer.email ?? "");
      setSubject("");
      setEditorHtml("");

      try {
        const res = await fetch(
          `/api/outreach/draft?customerId=${encodeURIComponent(effectiveId)}`,
        );
        const data = await res.json();

        if (cancelled) return;

        if (res.ok && data.draft) {
          applyDraft({
            toEmail: data.draft.toEmail ?? currentCustomer.email ?? "",
            subject: data.draft.subject ?? "",
            body: data.draft.body ?? "",
            savedAt: data.draft.savedAt,
          });
          return;
        }

        await generateEmailRef.current(effectiveId);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load draft");
        }
      } finally {
        if (!cancelled) setLoadingDraft(false);
      }
    };

    void initCustomerEmail();

    return () => {
      cancelled = true;
    };
  }, [applyDraft, customers, effectiveId, setEditorHtml]);

  const sendEmail = async () => {
    if (!effectiveId) return;
    const body = bodyEditorRef.current?.getContent() ?? emailBody;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: effectiveId, subject, body, toEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const editorBusy = loadingDraft || generating;

  if (!effectiveId) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center h-[calc(100vh-120px)] lg:h-[800px]">
        <div className="text-center p-12">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Select a Customer First</h3>
          <p className="text-sm text-gray-500">Go to Risk Analysis, select a high-risk customer, then click &quot;Outreach →&quot; to draft a retention email.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[100] rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-lg"
        >
          {toast}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[calc(100vh-120px)] lg:h-[800px]">
      <div className="px-6 py-5 border-b border-gray-100 bg-[#fafbfe] rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-4 items-start">
          <div className="text-blue-600 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-0.5">AI-Drafted Retention Email</h2>
            <p className="text-xs text-gray-500">Personalized for {customer?.name ?? "selected customer"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              void generateEmail();
            }}
            disabled={editorBusy || saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {generating ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            {generating ? "Generating…" : "Regenerate"}
          </button>

          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            disabled={editorBusy || saving}
            className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none disabled:opacity-50"
          >
            <option value="professional">Tone: Professional</option>
            <option value="friendly">Tone: Friendly</option>
            <option value="urgent">Tone: Urgent</option>
            <option value="discount">Tone: Discount Offer</option>
            <option value="event">Tone: Event-Based</option>
          </select>
        </div>
      </div>

      {tone === "event" && (
        <div className="px-6 py-3 border-b border-gray-100 bg-amber-50/50">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-amber-800 mb-1.5">
            Event Name
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full text-sm text-gray-900 bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none"
            placeholder="e.g., National Day, Mother's Day"
          />
          <p className="mt-1.5 text-[11px] text-amber-900/80">
            We will use this event as context while keeping the email focused on re-engaging the customer.
          </p>
        </div>
      )}

      {error && <div className="px-6 py-2 bg-red-50 text-xs text-red-600 font-medium">{error}</div>}
      {sent && <div className="px-6 py-2 bg-emerald-50 text-xs text-emerald-700 font-medium">Email sent successfully!</div>}

      <div className="border-b border-gray-100 flex flex-col">
        <div className="flex items-center border-b border-gray-50 px-6 py-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">To</span>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            disabled={editorBusy}
            className="flex-1 text-sm text-gray-900 focus:outline-none bg-transparent font-medium disabled:opacity-60"
            placeholder="customer@example.com"
          />
        </div>
        <div className="flex items-center px-6 py-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={editorBusy}
            className="flex-1 text-sm text-gray-900 focus:outline-none bg-transparent font-medium disabled:opacity-60"
            placeholder="Email subject…"
          />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto relative">
        {editorBusy && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-600">
                {loadingDraft ? "Loading saved draft…" : "Generating personalized email…"}
              </p>
            </div>
          </div>
        )}

        {!stripHtml(emailBody) && !editorBusy && (
          <div className="absolute left-9 top-[4.75rem] text-sm text-gray-400 pointer-events-none z-[1]">
            Click Regenerate to generate a personalized retention email...
          </div>
        )}

        <EmailBodyEditor
          ref={bodyEditorRef}
          onChange={setEmailBody}
          editable={!editorBusy}
        />
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {savedAt ? `Draft saved at ${savedAt}` : "No draft saved yet"}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {onViewDrafts && (
            <button
              type="button"
              onClick={onViewDrafts}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              View Drafts
            </button>
          )}
          <button
            onClick={() => {
              void saveDraft();
            }}
            disabled={editorBusy || saving || sent || !stripHtml(emailBody)}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={sendEmail}
            disabled={sending || sent || editorBusy || saving || !stripHtml(emailBody)}
            className="px-6 py-2.5 bg-[#1e40af] hover:bg-[#1e3a8a] text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {sent ? "Sent ✓" : sending ? "Sending…" : "Send Email"}
            {!sent && !sending && (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            )}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
