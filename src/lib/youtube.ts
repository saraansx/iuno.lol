export interface YouTubeVideoData {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

export interface YouTubeWidgetData {
  channelId: string;
  title: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  video?: YouTubeVideoData;
}

/**
 * Normalizes any YouTube channel reference to a compact token the data route
 * can resolve: a `UC…` channel id, an `@handle`, or a bare handle/username.
 *
 * Accepts raw handles/ids as well as the common URL shapes:
 *   youtube.com/@handle, youtube.com/channel/UC…, youtube.com/c/Name,
 *   youtube.com/user/Name, youtu.be/…, and m.youtube.com/…
 */
export function cleanYouTubeInput(input: string): string {
  if (!input) return "";
  let s = input.trim();

  // Strip protocol + known YouTube hosts, leaving just the path.
  s = s.replace(/^https?:\/\/(www\.|m\.)?youtube\.com\//i, "");
  s = s.replace(/^https?:\/\/(www\.)?youtu\.be\//i, "");

  // Drop any query string or hash.
  s = s.replace(/[?#].*$/, "");

  // Drop a single leading slash left over from a path.
  s = s.replace(/^\//, "");

  // /channel/UC… → the raw channel id.
  const channelMatch = s.match(/^channel\/(UC[\w-]{22})/i);
  if (channelMatch) return channelMatch[1];

  // /c/Name or /user/Name → the legacy custom name.
  const cUserMatch = s.match(/^(?:c|user)\/([^/]+)/i);
  if (cUserMatch) return cUserMatch[1].slice(0, 30);

  // @handle (with or without the leading slash already removed).
  if (s.startsWith("@")) {
    return "@" + s.slice(1).replace(/\/.*$/, "").slice(0, 30);
  }

  // Bare channel id.
  if (/^UC[\w-]{22}$/.test(s)) return s;

  // Otherwise treat it as a handle/username token.
  return s.replace(/\/.*$/, "").slice(0, 30);
}

/** Compact K/M/B formatting for large counts (mirrors the TikTok widget). */
export function formatYouTubeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}B`;
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${val.toFixed(val >= 10 ? 0 : 1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

/** Compact relative label for a video's publish date, e.g. "3d ago". */
export function formatUploadDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const day = 86_400_000;
  const diffDays = Math.floor(diffMs / day);

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
