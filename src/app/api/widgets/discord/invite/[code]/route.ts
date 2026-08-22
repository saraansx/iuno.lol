import { NextRequest, NextResponse } from "next/server";
import { readWidgetCache, writeWidgetCache, widgetCacheKey } from "@/lib/widget-cache";

// Responses are never statically cached by Next.js; freshness is controlled by the
// Redis cache below (1 hour), so member counts can lag by up to that window.
export const dynamic = "force-dynamic";

export interface DiscordServerData {
  code: string;
  guild: {
    id: string;
    name: string;
    icon: string | null;
    banner: string | null;
    splash: string | null;
    description: string | null;
    features: string[];
    verification_level: number;
    vanity_url_code: string | null;
  } | null;
  approximate_member_count: number;
  approximate_presence_count: number;
  inviter?: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = (code || "").trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");

  if (!cleanCode) {
    return NextResponse.json({ ok: false, error: "Invite code is required" }, { status: 400 });
  }

  const cacheKey = widgetCacheKey("discord", "invite", cleanCode);
  const cached = await readWidgetCache<DiscordServerData>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(cleanCode)}?with_counts=true&with_expiration=true`, {
      headers: {
        "User-Agent": "iuno-presence-proxy/1.0",
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json({ ok: false, error: "Invite code is invalid or expired" }, { status: 404 });
    }

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Failed to fetch invite details from Discord" }, { status: res.status });
    }

    const data = await res.json();

    const result: DiscordServerData = {
      code: data.code || cleanCode,
      guild: data.guild || null,
      approximate_member_count: data.approximate_member_count || 0,
      approximate_presence_count: data.approximate_presence_count || 0,
      inviter: data.inviter || null,
    };

    await writeWidgetCache(cacheKey, result);

    return NextResponse.json<DiscordServerData>(result);
  } catch (err) {
    console.error("[Discord Invite API Error]", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
