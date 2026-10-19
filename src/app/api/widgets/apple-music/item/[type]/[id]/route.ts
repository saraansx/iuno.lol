import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import { readBoundedText } from "@/lib/bounded-html";
import {
  type AppleMusicItemData,
  type AppleMusicItemType,
  isValidAppleMusicId,
} from "@/lib/apple-music";

const LOOKUP_URL = "https://itunes.apple.com/lookup";

const CRAWLER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

interface ITunesResult {
  wrapperType?: string;
  artistName?: string;
  artistId?: number;
  artistLinkUrl?: string;
  collectionId?: number;
  collectionName?: string;
  trackId?: number;
  trackName?: string;
  trackNumber?: number;
  trackCount?: number;
  primaryGenreName?: string;
  releaseDate?: string;
  artworkUrl100?: string;
  collectionViewUrl?: string;
  trackViewUrl?: string;
}

const APPLE_MUSIC_TYPES: AppleMusicItemType[] = ["track", "album", "artist"];

function upscaleArtwork(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const scaled = url.replace(/\/\d+x\d+[a-z]*\.(jpg|jpeg|png|webp)$/i, "/600x600bb.$1");
  return scaled.startsWith("https://") ? scaled : null;
}

function releaseYear(value: string | undefined): string | null {
  if (!value) return null;
  const year = value.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}

async function fetchArtistArtwork(artistPageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(artistPageUrl, {
      headers: CRAWLER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      return null;
    }

    const html = await readBoundedText(res);
    if (!html) return null;

    const match = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i.exec(html);
    const url = match?.[1]?.replace(/&amp;/g, "&").trim();
    return url && url.startsWith("https://") ? url : null;
  } catch (err) {
    console.warn(
      "[Apple Music] Artist artwork lookup failed:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

async function lookupOnce(id: string, country: string): Promise<ITunesResult | null> {
  const res = await fetch(
    `${LOOKUP_URL}?id=${encodeURIComponent(id)}&country=${country}&limit=1`,
    {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    await res.body?.cancel().catch(() => {});
    return null;
  }

  const json = (await res.json()) as { results?: ITunesResult[] };
  const result = Array.isArray(json.results) ? json.results[0] : null;
  return result || null;
}

async function lookup(id: string): Promise<ITunesResult | null> {
  const countries = ["us", "in"];

  for (const country of countries) {
    try {
      const result = await lookupOnce(id, country);
      if (result) return result;
    } catch (err) {
      console.warn(
        "[Apple Music] Lookup failed:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return null;
}

export async function fetchAppleMusicItem(
  type: AppleMusicItemType,
  id: string
): Promise<AppleMusicItemData | null> {
  const result = await lookup(id);
  if (!result) return null;

  const wrapper = result.wrapperType;

  if (type === "artist" && wrapper !== "artist") return null;
  if (type === "album" && wrapper !== "collection") return null;
  if (type === "track" && wrapper !== "track") return null;

  if (type === "artist") {
    const artistName = result.artistName || "";
    const externalUrl = (result.artistLinkUrl || "").replace(/\?uo=\d+$/, "") ||
      `https://music.apple.com/us/artist/${encodeURIComponent(artistName)}/${id}`;

    return {
      type: "artist",
      id: String(result.artistId ?? id),
      title: artistName,
      subtitle: result.primaryGenreName || "Apple Music Artist",
      imageUrl: await fetchArtistArtwork(externalUrl),
      externalUrl,
      artistName,
      albumName: null,
      trackCount: 0,
      trackNumber: null,
      releaseYear: null,
      genre: result.primaryGenreName || null,
    };
  }

  if (type === "album") {
    const artistName = result.artistName || "";
    const title = result.collectionName || "";

    return {
      type: "album",
      id: String(result.collectionId ?? id),
      title,
      subtitle: artistName || "Apple Music Album",
      imageUrl: upscaleArtwork(result.artworkUrl100),
      externalUrl:
        result.collectionViewUrl ||
        `https://music.apple.com/us/album/${encodeURIComponent(title)}/${id}`,
      artistName,
      albumName: title || null,
      trackCount: Number(result.trackCount) || 0,
      trackNumber: null,
      releaseYear: releaseYear(result.releaseDate),
      genre: result.primaryGenreName || null,
    };
  }

  const artistName = result.artistName || "";
  const title = result.trackName || "";

  return {
    type: "track",
    id: String(result.trackId ?? id),
    title,
    subtitle: artistName || "Apple Music Track",
    imageUrl: upscaleArtwork(result.artworkUrl100),
    externalUrl:
      result.trackViewUrl ||
      `https://music.apple.com/us/song/${encodeURIComponent(title)}/${id}`,
    artistName,
    albumName: result.collectionName || null,
    trackCount: Number(result.trackCount) || 0,
    trackNumber: Number(result.trackNumber) || null,
    releaseYear: releaseYear(result.releaseDate),
    genre: result.primaryGenreName || null,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "apple_music_item");
    if (limited) return limited;

    const { type, id } = await params;
    const cleanType = (type || "").toLowerCase();
    const cleanId = (id || "").trim();

    if (!APPLE_MUSIC_TYPES.includes(cleanType as AppleMusicItemType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Apple Music resource type" },
        { status: 400 }
      );
    }

    if (!isValidAppleMusicId(cleanId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Apple Music identifier" },
        { status: 400 }
      );
    }

    const itemType = cleanType as AppleMusicItemType;

    const data = await withWidgetCache(
      widgetCacheKey("apple-music", itemType, cleanId),
      () => fetchAppleMusicItem(itemType, cleanId)
    );

    if (!data) {
      return NextResponse.json(
        { ok: false, error: `Apple Music ${itemType} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Apple Music Lookup Error]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
