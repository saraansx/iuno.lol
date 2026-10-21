"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

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

const MAX_INPUT_CHARS = 300;

function newId(): string {
  return Math.random().toString(36).slice(2);
}

interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AssistantDialog({ open, onClose }: AssistantDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stop();
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose, stop]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close assistant"
        onClick={() => {
          stop();
          onClose();
        }}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-label="Ask iuno AI"
        className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f11] shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void ask(input);
          }}
          className="flex items-center gap-3 border-b border-white/8 px-4 py-3"
        >
          <Search className="h-4 w-4 shrink-0 text-white/25" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_CHARS))}
            placeholder="Ask iuno AI…"
            aria-label="Ask iuno AI"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white/85 outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => {
              stop();
              onClose();
            }}
            className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white/30 transition hover:text-white/70"
          >
            esc
          </button>
        </form>

        <div ref={scrollRef} aria-live="polite" className="max-h-[46vh] overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-1">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void ask(suggestion)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-[12.5px] text-white/40 transition hover:bg-white/[0.04] hover:text-white/80"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) =>
                message.role === "user" ? (
                  <p
                    key={message.id}
                    className="ml-auto w-fit max-w-[85%] rounded-lg bg-white/6 px-2.5 py-1.5 text-[12.5px] leading-relaxed text-white/80"
                  >
                    {message.content}
                  </p>
                ) : (
                  <p key={message.id} className="text-[12.5px] leading-relaxed text-white/65">
                    {message.content || (busy ? <span className="text-white/25">…</span> : "")}
                  </p>
                ),
              )}
              {error && <p className="text-[11px] leading-relaxed text-white/35">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/8 px-4 py-2">
          <p className="text-[10px] text-white/25">answers about iuno.lol only</p>
          <p className="text-[10px] text-white/20">
            <span className="rounded border border-white/10 px-1.5 py-0.5">ctrl</span>
            <span className="mx-0.5">+</span>
            <span className="rounded border border-white/10 px-1.5 py-0.5">K</span>
          </p>
        </div>
      </div>
    </div>
  );
}
