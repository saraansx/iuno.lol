import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getClientIp } from '@/lib/server/security/ip';
import { checkRateLimit, ipBucket } from '@/lib/rate-limit';
import { readWidgetCache, writeWidgetCache } from '@/lib/widget-cache';
import { streamAnswer, type AssistantMessage } from '@/lib/assistant/client';
import { MAX_HISTORY_MESSAGES, MAX_QUESTION_CHARS } from '@/lib/assistant/knowledge';

export const dynamic = 'force-dynamic';

const RATE_WINDOW_SECONDS = 60;
const RATE_MAX_PER_IP = 20;
const ANSWER_CACHE_TTL_SECONDS = 60 * 60 * 24;

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Accel-Buffering': 'no',
} as const;

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

function parseMessages(body: unknown): IncomingMessage[] | null {
  if (!body || typeof body !== 'object') return null;

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const cleaned: IncomingMessage[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return null;
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') return null;
    if (typeof content !== 'string') return null;

    const text = content.trim();
    if (!text || text.length > MAX_QUESTION_CHARS) return null;
    cleaned.push({ role, content: text });
  }

  const last = cleaned[cleaned.length - 1];
  if (!last || last.role !== 'user') return null;

  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

function answerCacheKey(text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  return `assistant:ans:${createHash('sha256').update(normalized).digest('hex').slice(0, 32)}`;
}

function plainResponse(text: string, status = 200): NextResponse {
  return new NextResponse(text, { status, headers: STREAM_HEADERS });
}

function toStream(chunks: AsyncIterable<string>, onComplete?: (full: string) => void): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = '';

      try {
        for await (const chunk of chunks) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error('[assistant] stream failed:', error);
        controller.enqueue(
          encoder.encode(full ? '' : "Something went wrong on my side. Try again in a moment."),
        );
      } finally {
        controller.close();
        if (full) {
          try {
            onComplete?.(full);
          } catch (error) {
            console.error('[assistant] cache write failed:', error);
          }
        }
      }
    },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return plainResponse('Invalid request body.', 400);
  }

  const messages = parseMessages(body);
  if (!messages) {
    return plainResponse(`Send at most ${MAX_HISTORY_MESSAGES} messages of up to ${MAX_QUESTION_CHARS} characters each.`, 400);
  }

  const ip = getClientIp(request.headers);
  const bucket = ipBucket('assistant', ip, RATE_MAX_PER_IP);
  const limit = await checkRateLimit(bucket.key, bucket.max, RATE_WINDOW_SECONDS);
  if (!limit.ok) {
    return new NextResponse('Too many questions. Give it a minute.', {
      status: 429,
      headers: { ...STREAM_HEADERS, 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  const cacheKey = messages.length === 1 ? answerCacheKey(messages[0].content) : null;
  if (cacheKey) {
    const cached = await readWidgetCache<string>(cacheKey);
    if (cached) {
      return plainResponse(cached);
    }
  }

  try {
    const stream = toStream(streamAnswer(messages as AssistantMessage[], request.signal), (full) => {
      if (cacheKey) {
        void writeWidgetCache(cacheKey, full, ANSWER_CACHE_TTL_SECONDS);
      }
    });

    return new NextResponse(stream, { headers: STREAM_HEADERS });
  } catch (error) {
    console.error('[assistant] request failed:', error);
    return plainResponse("The assistant is offline right now. Try again later.", 503);
  }
}
