import { NextRequest, NextResponse } from "next/server";
import { getDecorationByUrl, getEffectBySku } from "@/lib/collectibles";

const MAX_PARAM_LENGTH = 512;
const CACHE = { "Cache-Control": "public, max-age=3600, s-maxage=86400" };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sku = params.get("effect");
  const url = params.get("decoration");

  if (sku && sku.length <= MAX_PARAM_LENGTH) {
    return NextResponse.json({ item: getEffectBySku(sku) }, { headers: CACHE });
  }
  if (url && url.length <= MAX_PARAM_LENGTH) {
    return NextResponse.json({ item: getDecorationByUrl(url) }, { headers: CACHE });
  }
  return NextResponse.json({ error: "Pass ?effect=<sku> or ?decoration=<url>" }, { status: 400 });
}
