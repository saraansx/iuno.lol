import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req.headers);
    const rateKey = ip ? `discord_lookup:ip:${ip}` : `discord_lookup:user:${sessionUserId}`;
    const rate = await checkRateLimit(rateKey, 5, 60, 60);
    if (!rate.ok) {
      return NextResponse.json({ ok: false, error: "Too many attempts. Please wait 60 seconds." }, { status: 429 });
    }

    const { type, id } = await req.json();
    if (!id || typeof id !== "string" || !/^\d{17,20}$/.test(id)) {
      return NextResponse.json({ ok: false, error: "Invalid Discord ID format" });
    }

    if (type === "server") {
      // Validate server widget via Discord's public widget JSON API
      const res = await fetch(`https://discord.com/api/v10/guilds/${id}/widget.json`, {
        headers: { "User-Agent": "iuno-profile-widget/1.0" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ok: true,
          data: {
            name: data.name,
            instant_invite: data.instant_invite,
            presence_count: data.presence_count,
          },
        });
      } else if (res.status === 403 || res.status === 404) {
        return NextResponse.json({
          ok: false,
          error: "Server not found or Widget disabled in Server Settings → Widget",
        });
      } else {
        return NextResponse.json({ ok: false, error: "Could not verify Discord server" });
      }
    }

    // Presence type: Validate user via bot token or public gateway
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (botToken) {
      const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
        headers: {
          Authorization: `Bot ${botToken}`,
          "User-Agent": "iuno-profile-widget/1.0",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ok: true,
          data: {
            id: data.id,
            username: data.username,
            global_name: data.global_name,
            avatar: data.avatar,
            avatar_decoration_data: data.avatar_decoration_data || null,
            public_flags: data.public_flags || 0,
          },
        });
      } else if (res.status === 404) {
        return NextResponse.json({ ok: false, error: "Discord user not found" });
      }
    }

    // Fallback: Check snowflake timestamp math to ensure ID belongs to real Discord Epoch
    const snowflake = BigInt(id);
    const discordEpoch = BigInt(1420070400000);
    const timestamp = Number((snowflake >> BigInt(22)) + discordEpoch);
    const now = Date.now();

    if (timestamp > 1420070400000 && timestamp <= now + 86400000) {
      return NextResponse.json({ ok: true, data: { id } });
    }

    return NextResponse.json({ ok: false, error: "Invalid Discord snowflake ID" });
  } catch (err) {
    console.error("[Discord Validation]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
