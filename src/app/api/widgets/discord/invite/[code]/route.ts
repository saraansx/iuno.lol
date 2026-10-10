import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { readWidgetCache, writeWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export const dynamic = "force-dynamic";

export interface DiscordServerData {
  code: string;
  guild: {
    id: string;
    name: string;
    icon: string | null;
    banner: string | null;
    splash: string | null;
  } | null;
  approximate_member_count: number;
  approximate_presence_count: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = (code || "").trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");

  if (!cleanCode || !/^[a-zA-Z0-9-_]{1,32}$/.test(cleanCode)) {
    return NextResponse.json({ ok: false, error: "Invite code is invalid or expired" }, { status: 404 });
  }

  const cacheKey = widgetCacheKey("discord", "invite", cleanCode);
  const cached = await readWidgetCache<DiscordServerData>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, WIDGET_EDGE_CACHE);
  }

  try {
    const limited = await widgetRateLimit(req, "discord_invite");
    if (limited) return limited;

    const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(cleanCode)}?with_counts=true&with_expiration=true`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "iuno-presence-proxy/1.0",
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json({ ok: false, error: "Invite code is invalid or expired" }, { status: 404 });
    }

    if (!res.ok) {
      console.error("[Discord Invite API] upstream status:", res.status);
      return NextResponse.json({ ok: false, error: "Failed to fetch invite details from Discord" }, { status: 502 });
    }

    const data = await res.json();

    const guild = data.guild
      ? {
          id: data.guild.id,
          name: data.guild.name,
          icon: data.guild.icon ?? null,
          banner: data.guild.banner ?? null,
          splash: data.guild.splash ?? null,
        }
      : null;

    const result: DiscordServerData = {
      code: data.code || cleanCode,
      guild,
      approximate_member_count: data.approximate_member_count || 0,
      approximate_presence_count: data.approximate_presence_count || 0,
    };

    await writeWidgetCache(cacheKey, result);

    return NextResponse.json<DiscordServerData>(result);
  } catch (err) {
    console.error("[Discord Invite API Error]", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
