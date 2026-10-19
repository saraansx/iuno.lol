const NERVE_BASE = (process.env.NERVE_API_BASE || "https://api.nerve.wtf").replace(/\/+$/, "");
const NERVE_TIMEOUT_MS = 15_000;

interface NerveEnvelope<T> {
  success?: boolean;
  data?: T | null;
  error?: string | null;
}

export function nerveConfigured(): boolean {
  return Boolean(process.env.NERVE_API_KEY);
}

export async function nerveGet<T>(
  path: string,
  query: Record<string, string | number> = {}
): Promise<T | null> {
  const apiKey = process.env.NERVE_API_KEY;
  if (!apiKey) {
    console.warn("[nerve] NERVE_API_KEY is not configured");
    return null;
  }

  const url = new URL(`${NERVE_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, String(value));
  }

  try {
    const res = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(NERVE_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[nerve] ${path} responded with ${res.status}`);
      return null;
    }

    const json = (await res.json()) as NerveEnvelope<T>;
    if (!json || json.success === false) {
      if (json?.error) console.warn(`[nerve] ${path} error: ${json.error}`);
      return null;
    }

    return (json.data ?? null) as T | null;
  } catch (err) {
    console.warn(`[nerve] ${path} request failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}
