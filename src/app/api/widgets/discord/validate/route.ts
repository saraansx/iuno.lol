import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { getSessionUserId } from "@/lib/auth/session";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export async function POST(req: NextRequest) {
  try {
    const limited = await widgetRateLimit(req, "discord_validate", 20);
    if (limited) return limited;

    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false, error: "Identifier is required" });
    }

    if (type === "server") {
      const cleanCode = id.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");
      if (!cleanCode || !/^[a-zA-Z0-9-_]{2,32}$/.test(cleanCode)) {
        return NextResponse.json({ ok: false, error: "Invalid Discord invite code format" });
      }

      const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(cleanCode)}?with_counts=true`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { "User-Agent": "iuno-presence-proxy/1.0" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ok: true,
          data: {
            code: data.code || cleanCode,
            guild: data.guild || null,
            approximate_member_count: data.approximate_member_count || 0,
            approximate_presence_count: data.approximate_presence_count || 0,
          },
        });
      } else if (res.status === 404) {
        return NextResponse.json({
          ok: false,
          error: "Invite code is invalid or expired",
        });
      } else {
        return NextResponse.json({ ok: false, error: "Could not verify Discord server invite" });
      }
    }

    if (!/^\d{17,20}$/.test(id)) {
      return NextResponse.json({ ok: false, error: "Invalid Discord ID format" });
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (botToken) {
      const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
