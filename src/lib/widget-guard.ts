import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/server/security/ip";
import { checkRateLimit, ipBucket } from "@/lib/rate-limit";

export async function widgetRateLimit(
  req: NextRequest,
  key: string,
  maxPerMinute = 120,
): Promise<NextResponse | null> {
  const bucket = ipBucket(`widget:${key}`, getClientIp(req.headers), maxPerMinute);

  try {
    const rate = await checkRateLimit(bucket.key, bucket.max, 60);
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
