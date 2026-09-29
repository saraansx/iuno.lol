interface YouTubeVideoData {
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

export function cleanYouTubeInput(input: string): string {
  if (!input) return "";
  let s = input.trim();

  s = s.replace(/^https?:\/\/(www\.|m\.)?youtube\.com\//i, "");
  s = s.replace(/^https?:\/\/(www\.)?youtu\.be\//i, "");

  s = s.replace(/[?#].*$/, "");

  s = s.replace(/^\//, "");

  const channelMatch = s.match(/^channel\/(UC[\w-]{22})/i);
  if (channelMatch) return channelMatch[1];

  const cUserMatch = s.match(/^(?:c|user)\/([^/]+)/i);
  if (cUserMatch) return cUserMatch[1].slice(0, 30);

  if (s.startsWith("@")) {
    return "@" + s.slice(1).replace(/\/.*$/, "").slice(0, 30);
  }

  if (/^UC[\w-]{22}$/.test(s)) return s;

  return s.replace(/\/.*$/, "").slice(0, 30);
}

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
