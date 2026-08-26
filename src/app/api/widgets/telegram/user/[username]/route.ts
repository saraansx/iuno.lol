import { NextRequest, NextResponse } from "next/server";
import { withWidgetCache, widgetCacheKey } from "@/lib/widget-cache";
import { FETCH_TIMEOUT_MS } from "@/lib/widget-image-proxy";
import {
  type TelegramUserData,
  cleanTelegramUsername,
  isValidTelegramUsername,
} from "@/lib/telegram";

/**
 * Public Telegram profile lookup.
 *
 * Telegram exposes no public read API for user profiles, so this reads the
 * `t.me/<username>` preview page and pulls the OpenGraph tags out of it. The
 * result is cached in Redis under the shared widget window, so the scrape runs
 * once per handle per window no matter how many profiles show that handle.
 */

/** Avatar Telegram serves for handles that do not exist. */
const PLACEHOLDER_AVATAR = /telegram\.org\/img\/t_logo/i;

/** Title Telegram serves for handles that do not exist. */
const PLACEHOLDER_TITLE = /^Telegram:\s*Contact\s*@/i;

/** Only read the head — the OG tags are there, and the body can be large. */
const MAX_HTML_BYTES = 256 * 1024;

/**
 * Reads an OpenGraph tag's content, tolerating either attribute order.
 *
 * `t.me` currently emits `property` before `content`, but matching only that
 * order would break silently if Telegram ever swapped them.
 */
function readOgTag(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:${property}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match) return match[1];
  }
  return null;
}

/**
 * Decodes the HTML entities that appear in OG tag content.
 *
 * Telegram escapes `&`, quotes and angle brackets in names and bios, so a bio
 * containing "Tips &amp; tricks" would otherwise render with the entity visible.
 * `&amp;` is resolved last so `&amp;lt;` does not turn into `<`.
 */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/**
 * Reads a response body up to `MAX_HTML_BYTES`.
 *
 * `res.text()` would buffer the whole page; the OG tags live in the head, so
 * this stops as soon as it has enough and cancels the rest.
 */
async function readHtmlHead(res: Response): Promise<string> {
  const body = res.body;
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let total = 0;

  try {
    while (total < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      html += decoder.decode(value, { stream: true });

      // The tags we need are all in <head>; stop once it closes.
      if (html.includes("</head>")) break;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  return html;
}

/**
 * Fetches and parses one public Telegram profile.
 *
 * Returns null when the handle does not exist. Telegram answers `200` for a
 * missing handle and serves a generic page rather than a 404, so absence is
 * detected from the placeholder title and avatar instead of the status code.
 */
export async function fetchTelegramUserData(
  username: string
): Promise<TelegramUserData | null> {
  try {
    const res = await fetch(`https://t.me/${encodeURIComponent(username)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }

    const html = await readHtmlHead(res);
    const rawTitle = readOgTag(html, "title");
    if (!rawTitle) return null;

    const rawImage = readOgTag(html, "image");

    // A handle with no account still returns 200. Both markers have to be absent
    // for the profile to be real: a genuine profile with no avatar set keeps its
    // own display name, and the placeholder title only appears when there is no
    // account behind the handle.
    if (PLACEHOLDER_TITLE.test(rawTitle)) return null;

    const avatarUrl =
      rawImage && !PLACEHOLDER_AVATAR.test(rawImage)
        ? decodeHtmlEntities(rawImage)
        : null;

    return {
      username,
      displayName: decodeHtmlEntities(rawTitle).trim(),
      bio: decodeHtmlEntities(readOgTag(html, "description") || "").trim(),
      avatarUrl,
    };
  } catch (err) {
    console.error("[Telegram Profile Fetch Error]", err);
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cleanUsername = cleanTelegramUsername(username);

    if (!isValidTelegramUsername(cleanUsername)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Telegram username" },
        { status: 400 }
      );
    }

    const data = await withWidgetCache<TelegramUserData>(
      widgetCacheKey("telegram", "user", cleanUsername),
      () => fetchTelegramUserData(cleanUsername)
    );

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Telegram profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[Telegram Profile API Error]", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
