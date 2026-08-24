import { NextRequest, NextResponse } from "next/server";
import { readWidgetCache, writeWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";

export interface GitHubUserData {
  login: string;
  name: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = (username || "").trim().toLowerCase();

    if (!cleanUsername || !/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid GitHub username" }, { status: 400 });
    }

    const cacheKey = widgetCacheKey("github", "user", cleanUsername);
    const cached = await readWidgetCache<GitHubUserData>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "GitHub API token not configured" }, { status: 500 });
    }

    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": "iuno-profile-widget/1.0",
        Accept: "application/vnd.github.v3+json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to fetch GitHub user" }, { status: res.status });
    }

    const data = await res.json();
    const result: GitHubUserData = {
      login: data.login,
      name: data.name || null,
      avatar_url: data.avatar_url,
      followers: Number(data.followers || 0),
      following: Number(data.following || 0),
      public_repos: Number(data.public_repos || 0),
      html_url: data.html_url || `https://github.com/${data.login}`,
    };

    await writeWidgetCache(cacheKey, result);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GitHub User Route Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
