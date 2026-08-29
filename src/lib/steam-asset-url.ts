
const STEAM_ITEM_CDN =
  "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/";

const DIRECT_FROM_CDN = /\.(webm|mp4|gif)(\?|$)/i;

export function steamAssetUrl(path: string): string {
  if (DIRECT_FROM_CDN.test(path)) {
    return /^https?:\/\//i.test(path) ? path : `${STEAM_ITEM_CDN}${path}`;
  }
  return `/api/widgets/steam/image?url=${encodeURIComponent(path)}`;
}
