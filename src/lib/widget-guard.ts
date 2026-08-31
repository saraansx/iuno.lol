import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit } from "@/lib/rate-limit";

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
  }

  return null;
}
