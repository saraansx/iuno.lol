import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const cacheKey = `github:contributions:${cleanUsername}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    } catch (e) {
      console.warn("[Redis Cache Miss/Error]", e);
    }

    // Fetch public contributions calendar SVG/HTML from GitHub
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(cleanUsername)}?y=last`, {
      next: { revalidate: 3600 },
    });

    let days: { date: string; count: number; level: number }[] = [];

    if (res.ok) {
      const data = await res.json();
      if (data?.contributions && Array.isArray(data.contributions)) {
        // Take last 70 days (~10 weeks) of contribution data
        days = data.contributions.slice(-70).map((d: { date: string; count: number; level: number }) => ({
          date: d.date,
          count: Number(d.count || 0),
          level: Number(d.level || 0), // 0 to 4
        }));
      }
    }

    // Fallback if third-party API unreachable: generate 70 empty slots
    if (!days.length) {
      days = Array.from({ length: 70 }, () => ({
        date: "",
        count: 0,
        level: 0,
      }));
    }

    try {
      await redis.set(cacheKey, JSON.stringify({ contributions: days }), "EX", 3600); // 1 hr TTL
    } catch (e) {
      console.warn("[Redis Cache Set Error]", e);
    }

    return NextResponse.json({ contributions: days });
  } catch (err) {
    console.error("[GitHub Contributions Route Error]", err);
    return NextResponse.json({
      contributions: Array.from({ length: 70 }, () => ({ date: "", count: 0, level: 0 })),
    });
  }
}
