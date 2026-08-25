import { NextRequest, NextResponse } from "next/server";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";

export interface SteamUserData {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarfull: string;
  avatarframe?: string | null;
  animated_avatar?: string | null;
  profile_background?: string | null;
  profile_background_webm?: string | null;
  profile_background_mp4?: string | null;
  mini_profile_background?: string | null;
  mini_profile_background_webm?: string | null;
  mini_profile_background_mp4?: string | null;
  personastate: number; // 0 - Offline, 1 - Online, 2 - Busy, 3 - Away, 4 - Snooze, 5 - looking to trade, 6 - looking to play
  gameextrainfo?: string | null;
  level?: number | null;
  game_count?: number | null;
  total_playtime_hours?: number | null;
  member_since?: string | null;
  custom_status?: string | null;
  is_private?: boolean;
}

export async function fetchSteamUserData(cleanInput: string): Promise<SteamUserData | null> {
  const normalized = cleanInput
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
    .replace(/\/$/, "");

  if (!normalized) return null;

  let steamid = /^\d{17}$/.test(normalized) ? normalized : "";
  let personaname = normalized;
  const profileurl = `https://steamcommunity.com/${steamid ? `profiles/${steamid}` : `id/${normalized}`}/`;
  let avatar = "";
  let avatarframe: string | null = null;
  let animatedAvatar: string | null = null;
  let profileBackground: string | null = null;
  let profileBackgroundWebm: string | null = null;
  let profileBackgroundMp4: string | null = null;
  let miniProfileBackground: string | null = null;
  let miniProfileBackgroundWebm: string | null = null;
  let miniProfileBackgroundMp4: string | null = null;
  let personastate = 0;
  let gameextrainfo: string | null = null;
  let level: number | null = null;
  let gameCount: number | null = null;
  let totalPlaytimeHours: number | null = null;
  let memberSince: string | null = null;
  let customStatus: string | null = null;
  let isPrivate = false;
  let fetched = false;

  const isNumeric = /^\d{17}$/.test(normalized);
  const targetUrl = isNumeric
    ? `https://steamcommunity.com/profiles/${normalized}/`
    : `https://steamcommunity.com/id/${normalized}/`;

  // 1. Fetch public profile HTML page
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "Steam_Language=english; timezoneOffset=0,0",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const html = await res.text();

      // Check if profile exists
      if (!html.includes("The specified profile could not be found") && !html.includes("error_ctn")) {
        fetched = true;

        // Private profile check
        if (
          html.includes("This profile is private") ||
          html.includes("profile_private_info") ||
          html.includes("profile_private")
        ) {
          isPrivate = true;
        }

        // SteamID64 extract
        const steamIdMatch =
          html.match(/"steamid"\s*:\s*"(\d{17})"/i) ||
          html.match(/g_rgProfileData\s*=\s*\{.*?"steamid"\s*:\s*"(\d{17})"/i) ||
          html.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
        if (steamIdMatch && steamIdMatch[1]) {
          steamid = steamIdMatch[1];
        }

        // Persona name
        const nameMatch =
          html.match(/<span class="actual_persona_name">([^<]+)<\/span>/i) ||
          html.match(/<span class="persona_name[^"]*">([^<]+)<\/span>/i) ||
          html.match(/<title>Steam Community\s*::\s*([^<]+)<\/title>/i);
        if (nameMatch && nameMatch[1]) {
          personaname = nameMatch[1].trim();
        }

        // Status State
        if (html.includes("profile_in_game")) {
          personastate = 1;
          const gameMatch =
            html.match(/<div class="profile_in_game_name">([^<]+)<\/div>/i) ||
            html.match(/<div class="profile_in_game_header">In-Game<\/div>\s*<div class="profile_in_game_name">([^<]+)<\/div>/i);
          if (gameMatch && gameMatch[1]) {
            gameextrainfo = gameMatch[1].trim();
          }
        } else if (html.includes("online")) {
          personastate = 1;
        } else if (html.includes("offline")) {
          personastate = 0;
        }

        // Avatar Frame
        const frameMatch =
          html.match(/<div class="profile_avatar_frame">[\s\S]*?<img[^>]*src="([^"]+)"/i) ||
          html.match(/<div class="profile_avatar_frame">[\s\S]*?<source[^>]*srcset="([^"\s]+)/i) ||
          html.match(/<img class="avatar_frame"[^>]*src="([^"]+)"/i);
        if (frameMatch && frameMatch[1]) {
          avatarframe = frameMatch[1];
        }

        // Header Avatar & Animated Avatar (exclude frame images)
        const headerAvatarMatch = html.match(/<div class="playerAvatar profile_header_size[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
        if (headerAvatarMatch) {
          const rawHeader = headerAvatarMatch[1];
          const withoutFrame = rawHeader.replace(/<div class="profile_avatar_frame">[\s\S]*?<\/div>/gi, "");

          // Animated Avatar (GIF/video/srcset inside picture or img)
          const animatedMatch =
            withoutFrame.match(/<img[^>]*srcset="([^"\s]+)/i) ||
            withoutFrame.match(/<img[^>]*src="([^"]+\.gif[^"]*)"/i) ||
            withoutFrame.match(/<source[^>]*srcset="([^"\s]+)/i);
          if (animatedMatch && animatedMatch[1]) {
            animatedAvatar = animatedMatch[1];
          }

          // Static Avatar (fallback if animated not active or static img tag)
          const staticMatch =
            withoutFrame.match(/<source media="\(prefers-reduced-motion: reduce\)" srcset="([^"\s]+)"/i) ||
            withoutFrame.match(/<img[^>]*src="([^"]+)"/i);
          if (staticMatch && staticMatch[1]) {
            avatar = staticMatch[1];
          } else if (animatedAvatar) {
            avatar = animatedAvatar;
          }
        }

        // Clean static avatar if animated GIF matched as static avatar
        const metaImg = html.match(/<link rel="image_src" href="([^"]+)"/i);
        const metaAvatar = metaImg && metaImg[1] ? metaImg[1] : null;

        if (metaAvatar) {
          if (!avatar || avatar.endsWith(".gif") || avatar.includes("/community_assets/")) {
            avatar = metaAvatar;
          }
        }

        // Fallback for avatar if not found in header size box
        if (!avatar) {
          const avatarMatch =
            html.match(/<div class="playerAvatarAutoSizeInner">[\s\S]*?<img src="([^"]+)"/i) ||
            html.match(/<div class="playerAvatar[^"]*">[\s\S]*?<img src="([^"]+)"/i) ||
            html.match(/<img class="full_avatar"[^>]*src="([^"]+)"/i);
          if (avatarMatch && avatarMatch[1]) {
            avatar = avatarMatch[1];
          }
        }

        // Level
        const levelMatch =
          html.match(/<span class="friendPlayerLevelNum">(\d+)<\/span>/i) ||
          html.match(/<div class="persona_level[^"]*">[\s\S]*?<span class="friendPlayerLevelNum">(\d+)<\/span>/i) ||
          html.match(/class="persona_level"[^>]*>[\s\S]*?(\d+)[\s\S]*?<\/div>/i);
        if (levelMatch && levelMatch[1]) {
          level = parseInt(levelMatch[1], 10);
        }

        // Game Count (Showcase vs Sidebar games count)
        const showcaseGamesMatch = html.match(/<div class="showcase_stats_count">([\d,]+)<\/div>\s*<div class="showcase_stats_label">Games Owned<\/div>/i);
        const gamesMatch =
          html.match(/<span class="count_link_label">Games<\/span>\s*<span class="profile_count_link_total">\s*([\d,]+)\s*<\/span>/i) ||
          html.match(/href="[^"]*\/games\/\?tab=all"[^>]*>[\s\S]*?<span class="profile_count_link_total">\s*([\d,]+)\s*<\/span>/i) ||
          html.match(/Games\s*<span class="profile_count_link_total">\s*([\d,]+)\s*<\/span>/i) ||
          html.match(/class="count_link_label"[^>]*>Games[\s\S]*?<span class="profile_count_link_total">\s*([\d,]+)\s*<\/span>/i);

        if (showcaseGamesMatch && showcaseGamesMatch[1]) {
          gameCount = parseInt(showcaseGamesMatch[1].replace(/,/g, ""), 10);
        } else if (gamesMatch && gamesMatch[1]) {
          gameCount = parseInt(gamesMatch[1].replace(/,/g, ""), 10);
        }

        // Member Since
        const memberMatch =
          html.match(/Member since\s*([^<\n]+)/i) ||
          html.match(/<div class="header_real_name ellipsis">[\s\S]*?Member since\s*([^<]+)/i) ||
          html.match(/Member since:\s*([^<\n]+)/i);
        if (memberMatch && memberMatch[1]) {
          const rawMember = memberMatch[1].trim().replace(/\.$/, "");
          const yearMatch = rawMember.match(/\b(20\d\d|19\d\d)\b/);
          memberSince = yearMatch ? yearMatch[1] : rawMember;
        }

        // Custom status / Summary
        const summaryMatch = html.match(/<div class="profile_summary">([\s\S]*?)<\/div>/i);
        if (summaryMatch && summaryMatch[1]) {
          customStatus = summaryMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 100);
        }

        // Profile Background Image
        const bgMatch =
          html.match(/has_profile_background[\s\S]*?background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i) ||
          html.match(/class="profile_background_image_content[^"]*"[\s\S]*?background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i) ||
          html.match(/background-image:\s*url\(\s*['"]?(https:\/\/[^'")]+steamstatic\.com\/steamcommunity\/public\/images\/items\/[^'")]+)['"]?\s*\)/i);
        if (bgMatch && bgMatch[1]) {
          profileBackground = bgMatch[1];
        }

        // Full Page Profile Background / Movie / Video Poster
        const videoFilm =
          html.match(/<div class="profile_animated_background">([\s\S]*?)<\/video>/i) ||
          html.match(/<video[^>]*class="profile_background_film"[^>]*>([\s\S]*?)<\/video>/i);

        if (videoFilm) {
          const rawVid = videoFilm[1] || videoFilm[0];
          const posterMatch = rawVid.match(/poster="([^"]+)"/i);
          if (posterMatch && posterMatch[1]) profileBackground = posterMatch[1];

          const webmMatch = rawVid.match(/<source[^>]*src="([^"]+\.webm[^"]*)"/i);
          if (webmMatch && webmMatch[1]) profileBackgroundWebm = webmMatch[1];

          const mp4Match = rawVid.match(/<source[^>]*src="([^"]+\.mp4[^"]*)"/i);
          if (mp4Match && mp4Match[1]) profileBackgroundMp4 = mp4Match[1];
        }

        if (!profileBackground) {
          const videoPoster =
            html.match(/<div class="profile_animated_background">[\s\S]*?poster="([^"]+)"/i) ||
            html.match(/<video[^>]*class="profile_background_film"[^>]*poster="([^"]+)"/i) ||
            html.match(/<video[^>]*poster="([^"]+)"/i);
          if (videoPoster && videoPoster[1]) {
            profileBackground = videoPoster[1];
          }
        }

        // 2. Fetch miniprofile for distinct mini_profile_background
        const miniprofileMatch = html.match(/data-miniprofile="(\d+)"/i);
        if (miniprofileMatch && miniprofileMatch[1]) {
          try {
            const miniRes = await fetch(`https://steamcommunity.com/miniprofile/${miniprofileMatch[1]}`, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
              cache: "no-store",
            });
            if (miniRes.ok) {
              const miniHtml = await miniRes.text();
              const miniBgMatch =
                miniHtml.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i) ||
                miniHtml.match(/<div class="miniprofile_background">[\s\S]*?<img[^>]*src="([^"]+)"/i);
              if (miniBgMatch && miniBgMatch[1]) {
                miniProfileBackground = miniBgMatch[1];
              }

              const miniWebmMatch = miniHtml.match(/<video[^>]*class="miniprofile_nameplate"[^>]*>[\s\S]*?<source[^>]*src="([^"]+\.webm[^"]*)"/i);
              if (miniWebmMatch && miniWebmMatch[1]) miniProfileBackgroundWebm = miniWebmMatch[1];

              const miniMp4Match = miniHtml.match(/<video[^>]*class="miniprofile_nameplate"[^>]*>[\s\S]*?<source[^>]*src="([^"]+\.mp4[^"]*)"/i);
              if (miniMp4Match && miniMp4Match[1]) miniProfileBackgroundMp4 = miniMp4Match[1];

              if (!miniProfileBackground && (miniProfileBackgroundWebm || miniProfileBackgroundMp4)) {
                miniProfileBackground = profileBackground;
              }
            }
          } catch (e) {
            console.warn("[Steam Miniprofile Fetch Error]", e);
          }
        }
      }
    }
  } catch (e) {
    console.warn("[Steam HTML Scrape Error]", e);
  }

  // 2. Fetch public XML endpoint for additional fields fallback
  if (!fetched || !avatar || !personaname) {
    try {
      const xmlUrl = isNumeric
        ? `https://steamcommunity.com/profiles/${normalized}?xml=1`
        : `https://steamcommunity.com/id/${normalized}?xml=1`;

      const res = await fetch(xmlUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const xml = await res.text();
        if (xml.includes("<profile>")) {
          fetched = true;

          const extract = (tag: string) => {
            const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, "i")) ||
                      xml.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, "i"));
            return m ? m[1].trim() : null;
          };

          const sId = extract("steamID64");
          if (sId) steamid = sId;

          const pName = extract("steamID");
          if (pName && (!personaname || personaname === normalized)) personaname = pName;

          const av = extract("avatarFull") || extract("avatarMedium") || extract("avatarIcon");
          if (av && !avatar) avatar = av;

          const state = extract("onlineState");
          if (state === "in-game") {
            personastate = 1;
            const gName = extract("gameName");
            if (gName) gameextrainfo = gName;
          } else if (state === "online") {
            personastate = 1;
          } else if (state === "offline") {
            personastate = 0;
          }

          const member = extract("memberSince");
          if (member && !memberSince) {
            const y = member.match(/\b(20\d\d|19\d\d)\b/);
            memberSince = y ? y[1] : member;
          }

          const hours = extract("hoursPlayed2Wk");
          if (hours) {
            totalPlaytimeHours = parseFloat(hours);
          }
        }
      }
    } catch (e) {
      console.warn("[Steam XML Scrape Error]", e);
    }
  }

  // Fallback default avatar if none found
  if (!avatar) {
    avatar = "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
  }

  // Mini profile background fallback to profileBackground
  miniProfileBackground = profileBackground;

  if (!fetched && !steamid && !personaname) {
    return null;
  }

  const result: SteamUserData = {
    steamid: steamid || normalized,
    personaname: personaname || normalized,
    profileurl: profileurl || `https://steamcommunity.com/id/${normalized}/`,
    avatar,
    avatarfull: avatar,
    avatarframe: avatarframe || null,
    animated_avatar: animatedAvatar || null,
    profile_background: profileBackground || null,
    profile_background_webm: profileBackgroundWebm || null,
    profile_background_mp4: profileBackgroundMp4 || null,
    mini_profile_background: miniProfileBackground || null,
    mini_profile_background_webm: miniProfileBackgroundWebm || null,
    mini_profile_background_mp4: miniProfileBackgroundMp4 || null,
    personastate,
    gameextrainfo,
    level,
    game_count: gameCount,
    total_playtime_hours: totalPlaytimeHours,
    member_since: memberSince,
    custom_status: customStatus,
    is_private: isPrivate,
  };

  return result;
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
