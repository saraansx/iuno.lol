"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle, X } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "What is iuno.lol?",
  "Is it free?",
  "What does Premium unlock?",
  "Which widgets are there?",
];

const HIDDEN_PREFIXES = ["/dashboard", "/assistant"];
const MAX_INPUT_CHARS = 300;

function newId(): string {
  return Math.random().toString(36).slice(2);
}

export default function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stop();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stop]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;

      setError(null);
      setInput("");

      const history = [...messages, { id: newId(), role: "user" as const, content: text }];
      const reply: ChatMessage = { id: newId(), role: "assistant", content: "" };
      setMessages([...history, reply]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.slice(-4).map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok || !response.body) {
          const detail = (await response.text().catch(() => "")).trim();
          throw new Error(detail || `Request failed (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });

          const snapshot = answer;
          setMessages((current) =>
            current.map((message) => (message.id === reply.id ? { ...message, content: snapshot } : message)),
          );
        }

        if (!answer.trim()) {
          setMessages((current) =>
            current.map((message) =>
              message.id === reply.id ? { ...message, content: "I didn't get an answer for that. Try rephrasing?" } : message,
            ),
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("[assistant] failed:", err);
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setMessages((current) => current.filter((message) => message.id !== reply.id));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
      }
    },
    [busy, messages],
  );

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  if (hidden) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask about iuno.lol"
          className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-[#5b6cf5] text-white shadow-[0_8px_30px_rgba(91,108,245,0.45)] transition hover:bg-[#6c7bff] active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="iuno.lol assistant"
          className="fixed bottom-4 right-4 z-50 flex h-[min(70vh,520px)] w-[min(92vw,370px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d]/95 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#5b6cf5]/20 text-[#9aa2f2]">
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] text-white/90">iuno assistant</p>
                <p className="text-[10px] text-white/35">answers about iuno.lol only</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stop();
                setOpen(false);
              }}
              aria-label="Close assistant"
              className="grid h-7 w-7 place-items-center rounded-full text-white/50 transition hover:bg-white/8 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-[12px] leading-relaxed text-white/45">
                  Ask me anything about iuno.lol — features, pricing, widgets, music.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void ask(suggestion)}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/65 transition hover:border-[#5b6cf5]/40 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#5b6cf5]/25 px-3 py-2 text-[12.5px] leading-relaxed text-white/90"
                    : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-white/6 px-3 py-2 text-[12.5px] leading-relaxed text-white/80"
                }
              >
                {message.content || (busy ? <span className="text-white/40">thinking…</span> : "")}
              </div>
            ))}

            {error && <p className="text-[11px] leading-relaxed text-red-400/80">{error}</p>}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/8 px-3 py-2.5">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_CHARS))}
              placeholder="Ask about iuno.lol…"
              aria-label="Your question"
              className="min-w-0 flex-1 bg-transparent text-[12.5px] text-white/90 outline-none placeholder:text-white/25"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send question"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#5b6cf5] text-white transition enabled:hover:bg-[#6c7bff] disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
