import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { nerveGet } from "@/lib/nerve";
import {
  type SoundcloudTrackData,
  cleanSoundcloudHandle,
  cleanSoundcloudTrackPath,
  isValidSoundcloudTrackPath,
} from "@/lib/soundcloud";

interface NerveSoundcloudTrack {
  title?: unknown;
  url?: unknown;
  artwork_url?: unknown;
  duration_ms?: unknown;
  genre?: unknown;
  release_date?: unknown;
  plays?: unknown;
  likes?: unknown;
  reposts?: unknown;
  comments?: unknown;
  artist?: {
    username?: unknown;
    url?: unknown;
    avatar_url?: unknown;
    verified?: unknown;
  } | null;
}

function toCount(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
}

function toText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function toHttpsUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.startsWith("https://") && trimmed.length <= 4096 ? trimmed : "";
}

async function fetchFromNerve(path: string): Promise<SoundcloudTrackData | null> {
  const track = await nerveGet<NerveSoundcloudTrack>("/v1/soundcloud/track", {
    url: `https://soundcloud.com/${path}`,
  });
  if (!track || typeof track.title !== "string") return null;

  const artist = track.artist || {};
  const artistUrl = toHttpsUrl(artist.url);
  const releaseDate = toText(track.release_date, 40);

  return {
    path,
    title: toText(track.title, 200),
    url: toHttpsUrl(track.url) || `https://soundcloud.com/${path}`,
    artworkUrl: toHttpsUrl(track.artwork_url) || toHttpsUrl(artist.avatar_url),
    durationMs: toCount(track.duration_ms),
    genre: toText(track.genre, 60),
    releaseDate: releaseDate || null,
    plays: toCount(track.plays),
    likes: toCount(track.likes),
    reposts: toCount(track.reposts),
    comments: toCount(track.comments),
    artistName: toText(artist.username, 120),
    artistHandle: cleanSoundcloudHandle(artistUrl) || path.split("/")[0],
    artistAvatarUrl: toHttpsUrl(artist.avatar_url),
    artistVerified: Boolean(artist.verified),
  };
}

export async function fetchSoundcloudTrackData(
  rawPath: string
): Promise<SoundcloudTrackData | null> {
  const path = cleanSoundcloudTrackPath(rawPath);
  if (!path || !isValidSoundcloudTrackPath(path)) return null;

  return withWidgetCache<SoundcloudTrackData>(
    widgetCacheKey("soundcloud", "track", ...path.split("/")),
    () => fetchFromNerve(path)
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ artist: string; slug: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "soundcloud_track");
    if (limited) return limited;

    const { artist, slug } = await params;
    const path = cleanSoundcloudTrackPath(`${artist}/${slug}`);

    if (!path || !isValidSoundcloudTrackPath(path)) {
      return NextResponse.json({ error: "Invalid SoundCloud track link" }, { status: 400 });
    }

    const data = await fetchSoundcloudTrackData(path);
    if (!data) {
      return NextResponse.json({ error: "SoundCloud track not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[SoundCloud Track API Error]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
