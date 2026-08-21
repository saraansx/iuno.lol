import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false, error: "Identifier is required" });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ ok: false, error: "GitHub API token not configured" }, { status: 500 });
    }

    const headers: Record<string, string> = {
      "User-Agent": "iuno-profile-widget/1.0",
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
    };

    if (type === "github-repo" || type === "repo") {
      const cleanRepo = id.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "");
      const parts = cleanRepo.split("/");
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return NextResponse.json({ ok: false, error: "Invalid repository format. Use 'owner/repo'" });
      }

      const [owner, repo] = parts;
      const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          ok: true,
          data: {
            full_name: data.full_name,
            name: data.name,
            owner: {
              login: data.owner?.login,
              avatar_url: data.owner?.avatar_url,
            },
            stargazers_count: data.stargazers_count,
            forks_count: data.forks_count,
            subscribers_count: data.subscribers_count,
            open_issues_count: data.open_issues_count,
            language: data.language,
            description: data.description,
            html_url: data.html_url,
          },
        });
      } else if (res.status === 404) {
        return NextResponse.json({ ok: false, error: "GitHub repository not found" });
      } else {
        return NextResponse.json({ ok: false, error: "Could not verify GitHub repository" });
      }
    }

    // GitHub User validation
    const cleanUsername = id.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "");
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanUsername)) {
      return NextResponse.json({ ok: false, error: "Invalid GitHub username format" });
    }

    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ok: true,
        data: {
          login: data.login,
          name: data.name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          followers: data.followers,
          following: data.following,
          public_repos: data.public_repos,
          html_url: data.html_url,
        },
      });
    } else if (res.status === 404) {
      return NextResponse.json({ ok: false, error: "GitHub user not found" });
    } else {
      return NextResponse.json({ ok: false, error: "Could not verify GitHub user" });
    }
  } catch (err) {
    console.error("[GitHub Validation Error]", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}
