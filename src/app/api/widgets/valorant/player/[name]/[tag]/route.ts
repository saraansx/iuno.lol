import { NextRequest, NextResponse } from "next/server";
import { getRankIconUrl, getAgentIconUrl, getMapSplashUrl } from "@/lib/valorant";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export { getRankIconUrl, getAgentIconUrl, getMapSplashUrl };

export interface ValorantPlayerData {
  name: string;
  tag: string;
  account_level: number;
  card_id: string; // e.g. "a78feb94-4e1f-e845-c253-c182d9db9ef"
  current_rank: {
    tier: number;
    tier_name: string;
    rr: number;
  };
  highest_rank: {
    tier: number;
    tier_name: string;
  };
  last_matches?: {
    any?: {
      agent: string;
      map: string;
    };
    competitive?: {
      agent: string;
      map: string;
    };
  };
}

const RANK_TIER_NAMES: Record<number, string> = {
  0: "Unrated",
  1: "Unknown",
  2: "Unknown",
  3: "Iron 1",
  4: "Iron 2",
  5: "Iron 3",
  6: "Bronze 1",
  7: "Bronze 2",
  8: "Bronze 3",
  9: "Silver 1",
  10: "Silver 2",
  11: "Silver 3",
  12: "Gold 1",
  13: "Gold 2",
  14: "Gold 3",
  15: "Platinum 1",
  16: "Platinum 2",
  17: "Platinum 3",
  18: "Diamond 1",
  19: "Diamond 2",
  20: "Diamond 3",
  21: "Ascendant 1",
  22: "Ascendant 2",
  23: "Ascendant 3",
  24: "Immortal 1",
  25: "Immortal 2",
  26: "Immortal 3",
  27: "Radiant",
};

export async function fetchValorantPlayerData(name: string, tag: string): Promise<ValorantPlayerData | null> {
  const cleanName = name.trim();
  const cleanTag = tag.trim().replace(/^#/, "");

  const encodedName = encodeURIComponent(cleanName);
  const encodedTag = encodeURIComponent(cleanTag);
  const henrikKey = process.env.HENRIK_VALORANT_API_KEY || process.env.VALORANT_API_KEY;
  const headers: Record<string, string> = {
    "User-Agent": "iuno-valorant-widget/1.0",
  };
  if (henrikKey) {
    headers["Authorization"] = henrikKey;
  }

  let accountLevel = 1;
  let cardId = "9fb348bc-41a0-96ad-7a3e-6da780cb5645";

  let currentTier = 0;
  let currentTierName = "Unrated";
  let currentRR = 0;

  let highestTier = 0;
  let highestTierName = "Unrated";

  let lastAgentName = "Jett";
  let lastMapName = "Ascent";

  let fetchedAccount = false;
  let region = "ap";

  // 1. Fetch Account Details (v1/account)
  try {
    const accRes = await fetch(`https://api.henrikdev.xyz/valorant/v1/account/${encodedName}/${encodedTag}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers,
      cache: "no-store",
    });
    if (accRes.ok) {
      const accJson = await accRes.json();
      if (accJson?.data) {
        accountLevel = accJson.data.account_level || 1;
        region = accJson.data.region || "ap";
        if (accJson.data.card?.id) {
          cardId = accJson.data.card.id;
        } else if (accJson.data.card?.wide) {
          const m = String(accJson.data.card.wide).match(/playercards\/([^/]+)\//);
          if (m && m[1]) cardId = m[1];
        }
        fetchedAccount = true;
      }
    }
  } catch (e) {
    console.warn("[HenrikDev Account API Error]", e);
  }

  // 2. Fetch MMR Data (v2/mmr or v1/mmr)
  try {
    const mmrRes = await fetch(`https://api.henrikdev.xyz/valorant/v2/mmr/${region}/${encodedName}/${encodedTag}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers,
      cache: "no-store",
    });

    if (mmrRes.ok) {
      const mmrJson = await mmrRes.json();
      const currentData = mmrJson?.data?.current_data;
      const highestData = mmrJson?.data?.highest_rank;

      if (currentData) {
        currentTier = currentData.currenttier || 0;
        currentTierName = currentData.currenttierpatched || RANK_TIER_NAMES[currentTier] || "Unrated";
        currentRR = typeof currentData.ranking_in_tier === "number" ? currentData.ranking_in_tier : 0;
      }

      if (highestData) {
        highestTier = highestData.tier || currentTier;
        highestTierName = highestData.patched_tier || RANK_TIER_NAMES[highestTier] || currentTierName;
      }
    }
  } catch (e) {
    console.warn("[HenrikDev MMR API Error]", e);
  }

  let lastMatchAny: { agent: string; map: string } | undefined;
  let lastMatchComp: { agent: string; map: string } | undefined;

  // 3. Fetch Matches for Last Played Agent & Map (v3/matches)
  try {
    const matchesRes = await fetch(`https://api.henrikdev.xyz/valorant/v3/matches/${region}/${encodedName}/${encodedTag}?size=5`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers,
      cache: "no-store",
    });

    if (matchesRes.ok) {
      const matchesJson = await matchesRes.json();
      const matches = matchesJson?.data || [];

      // Find any latest match
      for (const match of matches) {
        const player = match.players?.all_players?.find(
          (p: { name?: string; tag?: string }) =>
            p.name?.toLowerCase() === cleanName.toLowerCase() && p.tag?.toLowerCase() === cleanTag.toLowerCase()
        );
        if (player) {
          const char = player.character || "Jett";
          const map = match.metadata?.map || "Ascent";
          const mode = match.metadata?.mode || "Match";

          if (!lastMatchAny) {
            lastMatchAny = { agent: char, map };
            lastAgentName = char;
            lastMapName = map;
            if (player.assets?.card?.small) {
              const m = String(player.assets.card.small).match(/playercards\/([^/]+)\//);
              if (m && m[1]) cardId = m[1];
            }
          }

          if (!lastMatchComp && (mode.toLowerCase() === "competitive" || match.metadata?.queue?.toLowerCase() === "competitive")) {
            lastMatchComp = { agent: char, map };
          }
        }
      }
    }
  } catch (e) {
    console.warn("[HenrikDev Matches API Error]", e);
  }

  // 4. If account was never fetched and no MMR data found, profile does not exist
  if (!fetchedAccount && !currentTier) {
    return null;
  }

  const result: ValorantPlayerData = {
    name: cleanName,
    tag: cleanTag,
    account_level: accountLevel,
    card_id: cardId,
    current_rank: {
      tier: currentTier,
      tier_name: currentTierName,
      rr: currentRR,
    },
    highest_rank: {
      tier: highestTier || currentTier,
      tier_name: highestTierName || currentTierName,
    },
    last_matches: {
      any: lastMatchAny || { agent: lastAgentName, map: lastMapName },
      competitive: lastMatchComp || lastMatchAny || { agent: lastAgentName, map: lastMapName },
    },
  };

  return result;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string; tag: string }> }
) {
  try {
    const { name, tag } = await params;
    const cleanName = (name || "").trim();
    const cleanTag = (tag || "").trim().replace(/^#/, "");

    if (!cleanName || !cleanTag) {
      return NextResponse.json({ error: "Invalid Riot ID" }, { status: 400 });
    }

    const data = await withWidgetCache(
      widgetCacheKey("valorant", "player", cleanName, cleanTag),
      () => fetchValorantPlayerData(cleanName, cleanTag)
    );
    if (!data) {
      return NextResponse.json({ error: "Valorant player not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Valorant Player API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
