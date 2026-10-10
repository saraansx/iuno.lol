import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { ICONIFY_API, brandColorFor } from "@/lib/links";
import { sanitizeSvg } from "@/lib/server/security/svg-sanitize";

const ICON_NAME_RE = /^[a-z0-9]+[a-z0-9-]*:[a-z0-9][a-z0-9-:]*$/i;
const MAX_NAMES = 60;

function toSvg(
  collection: { width?: unknown; height?: unknown },
  fullName: string,
  icon: { body?: unknown; width?: unknown; height?: unknown }
): string | null {
  if (!icon || typeof icon.body !== "string" || !icon.body.includes("<path")) {
    return null;
  }
  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) && v > 0 ? v : fallback;
  const w = num(icon.width, num(collection.width, 24));
  const h = num(icon.height, num(collection.height, 24));
  const body = icon.body.replace(/currentColor/g, brandColorFor(fullName));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  if (svg.length > 100_000) return null;
  const sanitized = sanitizeSvg(svg);
  return sanitized.ok ? sanitized.svg : null;
}

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const names = (searchParams.get("icons") || "")
    .split(",")
    .map((s) => s.trim())
    .filter((n) => n && n.length <= 100 && ICON_NAME_RE.test(n))
    .slice(0, MAX_NAMES);

  if (names.length === 0) {
    return NextResponse.json({ icons: {} });
  }

  const byPrefix = new Map<string, string[]>();
  for (const full of names) {
    const [prefix, ...rest] = full.split(":");
    const bucket = byPrefix.get(prefix) ?? [];
    bucket.push(rest.join(":"));
    byPrefix.set(prefix, bucket);
  }

  const out: Record<string, string> = {};
  await Promise.all(
    [...byPrefix].map(async ([prefix, iconNames]) => {
      let data: {
        width?: unknown;
        height?: unknown;
        icons?: Record<string, { body?: unknown; width?: unknown; height?: unknown }>;
      };
      try {
        const upstream = await fetch(
          `${ICONIFY_API}/${prefix}.json?icons=${iconNames.map(encodeURIComponent).join(",")}`,
          { next: { revalidate: 86400 }, signal: AbortSignal.timeout(30_000) }
        );
        if (!upstream.ok) return;
        data = (await upstream.json()) as typeof data;
      } catch {
        return;
      }
      if (!data || typeof data.icons !== "object") return;
      for (const iconName of iconNames) {
        const svg = toSvg(data, `${prefix}:${iconName}`, data.icons[iconName]);
        if (svg) out[`${prefix}:${iconName}`] = svg;
      }
    })
  );

  return NextResponse.json(
    { icons: out },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } }
  );
}
