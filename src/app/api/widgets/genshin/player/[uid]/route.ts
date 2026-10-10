import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { type GenshinPlayerData, getGenshinRegion, buildEnkaUiUrl } from "@/lib/genshin";
import { withWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

const ENKA_STORE_BASE =
  "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store";
const MAP_REVALIDATE_SECONDS = 12 * 60 * 60;

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

async function fetchStoreJson<T>(name: string): Promise<T | null> {
  try {
    const res = await fetch(`${ENKA_STORE_BASE}/${name}.json`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "iuno-profile-widget/1.0",
        Accept: "application/json",
      },
      next: { revalidate: MAP_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function loadEnkaMaps(): Promise<EnkaMaps | null> {
  const [characters, namecards, pfps] = await Promise.all([
    fetchStoreJson<Record<string, CharacterEntry>>("characters"),
    fetchStoreJson<Record<string, NamecardEntry>>("namecards"),
    fetchStoreJson<Record<string, PfpEntry>>("pfps"),
  ]);
  if (!characters || !namecards || !pfps) return null;
  return { characters, namecards, pfps };
}

function resolveAvatarAsset(
  profilePicture: ProfilePicture | undefined,
  maps: EnkaMaps | null
): string | null {
  if (!profilePicture || !maps) return null;

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

  if (profilePicture.id) {
    const pfp = maps.pfps[String(profilePicture.id)];
    if (pfp?.iconPath) return pfp.iconPath;
  }

  return null;
}

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
    const [res, maps] = await Promise.all([
      fetch(`https://enka.network/api/uid/${cleanUid}?info`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          "User-Agent": "iuno-profile-widget/1.0",
          Accept: "application/json",
        },
        cache: "no-store",
      }),
      loadEnkaMaps(),
    ]);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const info = data?.playerInfo;
    if (!info || !info.nickname) {
      return null;
    }

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
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "genshin_player");
    if (limited) return limited;

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

    return NextResponse.json(data, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[Genshin Player API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
