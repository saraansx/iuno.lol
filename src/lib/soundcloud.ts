export interface SoundcloudArtistData {
  handle: string;
  username: string;
  url: string;
  avatarUrl: string;
  bannerUrl: string;
  description: string;
  city: string;
  country: string;
  isVerified: boolean;
  isPro: boolean;
  followerCount: number;
  followingCount: number;
  trackCount: number;
  playlistCount: number;
}

export interface SoundcloudTrackData {
  path: string;
  title: string;
  url: string;
  artworkUrl: string;
  durationMs: number;
  genre: string;
  releaseDate: string | null;
  plays: number;
  likes: number;
  reposts: number;
  comments: number;
  artistName: string;
  artistHandle: string;
  artistAvatarUrl: string;
  artistVerified: boolean;
}

const SOUNDCLOUD_HOST_RE = /^https?:\/\/(?:www\.|m\.)?soundcloud\.com\//i;
const TRACK_PATH_RE = /^[a-zA-Z0-9_-]{2,64}\/[a-zA-Z0-9_-]{1,200}$/;
const RESERVED_SECOND_SEGMENTS = new Set(["sets", "tracks", "albums", "likes", "reposts", "followers", "following", "popular-tracks"]);

/** Normalizes a SoundCloud track link into "artist/track-slug". */
export function cleanSoundcloudTrackPath(input: string): string {
  if (!input) return "";
  const parts = input
    .trim()
    .replace(SOUNDCLOUD_HOST_RE, "")
    .replace(/^\/+/, "")
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean);
  if (parts.length < 2) return "";
  return `${parts[0]}/${parts[1]}`.slice(0, 265);
}

export function isValidSoundcloudTrackPath(input: string): boolean {
  if (!TRACK_PATH_RE.test(input)) return false;
  const second = input.split("/")[1]?.toLowerCase();
  return Boolean(second) && !RESERVED_SECOND_SEGMENTS.has(second);
}

export function formatSoundcloudDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const total = Math.round(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export function cleanSoundcloudHandle(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .replace(SOUNDCLOUD_HOST_RE, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim()
    .slice(0, 64);
}

export function isValidSoundcloudHandle(input: string): boolean {
  return /^[a-zA-Z0-9_-]{2,64}$/.test(input);
}

export function formatSoundcloudNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return "0";
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
  return String(Math.round(num));
}
