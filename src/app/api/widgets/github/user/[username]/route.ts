import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export interface GitHubUserData {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
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

    const cacheKey = `github:user:${cleanUsername}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    } catch (e) {
      console.warn("[Redis Cache Miss/Error]", e);
    }

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      "User-Agent": "iuno-profile-widget/1.0",
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers,
      next: { revalidate: 900 },
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
      bio: data.bio || null,
      followers: Number(data.followers || 0),
      following: Number(data.following || 0),
      public_repos: Number(data.public_repos || 0),
      html_url: data.html_url || `https://github.com/${data.login}`,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", 900); // 15 mins TTL
    } catch (e) {
      console.warn("[Redis Cache Set Error]", e);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GitHub User Route Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
