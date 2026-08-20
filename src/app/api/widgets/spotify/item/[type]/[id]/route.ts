import { NextRequest, NextResponse } from "next/server";
import { type SpotifyItemData } from "@/lib/spotify";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

interface SpotifyImage {
  url: string;
  height?: number | null;
  width?: number | null;
}

interface SpotifyArtistRef {
  id: string;
  name: string;
}

interface SpotifyTrackResponse {
  id: string;
  name: string;
  artists?: SpotifyArtistRef[];
  album?: {
    name?: string;
    images?: SpotifyImage[];
    release_date?: string;
  };
  duration_ms?: number;
  preview_url?: string | null;
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifyAlbumResponse {
  id: string;
  name: string;
  artists?: SpotifyArtistRef[];
  images?: SpotifyImage[];
  release_date?: string;
  total_tracks?: number;
  tracks?: {
    total?: number;
  };
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifyPlaylistResponse {
  id: string;
  name: string;
  owner?: {
    id?: string;
    display_name?: string;
  };
  images?: SpotifyImage[];
  tracks?: {
    total?: number;
  };
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifyArtistResponse {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  followers?: {
    total?: number;
  };
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifyUserResponse {
  id: string;
  display_name?: string;
  images?: SpotifyImage[];
  followers?: {
    total?: number;
  };
  external_urls?: {
    spotify?: string;
  };
}

async function getSpotifyAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[Spotify API] Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
    return null;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[Spotify Token Error]", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) {
      return null;
    }

    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedToken;
  } catch (err: unknown) {
    console.error("[Spotify Token Fetch Error]", err);
    return null;
  }
}

export async function fetchSpotifyItem(
  type: "track" | "album" | "playlist" | "artist" | "user",
  id: string
): Promise<SpotifyItemData | null> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return null;
  }

  try {
    const endpointType = type === "user" ? "users" : `${type}s`;
    const endpoint = `https://api.spotify.com/v1/${endpointType}/${encodeURIComponent(id)}`;
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok && type !== "user") {
      return null;
    }

    if (type === "track") {
      const data = (await res.json()) as SpotifyTrackResponse;
      const artists = (data.artists || []).map((a) => a.name).join(", ");
      const album = data.album?.name || null;
      const imageUrl = data.album?.images?.[0]?.url || data.album?.images?.[1]?.url || null;
      const releaseYear = data.album?.release_date ? data.album.release_date.split("-")[0] : null;

      return {
        type: "track",
        id: data.id,
        title: data.name,
        subtitle: artists,
        imageUrl,
        externalUrl: data.external_urls?.spotify || `https://open.spotify.com/track/${data.id}`,
        artistName: artists,
        albumName: album,
        releaseYear,
        durationMs: data.duration_ms || null,
        previewUrl: data.preview_url || null,
      };
    }

    if (type === "album") {
      const data = (await res.json()) as SpotifyAlbumResponse;
      const artists = (data.artists || []).map((a) => a.name).join(", ");
      const imageUrl = data.images?.[0]?.url || data.images?.[1]?.url || null;
      const releaseYear = data.release_date ? data.release_date.split("-")[0] : null;
      const trackCount = data.total_tracks || data.tracks?.total || 0;

      return {
        type: "album",
        id: data.id,
        title: data.name,
        subtitle: artists,
        imageUrl,
        externalUrl: data.external_urls?.spotify || `https://open.spotify.com/album/${data.id}`,
        artistName: artists,
        albumName: data.name,
        trackCount,
        releaseYear,
      };
    }

    if (type === "playlist") {
      const data = (await res.json()) as SpotifyPlaylistResponse;
      const owner = data.owner?.display_name || data.owner?.id || "Spotify";
      const imageUrl = data.images?.[0]?.url || data.images?.[1]?.url || null;
      let trackCount = data.tracks?.total ?? 0;

      // Spotify API client credentials flow returns 403 on /tracks and omits tracks.total
      if (trackCount === 0) {
        try {
          const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${encodeURIComponent(data.id)}`, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            next: { revalidate: 3600 },
          });
          if (embedRes.ok) {
            const html = await embedRes.text();
            const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
            if (match) {
              const parsed = JSON.parse(match[1]);
              const list = parsed.props?.pageProps?.state?.data?.entity?.trackList;
              if (Array.isArray(list) && list.length > 0) {
                trackCount = list.length;
              }
            }
          }
        } catch {
          // ignore embed fallback error
        }
      }

      return {
        type: "playlist",
        id: data.id,
        title: data.name,
        subtitle: `By ${owner}`,
        imageUrl,
        externalUrl: data.external_urls?.spotify || `https://open.spotify.com/playlist/${data.id}`,
        ownerName: owner,
        trackCount,
      };
    }

    if (type === "artist") {
      const data = (await res.json()) as SpotifyArtistResponse;
      const imageUrl = data.images?.[0]?.url || data.images?.[1]?.url || null;
      let followers = data.followers?.total || 0;
      let monthlyListeners = 0;

      // Spotify API client credentials flow omits followers and listeners on /v1/artists/{id}
      try {
        const artistPageRes = await fetch(`https://open.spotify.com/artist/${encodeURIComponent(data.id)}`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          next: { revalidate: 3600 },
        });
        if (artistPageRes.ok) {
          const html = await artistPageRes.text();
          const followerMatch =
            html.match(/>([0-9,]+)<\/p><p[^>]*>Followers<\/p>/i) ||
            html.match(/([0-9,]+)\s+followers/i);
          if (followerMatch) {
            const parsed = parseInt(followerMatch[1].replace(/,/g, ""), 10);
            if (!isNaN(parsed) && parsed > 0) {
              followers = parsed;
            }
          }

          const monthlyMatch =
            html.match(/>([0-9,]+)<\/p><p[^>]*>monthly listeners<\/p>/i) ||
            html.match(/([0-9,]+)\s+monthly listeners/i);
          if (monthlyMatch) {
            const parsedMonthly = parseInt(monthlyMatch[1].replace(/,/g, ""), 10);
            if (!isNaN(parsedMonthly) && parsedMonthly > 0) {
              monthlyListeners = parsedMonthly;
            }
          }
        }
      } catch {
        // ignore artist page scrape error
      }

      const subtitleParts: string[] = [];
      if (followers > 0) subtitleParts.push(`${followers.toLocaleString()} followers`);
      if (monthlyListeners > 0) subtitleParts.push(`${monthlyListeners.toLocaleString()} monthly listeners`);

      return {
        type: "artist",
        id: data.id,
        title: data.name,
        subtitle: subtitleParts.join(" • ") || "Spotify Artist",
        imageUrl,
        externalUrl: data.external_urls?.spotify || `https://open.spotify.com/artist/${data.id}`,
        followersCount: followers,
        monthlyListeners,
      };
    }

    if (type === "user") {
      let displayName: string | null = null;
      let imageUrl: string | null = null;
      let followers = 0;

      if (res.ok) {
        const data = (await res.json()) as SpotifyUserResponse;
        displayName = data.display_name || data.id;
        imageUrl = data.images?.[0]?.url || data.images?.[1]?.url || null;
        followers = data.followers?.total || 0;
      } else {
        // Spotify Web API client credentials flow returns 404/403 for /v1/users/{id}
        try {
          const userPageRes = await fetch(`https://open.spotify.com/user/${encodeURIComponent(id)}`, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            next: { revalidate: 3600 },
          });
          if (userPageRes.ok) {
            const html = await userPageRes.text();
            const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
            const titleTagMatch = html.match(/<title>([^<]+?)(?:\s+on\s+Spotify)?<\/title>/i);
            displayName = ogTitleMatch?.[1] || titleTagMatch?.[1] || id;

            const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
            if (ogImageMatch?.[1] && ogImageMatch[1].startsWith("http")) {
              imageUrl = ogImageMatch[1];
            }

            const followerMatch =
              html.match(/>([0-9,]+)<\/p><p[^>]*>Followers<\/p>/i) ||
              html.match(/([0-9,]+)\s+followers/i);
            if (followerMatch) {
              const parsed = parseInt(followerMatch[1].replace(/,/g, ""), 10);
              if (!isNaN(parsed) && parsed > 0) followers = parsed;
            }
          }
        } catch {
          // ignore user page scrape error
        }
      }

      if (!displayName) {
        return null;
      }

      return {
        type: "user",
        id,
        title: displayName,
        subtitle: followers > 0 ? `${followers.toLocaleString()} followers` : "Spotify User",
        imageUrl,
        externalUrl: `https://open.spotify.com/user/${id}`,
        followersCount: followers,
      };
    }

    return null;
  } catch (err: unknown) {
    console.error("[Spotify Fetch Error]", err);
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;
    const cleanType = type.toLowerCase();
    const cleanId = (id || "").trim();

    if (!["track", "album", "playlist", "artist", "user"].includes(cleanType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Spotify resource type" },
        { status: 400 }
      );
    }

    if (!cleanId) {
      return NextResponse.json(
        { ok: false, error: "Invalid Spotify identifier" },
        { status: 400 }
      );
    }

    const data = await fetchSpotifyItem(cleanType as "track" | "album" | "playlist" | "artist" | "user", cleanId);
    if (!data) {
      return NextResponse.json(
        { ok: false, error: `Spotify ${cleanType} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (err: unknown) {
    console.error("[Spotify Lookup Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
