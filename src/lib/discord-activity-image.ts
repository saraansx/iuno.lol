/**
 * Resolves a Discord activity asset URL to one the browser is allowed to load.
 *
 * Rich-presence assets are not confined to Discord's own CDN: an activity's
 * `large_image` / `small_image` is whatever the app author picked, and Discord
 * hands external ones over as plain URLs on the author's host — the VS Code
 * presence extension, for one, serves its icons from raw.githubusercontent.com.
 * The `img-src` allow-list in the CSP (`src/proxy.ts`) cannot enumerate those
 * hosts, so the browser blocks them and the widget renders a broken image.
 *
 * Hosts already on that allow-list load directly, which keeps the common cases
 * (game art on Discord's CDN, Spotify album art) off our servers entirely.
 * Anything else is routed through the same-origin image proxy, which `img-src
 * 'self'` always permits.
 */

/**
 * Activity asset hosts that load straight from the CDN.
 *
 * Every entry here must also appear in the `img-src` directive in
 * `src/proxy.ts` — a host listed here but not there goes back to being blocked.
 */
const DIRECT_IMAGE_HOSTS = new Set([
  "cdn.discordapp.com",
  "media.discordapp.net",
  "i.scdn.co",
]);

export function discordActivityImageUrl(url?: string | null): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Not an absolute URL — nothing safe to render.
    return null;
  }

  // The proxy refuses anything but https, so reject it here too rather than
  // handing the browser a request that can only 400.
  if (parsed.protocol !== "https:") return null;

  if (DIRECT_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) return url;

  return `/api/widgets/discord/image?url=${encodeURIComponent(url)}`;
}
