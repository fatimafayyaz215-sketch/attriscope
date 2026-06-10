"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ADVISOR_WELCOME_EXAMPLE,
  getAdvisorQuickPrompts,
  getAdvisorWelcomeTopics,
  resolveAdvisorWeights,
  SIGNAL_LABELS,
} from "@/lib/advisor-prompts";
import { ADVISOR_INDUSTRY_CHANGED } from "@/lib/advisor-events";
import type { Industry } from "@/lib/industry";
import type { ScoringWeights } from "@/lib/scoring";
import { useAdvisorChat } from "@/components/layout/advisor-chat-context";
import AdvisorMessageBody from "@/components/layout/AdvisorMessageBody";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "gemini" | "rules" | "fallback";
};

type AdvisorContext = {
  industry: string;
  industryLabel: string;
  weights?: ScoringWeights;
  metrics: {
    totalCustomers: number;
    churnCustomers?: number;
    highRiskCustomers?: number;
    revenueAtRiskMrr: number;
  };
};

function churnCount(metrics: AdvisorContext["metrics"]) {
  return metrics.churnCustomers ?? metrics.highRiskCustomers ?? 0;
}

function buildWelcome(ctx: AdvisorContext): ChatMessage {
  const { metrics, industryLabel, industry, weights } = ctx;
  const industryKey = (industry || "saas").toLowerCase() as Industry;
  const resolvedWeights = weights ?? resolveAdvisorWeights(industryKey);
  const topics = getAdvisorWelcomeTopics(industryKey, resolvedWeights);
  const example =
    ADVISOR_WELCOME_EXAMPLE[industryKey] || ADVISOR_WELCOME_EXAMPLE.saas;
  const topSignal = (
    [
      ["inactivity", resolvedWeights.inactivity],
      ["usage", resolvedWeights.usage],
      ["support", resolvedWeights.support],
      ["payment", resolvedWeights.payment],
    ] as const
  ).sort((a, b) => b[1] - a[1])[0];

  return {
    id: "welcome",
    role: "assistant",
    content: `Hi — I'm your ${industryLabel} churn advisor. You have ${churnCount(metrics)} high-risk accounts of ${metrics.totalCustomers} tracked.

Your top weighted signal is **${SIGNAL_LABELS[topSignal[0]]}** at **${topSignal[1]}%**. Ask about ${topics}.

Tap a suggestion below or type your own question — ${example}.`,
    source: "gemini",
  };
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function contextFingerprint(ctx: AdvisorContext) {
  const m = ctx.metrics;
  const w = ctx.weights ?? resolveAdvisorWeights((ctx.industry || "saas") as Industry);
  return `${ctx.industry}|${w.inactivity}|${w.usage}|${w.support}|${w.payment}|${m.totalCustomers}|${churnCount(m)}`;
}

function buildSyncNotice(ctx: AdvisorContext): ChatMessage {
  return {
    id: `sync-${contextFingerprint(ctx)}`,
    role: "assistant",
    content: `Synced — ${churnCount(ctx.metrics)} predicted churn of ${ctx.metrics.totalCustomers} customers (${ctx.industryLabel}).`,
    source: "gemini",
  };
}

function isContextMessage(m: ChatMessage) {
  return m.id === "welcome" || m.id.startsWith("sync-");
}

/** Left docked advisor panel (opens beside nav sidebar). */
export default function AdvisorChatPanel() {
  const pathname = usePathname();
  const { open, setOpen, maximized, setMaximized } = useAdvisorChat();
  const [context, setContext] = useState<AdvisorContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const fingerprintRef = useRef("");
  const contextRef = useRef<AdvisorContext | null>(null);

  const industryKey = (context?.industry || "saas").toLowerCase() as Industry;
  const advisorWeights =
    context?.weights ?? resolveAdvisorWeights(industryKey);
  const quickPrompts = getAdvisorQuickPrompts(
    industryKey,
    advisorWeights,
    context
      ? {
          totalCustomers: context.metrics.totalCustomers,
          highRiskCustomers: churnCount(context.metrics),
        }
      : undefined,
  );
  const showSuggestions = !messages.some((m) => m.role === "user");

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const applyContext = useCallback((data: AdvisorContext, mode: "fresh" | "update") => {
    const fp = contextFingerprint(data);
    const prevFp = fingerprintRef.current;
    const prevIndustry = contextRef.current?.industry;
    const industryChanged =
      Boolean(prevIndustry) && prevIndustry !== data.industry;

    fingerprintRef.current = fp;
    contextRef.current = data;
    setContext(data);
    setSyncedAt(new Date());

    if (mode === "fresh" || industryChanged || messagesRef.current.length === 0) {
      setMessages([buildWelcome(data)]);
      return;
    }

    if (fp !== prevFp) {
      setMessages((prev) => {
        const hasUser = prev.some((m) => m.role === "user");
        if (!hasUser) return [buildWelcome(data)];
        const withoutOldSync = prev.filter((m) => !m.id.startsWith("sync-"));
        return [...withoutOldSync, buildSyncNotice(data)];
      });
    }
  }, []);

  const syncContext = useCallback(
    async (mode: "fresh" | "update" = "update") => {
      setSyncing(true);
      setError(null);
      try {
        const res = await fetch("/api/advisor/context", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = (await res.json().catch(() => null)) as AdvisorContext | null;
        if (!res.ok || !data?.industry) {
          setError("Could not sync advisor data.");
          return false;
        }
        applyContext(data, mode);
        return true;
      } catch {
        setError("Network error while syncing.");
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [applyContext],
  );

  useEffect(() => {
    if (!open) return;
    void syncContext(messagesRef.current.length === 0 ? "fresh" : "update");
    const t = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(t);
  }, [open, syncContext]);

  useEffect(() => {
    if (!open) return;
    void syncContext("update");
  }, [pathname, open, syncContext]);

  useEffect(() => {
    const onIndustryChanged = () => {
      fingerprintRef.current = "";
      contextRef.current = null;
      void syncContext("fresh");
    };
    window.addEventListener(ADVISOR_INDUSTRY_CHANGED, onIndustryChanged);
    return () => window.removeEventListener(ADVISOR_INDUSTRY_CHANGED, onIndustryChanged);
  }, [syncContext]);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (maximized) setMaximized(false);
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, maximized, setOpen, setMaximized]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || syncing) return;

    await syncContext("update");

    setError(null);
    setInput("");

    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const history = messagesRef.current
      .filter((m) => !isContextMessage(m))
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/app-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({ question: trimmed, history }),
        cache: "no-store",
      });

      const data = (await res.json().catch(() => null)) as {
        answer?: string;
        source?: "gemini" | "rules";
        error?: string;
      } | null;

      if (!res.ok || !data?.answer) {
        setError(data?.error || "Advisor request failed.");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: data.answer!,
          source: data.source ?? "gemini",
        },
      ]);
    } catch {
      setError("Network error. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const clearChat = async () => {
    setError(null);
    const ok = await syncContext("fresh");
    if (!ok && context) setMessages([buildWelcome(context)]);
  };

  if (!open) return null;

  const panelShell = maximized
    ? "fixed z-[100] inset-0 lg:inset-y-0 lg:left-64 lg:right-0 flex flex-col bg-white"
    : [
        "fixed z-[90] flex flex-col bg-white border-r border-gray-200 shadow-xl",
        "top-0 left-0 w-full max-w-full h-dvh pt-[env(safe-area-inset-top)]",
        "lg:top-16 lg:left-64 lg:w-[min(24rem,calc(100vw-16rem-2rem))] lg:h-[calc(100dvh-4rem)] lg:pt-0",
        "max-lg:pb-[env(safe-area-inset-bottom)]",
      ].join(" ");

  return (
    <>
      {!maximized ? (
        <button
          type="button"
          aria-label="Close assistant"
          className="fixed inset-0 z-[80] bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {maximized ? (
        <button
          type="button"
          aria-label="Exit maximized view"
          className="hidden lg:block fixed inset-0 z-[99] bg-black/20"
          onClick={() => setMaximized(false)}
        />
      ) : null}

      <div
        id="churn-advisor-panel"
        className={panelShell}
        role="dialog"
        aria-label="Churn Advisor chat"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-[#0a235c] text-white">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">Churn Advisor</p>
            <p className="text-[10px] text-blue-100 truncate">
              {syncing
                ? "Syncing…"
                : context
                  ? `${context.industryLabel} · ${churnCount(context.metrics)} churn`
                  : "Loading…"}
              {syncedAt && !syncing
                ? ` · ${syncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setMaximized(!maximized)}
              className="p-1.5 rounded-lg hover:bg-white/10 hidden sm:block"
              title={maximized ? "Dock panel" : "Expand"}
              aria-label={maximized ? "Dock panel" : "Expand"}
            >
              {maximized ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5H4.5M9 9H4.5M15 15v4.5h4.5M15 15h4.5"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => void syncContext("fresh")}
              disabled={syncing || loading}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-50"
              title="Refresh metrics"
            >
              <svg
                className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setMaximized(false);
                setOpen(false);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2 bg-gray-50/50"
        >
          {syncing && messages.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">Syncing your workspace…</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "text-xs leading-relaxed rounded-xl px-3 py-2.5 break-words max-w-[92%]",
                  m.role === "user"
                    ? "bg-blue-700 text-white ml-auto whitespace-pre-wrap"
                    : "bg-white text-gray-800 border border-gray-200 shadow-sm",
                ].join(" ")}
              >
                {m.role === "assistant" ? <AdvisorMessageBody content={m.content} /> : m.content}
              </div>
            ))
          )}
          {loading ? (
            <div className="text-xs text-gray-500 px-2 py-1 animate-pulse">Thinking…</div>
          ) : null}
        </div>

        {error ? (
          <p className="shrink-0 text-[11px] text-amber-800 bg-amber-50 border-t border-amber-100 px-3 py-2 break-words max-h-20 overflow-y-auto">
            {error}
          </p>
        ) : null}

        {showSuggestions ? (
          <div className="shrink-0 px-3 pt-2 pb-1 border-t border-gray-100 bg-white max-h-[30vh] overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              {context?.industryLabel || "Industry"} · weights {advisorWeights.inactivity}/{advisorWeights.usage}/{advisorWeights.support}/{advisorWeights.payment}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading || syncing}
                  onClick={() => void sendMessage(q)}
                  title={q}
                  className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 disabled:opacity-50 text-left"
                >
                  {q.length > 36 ? `${q.slice(0, 34)}…` : q}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 p-3 pt-2 bg-white border-t border-gray-100 flex flex-col gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            rows={2}
            disabled={loading || syncing}
            placeholder={`Ask a ${context?.industryLabel || "churn"} question…`}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-gray-50"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void clearChat()}
              disabled={loading || syncing}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || syncing || !input.trim()}
              className="px-4 py-2 bg-[#0a235c] hover:bg-[#071944] disabled:bg-gray-300 text-white text-xs font-bold rounded-lg"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
