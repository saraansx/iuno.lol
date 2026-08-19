import { NextRequest, NextResponse } from "next/server";

export interface GitHubRepoData {
  full_name: string;
  name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
  subscribers_count: number;
  open_issues_count: number;
  language: string | null;
  description: string | null;
  html_url: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;
    const cleanOwner = (owner || "").trim();
    const cleanRepo = (repo || "").trim();

    if (!cleanOwner || !cleanRepo) {
      return NextResponse.json({ error: "Invalid owner/repo format" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "GitHub API token not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(cleanOwner)}/${encodeURIComponent(cleanRepo)}`,
      {
        headers: {
          "User-Agent": "iuno-profile-widget/1.0",
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to fetch repository" }, { status: res.status });
    }

    const data = await res.json();
    const result: GitHubRepoData = {
      full_name: data.full_name,
      name: data.name,
      owner: {
        login: data.owner?.login || cleanOwner,
        avatar_url: data.owner?.avatar_url || `https://github.com/${cleanOwner}.png`,
      },
      stargazers_count: Number(data.stargazers_count || 0),
      forks_count: Number(data.forks_count || 0),
      subscribers_count: Number(data.subscribers_count || 0),
      open_issues_count: Number(data.open_issues_count || 0),
      language: data.language || null,
      description: data.description || null,
      html_url: data.html_url || `https://github.com/${cleanOwner}/${cleanRepo}`,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GitHub Repo Route Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
