import { NextRequest, NextResponse } from "next/server";
import { readWidgetCache, writeWidgetCache, widgetCacheKey } from "@/lib/widget-cache";

interface ContributionsPayload {
  contributions: { date: string; count: number; level: number }[];
}

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

    const cacheKey = widgetCacheKey("github", "contributions", cleanUsername);
    const cached = await readWidgetCache<ContributionsPayload>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const query = `
      query ($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "User-Agent": "iuno-profile-widget/1.0",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { login: cleanUsername },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub contributions" }, { status: res.status });
    }

    const json = await res.json();
    const weeks =
      json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

    const levelMap: Record<string, number> = {
      NONE: 0,
      FIRST_QUARTILE: 1,
      SECOND_QUARTILE: 2,
      THIRD_QUARTILE: 3,
      FOURTH_QUARTILE: 4,
    };

    const days: { date: string; count: number; level: number }[] = [];

    for (const week of weeks) {
      for (const day of week.contributionDays || []) {
        days.push({
          date: day.date,
          count: Number(day.contributionCount || 0),
          level: levelMap[day.contributionLevel] ?? 0,
        });
      }
    }

    const payload: ContributionsPayload = { contributions: days };
    await writeWidgetCache(cacheKey, payload);

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[GitHub Contributions Route Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
