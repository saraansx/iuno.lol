import { NextRequest, NextResponse } from "next/server";
import { type GenshinPlayerData, getGenshinRegion, buildEnkaUiUrl } from "@/lib/genshin";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

/**
 * Enka.Network exposes the numeric game IDs (avatarId, nameCardId) in the live
 * API, but the CDN assets are keyed by their real internal asset names
 * (e.g. "UI_AvatarIcon_Ambor", "UI_NameCardPic_Tzz3_P"). The mapping between the
 * two lives in Enka's public store JSON. We load those maps once and cache them
 * in module memory (they only change on a new game version).
 */
const ENKA_STORE_BASE =
  "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store";
const MAP_TTL_MS = 1000 * 60 * 60 * 12; // 12h

interface CharacterEntry {
  SideIconName?: string;
  Costumes?: Record<string, { icon?: string }>;
}
interface NamecardEntry {
  icon?: string;
}
interface PfpEntry {
  iconPath?: string;
}

interface EnkaMaps {
  characters: Record<string, CharacterEntry>;
  namecards: Record<string, NamecardEntry>;
  pfps: Record<string, PfpEntry>;
}

interface ProfilePicture {
  avatarId?: number;
  id?: number;
  costumeId?: number;
}

let cachedMaps: EnkaMaps | null = null;
let cachedAt = 0;
let inflight: Promise<EnkaMaps | null> | null = null;

async function fetchStoreJson<T>(name: string): Promise<T | null> {
  try {
    const res = await fetch(`${ENKA_STORE_BASE}/${name}.json`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "iuno-profile-widget/1.0",
        Accept: "application/json",
      },
      // Freshness is owned by the Redis cache in GET; caching here too would stack
      // both windows and double the worst-case staleness.
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function loadEnkaMaps(): Promise<EnkaMaps | null> {
  if (cachedMaps && Date.now() - cachedAt < MAP_TTL_MS) return cachedMaps;
  if (inflight) return inflight;

  inflight = (async () => {
    const [characters, namecards, pfps] = await Promise.all([
      fetchStoreJson<Record<string, CharacterEntry>>("characters"),
      fetchStoreJson<Record<string, NamecardEntry>>("namecards"),
      fetchStoreJson<Record<string, PfpEntry>>("pfps"),
    ]);
    if (characters && namecards && pfps) {
      cachedMaps = { characters, namecards, pfps };
      cachedAt = Date.now();
    }
    inflight = null;
    return cachedMaps;
  })();

  return inflight;
}

/** Resolve the character/profile-picture icon asset name from Enka IDs. */
function resolveAvatarAsset(
  profilePicture: ProfilePicture | undefined,
  maps: EnkaMaps | null
): string | null {
  if (!profilePicture || !maps) return null;

  // Preferred: avatarId -> square character icon (fills any container shape).
  if (profilePicture.avatarId) {
    const char = maps.characters[String(profilePicture.avatarId)];
    if (char) {
      const costume =
        profilePicture.costumeId &&
        char.Costumes?.[String(profilePicture.costumeId)]?.icon;
      if (costume) return costume;
      if (char.SideIconName) return char.SideIconName.replace("_Side", "");
    }
  }

  // Legacy: profilePicture.id -> pfps map (circular icon).
  if (profilePicture.id) {
    const pfp = maps.pfps[String(profilePicture.id)];
    if (pfp?.iconPath) return pfp.iconPath;
  }

  return null;
}

/** Resolve the wide namecard banner asset name from a nameCardId. */
function resolveNamecardAsset(
  nameCardId: number | null | undefined,
  maps: EnkaMaps | null
): string | null {
  if (!nameCardId || !maps) return null;
  return maps.namecards[String(nameCardId)]?.icon ?? null;
}

export async function fetchGenshinPlayerData(
  uid: string
): Promise<GenshinPlayerData | null> {
  const cleanUid = (uid || "").trim();
  if (!/^[1-9][0-9]{8,9}$/.test(cleanUid)) {
    return null;
  }

  try {
    const res = await fetch(`https://enka.network/api/uid/${cleanUid}?info`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "iuno-profile-widget/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const info = data?.playerInfo;
    if (!info || !info.nickname) {
      return null;
    }

    const maps = await loadEnkaMaps();

    const avatarAsset = resolveAvatarAsset(info.profilePicture, maps);
    const avatarUrl =
      buildEnkaUiUrl(avatarAsset) ??
      "https://enka.network/ui/UI_AvatarIcon_PlayerBoy.png";

    const namecardAsset = resolveNamecardAsset(info.nameCardId, maps);
    const namecardBgUrl = buildEnkaUiUrl(namecardAsset);

    const region =
      typeof data.region === "string" && data.region
        ? data.region
        : getGenshinRegion(cleanUid);

    const result: GenshinPlayerData = {
      uid: cleanUid,
      nickname: String(info.nickname).trim(),
      level: Number(info.level || 1),
      world_level: Number(info.worldLevel || 0),
      achievements: Number(info.finishAchievementNum || 0),
      region,
      avatar_url: avatarUrl,
      namecard_url: null,
      namecard_bg_url: namecardBgUrl,
    };

    return result;
  } catch (err) {
    console.error("[Genshin Fetch Error]", err);
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const cleanUid = (uid || "").trim();

    if (!cleanUid || !/^[1-9][0-9]{8,9}$/.test(cleanUid)) {
      return NextResponse.json({ error: "Invalid Genshin Impact UID" }, { status: 400 });
    }

    const data = await withWidgetCache(
      widgetCacheKey("genshin", "player", cleanUid),
      () => fetchGenshinPlayerData(cleanUid)
    );
    if (!data) {
      return NextResponse.json({ error: "Genshin player profile not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Genshin Player API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
