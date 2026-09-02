import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { type YouTubeWidgetData, cleanYouTubeInput } from "@/lib/youtube";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

const API_BASE = "https://www.googleapis.com/youtube/v3";

interface Thumbnail {
  url?: string;
}
interface ThumbnailSet {
  maxres?: Thumbnail;
  standard?: Thumbnail;
  high?: Thumbnail;
  medium?: Thumbnail;
  default?: Thumbnail;
}

function pickThumbnail(thumbs: ThumbnailSet | undefined): string {
  if (!thumbs) return "";
  return (
    thumbs.maxres?.url ||
    thumbs.standard?.url ||
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    ""
  );
}

const SHORTS_MAX_SECONDS = 60;

function parseIsoDurationSeconds(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

async function ytFetch(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("[YouTube API non-OK]", res.status, url.replace(/key=[^&]+/, "key=***"));
      return null;
    }
    return (await res.json()) as Record<string, unknown>;
  } catch (e) {
    console.warn("[YouTube API fetch failed]", e);
    return null;
  }
}

export async function fetchYouTubeData(
  rawInput: string
): Promise<YouTubeWidgetData | null> {
  const cleanInput = cleanYouTubeInput(rawInput);
  if (!cleanInput) return null;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[YouTube API] Missing YOUTUBE_API_KEY");
    return null;
  }
  const key = encodeURIComponent(apiKey);

  const part = "snippet,statistics,contentDetails,brandingSettings";
  let channelItems: Array<Record<string, unknown>> = [];

  if (/^UC[\w-]{22}$/.test(cleanInput)) {
    const json = await ytFetch(
      `${API_BASE}/channels?part=${part}&id=${encodeURIComponent(cleanInput)}&key=${key}`
    );
    channelItems = (json?.items as Array<Record<string, unknown>>) || [];
  } else {
    const handle = cleanInput.replace(/^@/, "");
    const byHandle = await ytFetch(
      `${API_BASE}/channels?part=${part}&forHandle=${encodeURIComponent("@" + handle)}&key=${key}`
    );
    channelItems = (byHandle?.items as Array<Record<string, unknown>>) || [];
    if (channelItems.length === 0) {
      const byUsername = await ytFetch(
        `${API_BASE}/channels?part=${part}&forUsername=${encodeURIComponent(handle)}&key=${key}`
      );
      channelItems = (byUsername?.items as Array<Record<string, unknown>>) || [];
    }
  }

  if (channelItems.length === 0) return null;

  const channel = channelItems[0];
  const snippet = (channel.snippet as Record<string, unknown>) || {};
  const statistics = (channel.statistics as Record<string, unknown>) || {};
  const contentDetails = (channel.contentDetails as Record<string, unknown>) || {};
  const relatedPlaylists =
    (contentDetails.relatedPlaylists as Record<string, unknown>) || {};

  const rawHandle = String(snippet.customUrl || "");
  const handle = rawHandle
    ? rawHandle.startsWith("@")
      ? rawHandle
      : `@${rawHandle}`
    : cleanInput.startsWith("@")
    ? cleanInput
    : `@${cleanInput}`;

  const branding = (channel.brandingSettings as Record<string, unknown>) || {};
  const brandingImage = (branding.image as Record<string, unknown>) || {};
  const rawBanner = String(brandingImage.bannerExternalUrl || "");

  const result: YouTubeWidgetData = {
    channelId: String(channel.id || ""),
    title: String(snippet.title || cleanInput),
    handle,
    avatarUrl: pickThumbnail(snippet.thumbnails as ThumbnailSet),
    bannerUrl: rawBanner ? `${rawBanner}=w1280` : "",
    subscriberCount: Number(statistics.subscriberCount || 0),
    videoCount: Number(statistics.videoCount || 0),
    viewCount: Number(statistics.viewCount || 0),
  };

  const uploadsPlaylist = String(relatedPlaylists.uploads || "");
  if (uploadsPlaylist) {
    const playlistJson = await ytFetch(
      `${API_BASE}/playlistItems?part=contentDetails&maxResults=15&playlistId=${encodeURIComponent(
        uploadsPlaylist
      )}&key=${key}`
    );
    const playlistItems =
      (playlistJson?.items as Array<Record<string, unknown>>) || [];

    const videoIds = playlistItems
      .map((item) => {
        const c = (item.contentDetails as Record<string, unknown>) || {};
        return String(c.videoId || "");
      })
      .filter(Boolean);

    if (videoIds.length > 0) {
      const videoJson = await ytFetch(
        `${API_BASE}/videos?part=snippet,statistics,contentDetails&id=${encodeURIComponent(
          videoIds.join(",")
        )}&key=${key}`
      );
      const videoItems =
        (videoJson?.items as Array<Record<string, unknown>>) || [];

      const byId = new Map<string, Record<string, unknown>>();
      for (const v of videoItems) byId.set(String(v.id || ""), v);

      let chosen: Record<string, unknown> | null = null;
      let newestFallback: Record<string, unknown> | null = null;
      for (const id of videoIds) {
        const v = byId.get(id);
        if (!v) continue;
        if (!newestFallback) newestFallback = v;
        const vContent = (v.contentDetails as Record<string, unknown>) || {};
        const seconds = parseIsoDurationSeconds(String(vContent.duration || ""));
        const isShort = seconds > 0 && seconds <= SHORTS_MAX_SECONDS;
        if (!isShort) {
          chosen = v;
          break;
        }
      }

      const v = chosen || newestFallback;
      if (v) {
        const vSnippet = (v.snippet as Record<string, unknown>) || {};
        const vStats = (v.statistics as Record<string, unknown>) || {};
        result.video = {
          id: String(v.id || ""),
          title: String(vSnippet.title || ""),
          thumbnailUrl: pickThumbnail(vSnippet.thumbnails as ThumbnailSet),
          viewCount: Number(vStats.viewCount || 0),
          likeCount: Number(vStats.likeCount || 0),
          publishedAt: String(vSnippet.publishedAt || ""),
        };
      }
    }
  }

  return result;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ input: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "youtube_channel");
    if (limited) return limited;

    const { input } = await params;
    const cleanInput = cleanYouTubeInput(input);

    if (
      !cleanInput ||
      !/^(UC[\w-]{22}|@?[a-zA-Z0-9_.-]{3,30})$/.test(cleanInput)
    ) {
      return NextResponse.json(
        { error: "Invalid YouTube channel" },
        { status: 400 }
      );
    }

    const data = await withWidgetCache(
      widgetCacheKey("youtube", cleanInput),
      () => fetchYouTubeData(cleanInput)
    );
    if (!data) {
      return NextResponse.json(
        { error: "YouTube channel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    }, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[YouTube Channel API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
