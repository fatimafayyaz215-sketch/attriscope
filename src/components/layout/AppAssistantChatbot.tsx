"use client";

import { FormEvent, ReactNode, useMemo, useRef, useState } from "react";
import { useChurnStore } from "@/store/churn-store";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "How does churn prediction formula work?",
  "How do I upload CSV and map columns?",
  "How do I generate outreach emails?",
];

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(<span key={`txt-${key++}`}>{text.slice(lastIndex, start)}</span>);
    }

    if (token.startsWith("***") && token.endsWith("***")) {
      nodes.push(
        <strong key={`tok-${key++}`}>
          <em>{token.slice(3, -3)}</em>
        </strong>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`tok-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`tok-${key++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code key={`tok-${key++}`} className="px-1 py-0.5 rounded bg-gray-100 text-gray-900 text-[12px]">
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`txt-${key++}`}>{text.slice(lastIndex)}</span>);
  }

  return nodes;
}

function renderAssistantContent(content: string) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    const bulletMatch = /^[-*]\s+(.+)/.exec(line);
    const orderedMatch = /^(\d+)\.\s+(.+)/.exec(line);

    if (bulletMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const m = /^[-*]\s+(.+)/.exec(l);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1">
          {items.map((item, idx) => (
            <li key={`uli-${idx}`}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (orderedMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        const m = /^\d+\.\s+(.+)/.exec(l);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-1">
          {items.map((item, idx) => (
            <li key={`oli-${idx}`}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInline(line)}
      </p>,
    );
    i += 1;
  }

  return <div className="space-y-2">{blocks}</div>;
}

export default function AppAssistantChatbot() {
  const { assistantOpen, setAssistantOpen } = useChurnStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I am your ChurnGuard assistant. Ask me anything about app features, scoring formula, settings, CSV import, risk analysis, or outreach workflow.",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const history = useMemo(() => messages.slice(-8), [messages]);

  const askAssistant = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setError("");
    setSending(true);

    const updatedMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(updatedMessages);
    setInput("");

    try {
      const res = await fetch("/api/app-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Assistant request failed");

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "No answer returned." }]);
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Assistant request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not answer right now. Please try again. I can still help with formula explanation, settings, upload workflow, and outreach steps.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await askAssistant(input);
  };

  return (
    <>
      {/* Chatbot panel */}
      {assistantOpen && (
        <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 w-[min(92vw,420px)] h-[min(72vh,620px)] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/50 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">App Assistant</p>
              <h3 className="text-sm font-bold text-gray-900">ChurnGuard Help Chat</h3>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="text-gray-500 hover:text-gray-800 text-sm font-bold"
              aria-label="Close assistant"
            >
              Close
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/40">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-white border border-gray-200 text-gray-800"
                      : "ml-auto bg-blue-700 text-white whitespace-pre-wrap"
                  }`}
                >
                  {m.role === "assistant" ? renderAssistantContent(m.content) : m.content}
                </div>
              ))}
              {sending && (
                <div className="max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm bg-white border border-gray-200 text-gray-500">
                  Thinking...
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pt-3 pb-2 border-t border-gray-100 bg-white">
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => askAssistant(q)}
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  {q}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about app functionality..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-3.5 py-2 text-sm font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60"
              >
                Send
              </button>
            </form>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      )}

      {/* Mobile-only floating action button (sidebar is hidden on mobile) */}
      <button
        type="button"
        onClick={() => setAssistantOpen(!assistantOpen)}
        className="lg:hidden fixed right-4 bottom-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-lg"
        aria-label="Ask Assistant"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z"
          />
        </svg>
        {assistantOpen ? "Hide" : "Ask Assistant"}
      </button>
    </>
  );
}
