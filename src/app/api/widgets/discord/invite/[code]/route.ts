import { NextRequest, NextResponse } from "next/server";

// Cache invite data in memory / Next.js ISR window
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

  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${encodeURIComponent(cleanCode)}?with_counts=true&with_expiration=true`, {
      headers: {
        "User-Agent": "iuno-presence-proxy/1.0",
      },
      next: { revalidate: 600 }, // 10 min cache
    });

    if (res.status === 404) {
      return NextResponse.json({ ok: false, error: "Invite code is invalid or expired" }, { status: 404 });
    }

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Failed to fetch invite details from Discord" }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json<DiscordServerData>({
      code: data.code || cleanCode,
      guild: data.guild || null,
      approximate_member_count: data.approximate_member_count || 0,
      approximate_presence_count: data.approximate_presence_count || 0,
      inviter: data.inviter || null,
    });
  } catch (err) {
    console.error("[Discord Invite API Error]", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
