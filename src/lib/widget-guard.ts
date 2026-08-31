import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Per-IP limit for widget routes. Returns a 429 to send back, or null to carry
 * on. Public data routes are cached in Redis so they are cheap on a hit; the
 * validate routes are not cached and call upstream every time, so they get a
 * tighter default.
 */
export async function widgetRateLimit(
  req: NextRequest,
  key: string,
  maxPerMinute = 120,
): Promise<NextResponse | null> {
  const ip = getClientIp(req.headers);
  if (!ip) return null;

  try {
    const rate = await checkRateLimit(`widget:${key}:${ip}`, maxPerMinute, 60);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      );
    }
  } catch {
    // Redis down: widgets keep working rather than the profile page breaking.
  }

  return null;
}
