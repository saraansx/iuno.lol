import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export interface SteamUserData {
  personaname: string;
  profileurl: string;
  avatarfull: string;
  avatarframe?: string | null;
  animated_avatar?: string | null;
  profile_background?: string | null;
  profile_background_webm?: string | null;
  profile_background_mp4?: string | null;
  mini_profile_background?: string | null;
  mini_profile_background_webm?: string | null;
  mini_profile_background_mp4?: string | null;
  level?: number | null;
  game_count?: number | null;
  member_since?: string | null;
  is_private?: boolean;
  library_private?: boolean;
}

const API_BASE = "https://api.steampowered.com";

const VISIBILITY_PUBLIC = 3;

interface PlayerSummary {
  steamid: string;
  personaname?: string;
  profileurl?: string;
  avatar?: string;
  avatarfull?: string;
  communityvisibilitystate?: number;
  timecreated?: number;
}

interface EquippedItem {
  image_small?: string;
  image_large?: string;
  movie_webm?: string;
  movie_mp4?: string;
}

async function callSteamApi<T>(
  path: string,
  params: Record<string, string>,
  key: string
): Promise<T | null> {
  const url = new URL(`${API_BASE}/${path}`);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[Steam] ${path} answered ${res.status}`);
      return null;
    }
    const json = await res.json();
    return (json?.response ?? null) as T | null;
  } catch (err) {
    console.warn(`[Steam] ${path} fetch failed`, err);
    return null;
  }
}

function itemPath(path: string | undefined): string | null {
  return path || null;
}

function animatedItemUrl(item: EquippedItem | undefined): string | null {
  const animated = [item?.image_small, item?.image_large].find(
    (path) => path && !/\.jpe?g(\?|$)/i.test(path)
  );
  return itemPath(animated ?? item?.image_large);
}

async function resolveSteamId(
  normalized: string,
  key: string
): Promise<string | null> {
  if (/^\d{17}$/.test(normalized)) return normalized;

  const res = await callSteamApi<{ success: number; steamid?: string }>(
    "ISteamUser/ResolveVanityURL/v1/",
    { vanityurl: normalized },
    key
  );

  return res?.success === 1 && res.steamid ? res.steamid : null;
}

export async function fetchSteamUserData(
  cleanInput: string
): Promise<SteamUserData | null> {
  const normalized = cleanInput
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
    .replace(/\/$/, "");

  if (!normalized) return null;

  const key = process.env.STEAM_API_KEY || "";
  if (!key) {
    console.error("[Steam] STEAM_API_KEY is not configured");
    return null;
  }

  const steamid = await resolveSteamId(normalized, key);
  if (!steamid) return null;

  const summaries = await callSteamApi<{ players?: PlayerSummary[] }>(
    "ISteamUser/GetPlayerSummaries/v2/",
    { steamids: steamid },
    key
  );
  const player = summaries?.players?.[0];
  if (!player) return null;

  const isPrivate = player.communityvisibilitystate !== VISIBILITY_PUBLIC;

  const [levelRes, gamesRes, itemsRes] = isPrivate
    ? [null, null, null]
    : await Promise.all([
        callSteamApi<{ player_level?: number }>(
          "IPlayerService/GetSteamLevel/v1/",
          { steamid },
          key
        ),
        callSteamApi<{ game_count?: number }>(
          "IPlayerService/GetOwnedGames/v1/",
          { steamid, include_played_free_games: "1" },
          key
        ),
        callSteamApi<{
          avatar_frame?: EquippedItem;
          animated_avatar?: EquippedItem;
          profile_background?: EquippedItem;
          mini_profile_background?: EquippedItem;
        }>("IPlayerService/GetProfileItemsEquipped/v1/", { steamid }, key),
      ]);

  const libraryPrivate =
    !isPrivate && gamesRes !== null && gamesRes.game_count === undefined;

  return {
    personaname: player.personaname || normalized,
    profileurl: player.profileurl || `https://steamcommunity.com/profiles/${steamid}/`,
    avatarfull: player.avatarfull || player.avatar || "",
    avatarframe: animatedItemUrl(itemsRes?.avatar_frame),
    animated_avatar: animatedItemUrl(itemsRes?.animated_avatar),
    profile_background: itemPath(itemsRes?.profile_background?.image_large),
    profile_background_webm: itemPath(itemsRes?.profile_background?.movie_webm),
    profile_background_mp4: itemPath(itemsRes?.profile_background?.movie_mp4),
    mini_profile_background: itemPath(itemsRes?.mini_profile_background?.image_large),
    mini_profile_background_webm: itemPath(itemsRes?.mini_profile_background?.movie_webm),
    mini_profile_background_mp4: itemPath(itemsRes?.mini_profile_background?.movie_mp4),
    level: levelRes?.player_level ?? null,
    game_count: gamesRes?.game_count ?? null,
    member_since: player.timecreated
      ? String(new Date(player.timecreated * 1000).getUTCFullYear())
      : null,
    is_private: isPrivate,
    ...(libraryPrivate ? { library_private: true } : {}),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "steam_user");
    if (limited) return limited;

    const { id } = await params;
    const cleanId = (id || "").trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Steam ID or vanity name required" }, { status: 400 });
    }

    const data = await withWidgetCache(
      widgetCacheKey("steam", "user", cleanId),
      () => fetchSteamUserData(cleanId)
    );
    if (!data) {
      return NextResponse.json({ error: "Steam profile not found" }, { status: 404 });
    }

    return NextResponse.json(data, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Steam User API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
