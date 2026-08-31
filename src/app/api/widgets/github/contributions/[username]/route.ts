import { NextRequest, NextResponse } from "next/server";
import { widgetRateLimit } from "@/lib/widget-guard";
import { readWidgetCache, writeWidgetCache, widgetCacheKey, WIDGET_EDGE_CACHE } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

interface ContributionsPayload {
  contributions: { level: number }[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const limited = await widgetRateLimit(req, "github_contributions");
    if (limited) return limited;

    const { username } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const cacheKey = widgetCacheKey("github", "contributions", cleanUsername);
    const cached = await readWidgetCache<ContributionsPayload>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, WIDGET_EDGE_CACHE);
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
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

    const days: { level: number }[] = [];

    for (const week of weeks) {
      for (const day of week.contributionDays || []) {
        days.push({
          level: levelMap[day.contributionLevel] ?? 0,
        });
      }
    }

    const payload: ContributionsPayload = { contributions: days };
    await writeWidgetCache(cacheKey, payload);

    return NextResponse.json(payload, WIDGET_EDGE_CACHE);
  } catch (err) {
    console.error("[GitHub Contributions Route Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
