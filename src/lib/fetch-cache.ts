"use client";

const TTL_MS = 60_000;
const RETRY_DELAY_MS = 800;
const cache = new Map<string, { at: number; res: Promise<Response> }>();

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  try {
    const res = await fetch(url, init);
    if (res.status < 500) return res;
  } catch {
  }
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return fetch(url, init);
}

export function cachedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  if (init.cache === "no-store" || (init.method && init.method !== "GET")) {
    return fetch(url, init);
  }

  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.res.then((r) => r.clone());
  }

  const shared: RequestInit = { ...init };
  delete shared.signal;

  const res = fetchWithRetry(url, shared).then(
    (r) => {
      if (!r.ok) cache.delete(url);
      return r;
    },
    (err) => {
      cache.delete(url);
      throw err;
    },
  );
  cache.set(url, { at: Date.now(), res });
  return res.then((r) => r.clone());
}
