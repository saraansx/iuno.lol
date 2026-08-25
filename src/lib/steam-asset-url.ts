/**
 * Resolves a cached Steam asset path to the URL a browser should load.
 *
 * The Steam user route caches equipped-item assets as CDN-relative paths, and
 * they take one of two routes to the browser:
 *
 *   - Animated assets (.webm/.mp4/.gif) go **straight to Steam's CDN**. These
 *     run 2-5 MB each, so proxying them means streaming the whole file through
 *     this server — paying for the bytes twice (in and back out) and holding a
 *     copy in memory while doing it. Steam's CDN already serves them with
 *     `Access-Control-Allow-Origin: *`, honours Range requests so `<video>` can
 *     seek, and answers from a Fastly edge, so there is nothing left for a
 *     proxy to add.
 *
 *   - Everything else (avatars, frames, still backgrounds) keeps going through
 *     `/api/widgets/steam/image`, so no visitor IP is handed to Valve. Those
 *     responses are cached at the Cloudflare edge and in the visitor's browser
 *     via their `Cache-Control` header, not on this server's disk.
 *
 * Absolute URLs are passed through untouched so entries cached before paths
 * went relative still resolve.
 */

const STEAM_ITEM_CDN =
  "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/";

/** Extensions Steam only ever ships as multi-megabyte animated assets. */
const DIRECT_FROM_CDN = /\.(webm|mp4|gif)(\?|$)/i;

export function steamAssetUrl(path: string): string {
  if (DIRECT_FROM_CDN.test(path)) {
    return /^https?:\/\//i.test(path) ? path : `${STEAM_ITEM_CDN}${path}`;
  }
  return `/api/widgets/steam/image?url=${encodeURIComponent(path)}`;
}
