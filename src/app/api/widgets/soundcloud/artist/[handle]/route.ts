import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { nerveGet } from "@/lib/nerve";
import {
  type SoundcloudArtistData,
  cleanSoundcloudHandle,
  isValidSoundcloudHandle,
} from "@/lib/soundcloud";

interface NerveSoundcloudArtist {
  id?: unknown;
  username?: unknown;
  permalink?: unknown;
  url?: unknown;
  avatar_url?: unknown;
  banner_url?: unknown;
  description?: unknown;
  city?: unknown;
  country?: unknown;
  followers?: unknown;
  following?: unknown;
  track_count?: unknown;
  playlist_count?: unknown;
  verified?: unknown;
  pro?: unknown;
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

async function fetchFromNerve(handle: string): Promise<SoundcloudArtistData | null> {
  const artist = await nerveGet<NerveSoundcloudArtist>("/v1/soundcloud/artist", {
    handle,
  });
  if (!artist) return null;

  const resolvedHandle = cleanSoundcloudHandle(
    typeof artist.permalink === "string"
      ? artist.permalink
      : typeof artist.username === "string"
        ? artist.username
        : handle
  );

  return {
    handle: resolvedHandle || handle,
    username: toText(artist.username, 120) || resolvedHandle || handle,
    url: toHttpsUrl(artist.url),
    avatarUrl: toHttpsUrl(artist.avatar_url),
    bannerUrl: toHttpsUrl(artist.banner_url),
    description: toText(artist.description, 2000),
    city: toText(artist.city, 120),
    country: toText(artist.country, 60),
    isVerified: Boolean(artist.verified),
    isPro: Boolean(artist.pro),
    followerCount: toCount(artist.followers),
    followingCount: toCount(artist.following),
    trackCount: toCount(artist.track_count),
    playlistCount: toCount(artist.playlist_count),
  };
}

export async function fetchSoundcloudArtistData(
  rawHandle: string
): Promise<SoundcloudArtistData | null> {
  const handle = cleanSoundcloudHandle(rawHandle);
  if (!handle || !isValidSoundcloudHandle(handle)) return null;

  return withWidgetCache<SoundcloudArtistData>(
    widgetCacheKey("soundcloud", "artist", handle),
    () => fetchFromNerve(handle)
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "soundcloud_artist");
    if (limited) return limited;

    const { handle } = await params;
    const cleanHandle = cleanSoundcloudHandle(handle);

    if (!cleanHandle || !isValidSoundcloudHandle(cleanHandle)) {
      return NextResponse.json({ error: "Invalid SoundCloud handle" }, { status: 400 });
    }

    const data = await fetchSoundcloudArtistData(cleanHandle);
    if (!data) {
      return NextResponse.json({ error: "SoundCloud artist not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[SoundCloud Artist API Error]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
