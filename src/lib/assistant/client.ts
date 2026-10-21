import "server-only";
import { SYSTEM_PROMPT } from "@/lib/assistant/knowledge";

const OLLAMA_BASE = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:1.7b";

const REQUEST_TIMEOUT_MS = 45_000;

const OPTIONS = {
  num_ctx: 2048,
  num_predict: 60,
  temperature: 0.3,
  top_p: 0.9,
  repeat_penalty: 1.05,
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type OllamaChunk = {
  message?: { content?: string; thinking?: string };
  done?: boolean;
  error?: string;
};

export function assistantModel(): string {
  return OLLAMA_MODEL;
}

export async function* streamAnswer(
  messages: AssistantMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      think: false,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      options: OPTIONS,
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Ollama responded ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf("\n");
      while (newline >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");

        if (!line) continue;

        let chunk: OllamaChunk;
        try {
          chunk = JSON.parse(line) as OllamaChunk;
        } catch {
          continue;
        }

        if (chunk.error) throw new Error(chunk.error);

        const text = chunk.message?.content;
        if (text) yield text;
        if (chunk.done) return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
