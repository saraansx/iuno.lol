export const CATBOX_BASE = "https://files.catbox.moe/";
export const CDN_BASE = "https://cdn.iuno.lol/";

/** Hosts we treat as our own stored media (upload + delete + playback). */
const STORED_MEDIA_HOSTS = new Set(["files.catbox.moe", "cdn.iuno.lol"]);

function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True for Catbox or our CDN URLs (backward compatible with old uploads). */
export function isStoredMediaUrl(url: string | null | undefined): boolean {
  const host = hostnameOf(url);
  return host !== null && STORED_MEDIA_HOSTS.has(host);
}

/** Legacy name — now accepts CDN URLs too. */
export const isCatboxUrl = isStoredMediaUrl;

/** `abc123.png` from a Catbox or CDN URL, or null. */
export function storedFileId(url: string | null | undefined): string | null {
  const host = hostnameOf(url);
  if (!host || !STORED_MEDIA_HOSTS.has(host)) return null;
  try {
    const name = new URL(url as string).pathname.replace(/^\//, "");
    if (!name || name.includes("/") || !/^[A-Za-z0-9._-]+$/.test(name)) return null;
    return name;
  } catch {
    return null;
  }
}

/** Rewrite a Catbox URL to the CDN; leaves CDN/other URLs untouched. */
export function toCdnUrl(url: string): string {
  const id = storedFileId(url);
  if (!id) return url;
  if ((url as string).startsWith(CDN_BASE)) return url;
  return `${CDN_BASE}${id}`;
}
