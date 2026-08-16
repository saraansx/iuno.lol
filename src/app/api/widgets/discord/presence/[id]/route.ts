import { NextRequest, NextResponse } from "next/server";

// NOTE: do not add `export const dynamic = "force-dynamic"` here. It rewrites every
// fetch in this route to `no-store`, which defeats the revalidate windows below and
// makes each request hit the Discord API twice. GET route handlers are uncached by
// default, and the bot fetch is explicitly `no-store`, so presence is always fresh.

interface PresenceResponse {
  in_server: boolean;
  user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    avatar_decoration_data?: {
      asset: string;
      sku_id?: string;
    } | null;
    clan?: {
      identity_guild_id?: string;
      identity_enabled?: boolean;
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
    album?: string | null;
    album_art_url?: string | null;
  } | null;
  primary_activity?: {
    name: string;
    type: number;
    state?: string | null;
    details?: string | null;
    large_image_url?: string | null;
    large_text?: string | null;
    small_image_url?: string | null;
    small_text?: string | null;
  } | null;
  activities?: Array<{
    name: string;
    type: number;
    state?: string;
    details?: string;
  }>;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^\d{17,20}$/.test(id)) {
    return NextResponse.json({ in_server: false, error: "Invalid Discord ID" }, { status: 400 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  // Hosted presence worker origin, e.g. https://bot.iuno.lol
  const botUrl = (process.env.DISCORD_BOT_URL || "").replace(/\/$/, "");

  if (!botToken || !guildId) {
    return NextResponse.json({ in_server: false, error: "Server configuration missing" }, { status: 500 });
  }

  try {
    // 1. Check if user is a member of iuno Discord guild via REST API.
    // Cached briefly — membership / avatar / clan tag rarely change, so repeat
    // page views and concurrent viewers of the same profile share one lookup.
    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${id}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "User-Agent": "iuno-presence-proxy/1.0",
        },
        next: { revalidate: 60 },
      }
    );

    if (memberRes.status === 404) {
      // User is not in the Discord server
      return NextResponse.json<PresenceResponse>({
        in_server: false,
        user: null,
        status: "offline",
      });
    }

    if (!memberRes.ok) {
      return NextResponse.json<PresenceResponse>({
        in_server: false,
        user: null,
        status: "offline",
      });
    }

    const memberData = await memberRes.json();
    const discordUser = memberData.user || memberData;

    // 2. Fetch live presence from the hosted Bot gateway worker (Zero DB / Zero Redis)
    let presenceData: {
      status?: "online" | "idle" | "dnd" | "offline";
      custom_status?: PresenceResponse["custom_status"];
      spotify?: PresenceResponse["spotify"];
      primary_activity?: PresenceResponse["primary_activity"];
      activities?: PresenceResponse["activities"];
    } | null = null;

    if (botUrl) {
      try {
        const botRes = await fetch(`${botUrl}/presence/${id}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        });
        if (botRes.ok) {
          presenceData = await botRes.json();
        }
      } catch {
        // Worker unreachable or slow — fall back to offline rather than failing the widget
      }
    }

    const clan = discordUser.clan || memberData.clan || discordUser.primary_guild || null;

    // 3. Badges lookup: Fallback to official public_flags if user token is blocked/fails
    let userProfileBadges: Array<{ id: string; description?: string; icon?: string }> = [];
    const userToken = process.env.DISCORD_USER_TOKEN;

    if (userToken) {
      try {
        const profileRes = await fetch(
          `https://discord.com/api/v10/users/${id}/profile?with_mutual_guilds=false&guild_id=${guildId}`,
          {
            headers: {
              Authorization: userToken,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            },
            next: { revalidate: 300 },
          }
        );

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          userProfileBadges = profileData.badges || [];
        }
      } catch {
        // User profile fetch failed
      }
    }

    // If private profile endpoint failed or was blocked, compute badges from public_flags & premium_type
    if (userProfileBadges.length === 0 && discordUser) {
      const flags = Number(discordUser.public_flags || discordUser.flags || 0);

      // Discord Public Flags mapping
      const FLAG_BADGES: Array<{ flag: number; id: string; description: string; icon: string }> = [
        { flag: 1 << 0, id: "discord_employee", description: "Discord Staff", icon: "staff" },
        { flag: 1 << 1, id: "partnered_server_owner", description: "Partnered Server Owner", icon: "partner" },
        { flag: 1 << 2, id: "hypesquad_events", description: "HypeSquad Events", icon: "hypesquad" },
        { flag: 1 << 3, id: "bug_hunter_level_1", description: "Bug Hunter Level 1", icon: "bug_hunter_level_1" },
        { flag: 1 << 6, id: "house_bravery", description: "HypeSquad Bravery", icon: "8a88d63823d8a71cd5e390baa45efa02" },
        { flag: 1 << 7, id: "house_brilliance", description: "HypeSquad Brilliance", icon: "011940fd013da3f7fb926e4a1cd2e618" },
        { flag: 1 << 8, id: "house_balance", description: "HypeSquad Balance", icon: "3aa41de486fa12454c3761e8e223442e" },
        { flag: 1 << 9, id: "early_supporter", description: "Early Supporter", icon: "7060786766ace08b3949153e61165e8e" },
        { flag: 1 << 14, id: "bug_hunter_level_2", description: "Bug Hunter Level 2", icon: "bug_hunter_level_2" },
        { flag: 1 << 17, id: "verified_bot_developer", description: "Early Verified Bot Developer", icon: "6df5892e0f358b52b8b524b6664d7846" },
        { flag: 1 << 18, id: "certified_moderator", description: "Discord Certified Moderator", icon: "certified_moderator" },
        { flag: 1 << 22, id: "active_developer", description: "Active Developer", icon: "6bdcbe2b6877ce961323e444e990c1cb" },
      ];

      for (const item of FLAG_BADGES) {
        if ((flags & item.flag) === item.flag) {
          userProfileBadges.push({
            id: item.id,
            description: item.description,
            icon: item.icon,
          });
        }
      }

      // Nitro & Boost badge fallback from avatar decoration or premium data
      if (discordUser.avatar_decoration_data) {
        userProfileBadges.push({
          id: "premium",
          description: "Subscriber",
          icon: "2ba85e8026a8614b640c2837bcd2177b",
        });
      }
    }

    return NextResponse.json<PresenceResponse>({
      in_server: true,
      user: {
        id: discordUser.id,
        username: discordUser.username,
        global_name: discordUser.global_name || memberData.nick || null,
        avatar: discordUser.avatar || null,
        avatar_decoration_data: discordUser.avatar_decoration_data || null,
        clan: clan
          ? {
              identity_guild_id: clan.identity_guild_id || clan.id || undefined,
              identity_enabled: clan.identity_enabled,
              tag: clan.tag,
              badge: clan.badge,
            }
          : null,
        profile_badges: userProfileBadges,
      },
      status: presenceData?.status || "offline",
      custom_status: presenceData?.custom_status || null,
      spotify: presenceData?.spotify || null,
      primary_activity: presenceData?.primary_activity || null,
      activities: presenceData?.activities || [],
    });
  } catch (err) {
    console.error("[Discord Presence API Error]", err);
    return NextResponse.json({ in_server: false, error: "Internal Server Error" }, { status: 500 });
  }
}
