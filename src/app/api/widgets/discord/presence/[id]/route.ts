import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { redis } from "@/lib/redis";
import { withWidgetCache, widgetCacheKey, readWidgetCache, writeWidgetCache } from "@/lib/widget-cache";
import { discordActivityImageUrl } from "@/lib/discord-activity-image";
import { signWidgetImageUrl } from "@/lib/server/security/widget-signature";

interface PresenceResponse {
  in_server: boolean;
  user: {
    id: string;
    username: string;
    avatar?: string | null;
    avatar_decoration_data?: {
      asset: string;
    } | null;
    clan?: {
      identity_guild_id?: string;
      tag?: string;
      badge?: string;
    } | null;
    profile_badges?: Array<{
      id: string;
      description?: string;
      icon?: string;
    }>;
  } | null;
  status: "online" | "idle" | "dnd" | "offline";
  last_seen?: number | null;
  custom_status?: {
    text?: string | null;
    emoji?: {
      name?: string;
      id?: string;
      animated?: boolean;
    } | null;
  } | null;
  spotify?: {
    song: string;
    artist: string;
    album_art_url?: string | null;
  } | null;
  primary_activity?: {
    name: string;
    state?: string | null;
    details?: string | null;
    large_image_url?: string | null;
    small_image_url?: string | null;
  } | null;
}

interface DiscordClan {
  id?: string;
  identity_guild_id?: string;
  tag?: string;
  badge?: string;
}

interface DiscordMemberData {
  user?: DiscordUserFields;
  clan?: DiscordClan | null;
}

interface DiscordUserFields {
  id: string;
  username: string;
  avatar?: string | null;
  avatar_decoration_data?: { asset: string } | null;
  clan?: DiscordClan | null;
  primary_guild?: DiscordClan | null;
}

const BADGES_CACHE_TTL_SEC = 12 * 60 * 60;

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

const PRESENCE_CACHE_SECONDS = 5;

function resolveActivityImage(url?: string | null): string | null {
  return discordActivityImageUrl(url, signWidgetImageUrl);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^\d{17,20}$/.test(id)) {
    return NextResponse.json({ in_server: false, error: "Invalid Discord ID" }, { status: 400 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const botUrl = (process.env.DISCORD_BOT_URL || "").replace(/\/$/, "");

  if (!botToken || !guildId) {
    return NextResponse.json({ in_server: false, error: "Server configuration missing" }, { status: 500 });
  }

  try {
    const limited = await widgetRateLimit(req, "discord_presence");
    if (limited) return limited;

    const cacheKey = widgetCacheKey("discord", "presence", id);
    const cached = await readWidgetCache<PresenceResponse>(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: NO_STORE });

    const redisBadgesKey = `discord:badges:v2:${id}`;
    const [memberData, presenceData, cachedBadgesRaw] = await Promise.all([
      withWidgetCache<DiscordMemberData>(
        widgetCacheKey("discord", "member", id),
        async () => {
          const res = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${id}`,
            {
              headers: {
                Authorization: `Bot ${botToken}`,
                "User-Agent": "iuno-presence-proxy/1.0",
              },
              cache: "no-store",
            }
          );
          if (!res.ok) return null;
          return res.json();
        }
      ),
      (async (): Promise<{
        status?: "online" | "idle" | "dnd" | "offline";
        last_seen?: number | null;
        custom_status?: PresenceResponse["custom_status"];
        spotify?: PresenceResponse["spotify"];
        primary_activity?: PresenceResponse["primary_activity"];
      } | null> => {
        if (!botUrl) return null;
        try {
          const botRes = await fetch(`${botUrl}/presence/${id}`, {
            cache: "no-store",
            signal: AbortSignal.timeout(1500),
          });
          if (!botRes.ok) return null;
          return botRes.json();
        } catch {
          return null;
        }
      })(),
      (async (): Promise<string | null> => {
        try {
          return await redis.get(redisBadgesKey);
        } catch {
          return null;
        }
      })(),
    ]);

    if (!memberData) {
      const payload: PresenceResponse = {
        in_server: false,
        user: null,
        status: "offline",
      };
      await writeWidgetCache(cacheKey, payload, PRESENCE_CACHE_SECONDS);
      return NextResponse.json(payload, { headers: NO_STORE });
    }

    const discordUser = (memberData.user ||
      (memberData as unknown as DiscordUserFields)) as DiscordUserFields;

    const clan = discordUser.clan || memberData.clan || discordUser.primary_guild || null;

    let userProfileBadges: Array<{ id: string; description?: string; icon?: string }> = [];
    try {
      if (cachedBadgesRaw) {
        const parsed = JSON.parse(cachedBadgesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (Array.isArray(parsed[0])) {
            userProfileBadges = (parsed as Array<[string, string, string?]>).map(([bId, bIcon, bDesc]) => ({
              id: bId,
              icon: bIcon,
              description: bDesc || "",
            }));
          } else {
            userProfileBadges = parsed;
          }
        }
      }
    } catch {
    }

    // Only fetch on a cache miss; a cached "[]" means the user has no badges.
    if (cachedBadgesRaw == null) {
      const userToken = process.env.DISCORD_USER_TOKEN;

      if (userToken) {
        try {
          const exactSuperProps =
            "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZSwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE1MS4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTUxLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiZGlzY29yZC5jb20iLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo1OTQwMzEsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGwsImNsaWVudF9sYXVuY2hfaWQiOiI2ODU0ODYyZC02MmU2LTQ1MzItYjU0Mi03YThmMGQ0YTBiNDkiLCJsYXVuY2hfc2lnbmF0dXJlIjoiOTAxZTY5NDUtOTQ2Ni00MTRmLTllNjYtYjQ5NzEwZjQ1MTdjIiwiY2xpZW50X2hlYXJ0YmVhdF9zZXNzaW9uX2lkIjoiOGI5NzRjYWMtNTZmNi00NWY1LWE1OGUtNzNmMWJmOWFhNjQ3IiwiY2xpZW50X2FwcF9zdGF0ZSI6ImZvY3VzZWQifQ==";

          const headers: Record<string, string> = {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            Authorization: userToken,
            Priority: "u=1, i",
            Referer: "https://discord.com/channels/@me",
            "Sec-Ch-Ua": '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
            "X-Debug-Options": "bugReporterEnabled",
            "X-Discord-Locale": "en-US",
            "X-Discord-Timezone": "Asia/Calcutta",
            "X-Super-Properties": exactSuperProps,
          };

          const proxyOrigin = (process.env.DISCORD_PROXY_URL || "https://discord.com").replace(/\/$/, "");
          const targetEndpoint = `${proxyOrigin}/api/v9/users/${id}/profile?with_mutual_guilds=false&with_mutual_friends=false&with_mutual_friends_count=false`;

          const profileRes = await fetch(targetEndpoint, { headers });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const rawBadges = (profileData.badges || []) as Array<{ id: string; description?: string; icon?: string }>;

            userProfileBadges = rawBadges
              .filter((b) => Boolean(b.icon))
              .map((b) => ({
                id: b.id,
                description: b.description || "",
                icon: b.icon || "",
              }));

            const compactBadges = userProfileBadges.map((b) => [b.id, b.icon, b.description]);

            try {
              await redis.set(
                redisBadgesKey,
                JSON.stringify(compactBadges),
                "EX",
                BADGES_CACHE_TTL_SEC
              );
            } catch {
            }
          } else {
            console.error("[Discord User Token Status]", profileRes.status, await profileRes.text());
            // Back off for 10 min instead of retrying on every poll.
            await redis.set(redisBadgesKey, "[]", "EX", 600).catch(() => {});
          }
        } catch (e) {
          console.error("[Discord User Token Profile Error]", e);
          await redis.set(redisBadgesKey, "[]", "EX", 600).catch(() => {});
        }
      }
    }

    const payload: PresenceResponse = {
      in_server: true,
      user: {
        id: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar || null,
        avatar_decoration_data: discordUser.avatar_decoration_data
          ? { asset: discordUser.avatar_decoration_data.asset }
          : null,
        clan: clan
          ? {
              identity_guild_id: clan.identity_guild_id || clan.id || undefined,
              tag: clan.tag,
              badge: clan.badge,
            }
          : null,
        profile_badges: userProfileBadges,
      },
      status: presenceData?.status || "offline",
      last_seen: presenceData?.last_seen || null,
      custom_status: presenceData?.custom_status || null,
      spotify: presenceData?.spotify
        ? {
            song: presenceData.spotify.song,
            artist: presenceData.spotify.artist,
            album_art_url: resolveActivityImage(presenceData.spotify.album_art_url),
          }
        : null,
      primary_activity: presenceData?.primary_activity
        ? {
            name: presenceData.primary_activity.name,
            state: presenceData.primary_activity.state ?? null,
            details: presenceData.primary_activity.details ?? null,
            large_image_url: resolveActivityImage(presenceData.primary_activity.large_image_url),
            small_image_url: resolveActivityImage(presenceData.primary_activity.small_image_url),
          }
        : null,
    };
    await writeWidgetCache(cacheKey, payload, PRESENCE_CACHE_SECONDS);
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (err) {
    console.error("[Discord Presence API Error]", err);
    return NextResponse.json({ in_server: false, error: "Internal Server Error" }, { status: 500 });
  }
}
