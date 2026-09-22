import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { ICONIFY_API } from "@/lib/links";

const ICON_NAME_RE = /^[a-z0-9]+[a-z0-9-]*:[a-z0-9][a-z0-9-:]*$/i;

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim().slice(0, 100);
  if (!query) {
    return NextResponse.json({ icons: [] });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${ICONIFY_API}/search?query=${encodeURIComponent(query)}&limit=48`,
      { next: { revalidate: 3600 } }
    );
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }

  let data: { icons?: unknown };
  try {
    data = (await upstream.json()) as { icons?: unknown };
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }

  const icons = Array.isArray(data.icons)
    ? data.icons.filter((n): n is string => typeof n === "string" && ICON_NAME_RE.test(n)).slice(0, 48)
    : [];

  return NextResponse.json(
    { icons },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
  );
}
