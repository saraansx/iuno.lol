import { NextRequest, NextResponse } from "next/server";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

/**
 * Only the fields the widget actually renders.
 *
 * Every one of these is stored in Redis under a per-profile key, so anything the
 * UI never reads is pure cache weight — the Web API also returns persona state,
 * the current game and lifetime playtime, and none of them are kept.
 */
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
  /** Present only when the profile is public but its game library is hidden. */
  library_private?: boolean;
}

const API_BASE = "https://api.steampowered.com";

/** Public-profile visibility state. Anything else hides level, games and items. */
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

/**
 * Calls one Web API endpoint and returns its parsed `response` object.
 *
 * Every call is best-effort: a private profile, a revoked key or a Steam outage
 * all resolve to `null` so one missing extra (level, games, equipped items)
 * never costs the whole widget its core profile data.
 */
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
      // Say which endpoint gave up — a bad key (403) and a private profile
      // (200-with-nothing) are otherwise indistinguishable in the logs.
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

/**
 * Equipped-item asset reference, or null when nothing is equipped.
 *
 * The Web API already hands these back as paths relative to the community image
 * CDN, and they are kept that way: every consumer routes the value through
 * `/api/widgets/steam/image`, which re-attaches the CDN base. Storing the
 * absolute form would repeat a 64-character prefix on all seven item fields —
 * roughly a third of the cached payload — for no gain.
 */
function itemPath(path: string | undefined): string | null {
  return path || null;
}

/**
 * Path to an item's *moving* artwork.
 *
 * Steam stores the animated asset in `image_small` and a flattened still in
 * `image_large`, so reading the large slot silently drops the animation: an
 * animated avatar's small slot is the .gif and its large slot a .jpg, and an
 * animated frame's small slot is a 90-frame APNG against a one-frame PNG. Still
 * JPEGs are skipped outright, and `image_large` remains the fallback for items
 * that only ever ship one variant.
 */
function animatedItemUrl(item: EquippedItem | undefined): string | null {
  const animated = [item?.image_small, item?.image_large].find(
    (path) => path && !/\.jpe?g(\?|$)/i.test(path)
  );
  return itemPath(animated ?? item?.image_large);
}

/** Turns a vanity name into a SteamID64. 17-digit input is already one. */
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

  // Level, library and equipped items are only readable on public profiles, so
  // skip the three extra round trips entirely when the profile is private.
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

  /**
   * "Game details" is its own privacy setting, independent of profile
   * visibility: a fully public profile can still hide its library, and Steam
   * signals that by answering 200 with an empty `response` object.
   *
   * A dropped call — revoked key, outage, timeout — resolves to `null` instead,
   * so the two are told apart here and an outage never renders as a privacy
   * claim. Only the hidden-library case is sent to the client.
   */
  const libraryPrivate =
    !isPrivate && gamesRes !== null && gamesRes.game_count === undefined;

  return {
    personaname: player.personaname || normalized,
    profileurl: player.profileurl || `https://steamcommunity.com/profiles/${steamid}/`,
    // Only the 184px variant is kept — `avatar` is the same image at 32px, and
    // every render path already scales the full one down.
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
    // Rendered as "Since 2003", so only the year is ever needed.
    member_since: player.timecreated
      ? String(new Date(player.timecreated * 1000).getUTCFullYear())
      : null,
    is_private: isPrivate,
    // Omitted entirely when false — keeps the common payload byte-for-byte the
    // same size as before.
    ...(libraryPrivate ? { library_private: true } : {}),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Steam User API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
