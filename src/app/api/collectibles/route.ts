import { NextRequest, NextResponse } from "next/server";
import effects from "@/effects.json";
import decorations from "@/Deco.json";
import type { ProfileEffect } from "@/components/dashboard/EffectsPicker";
import type { Decoration } from "@/components/dashboard/DecorationPicker";

const EFFECTS_BY_SKU = new Map((effects as unknown as ProfileEffect[]).map((e) => [e.sku_id, e]));
const DECORATIONS_BY_URL = new Map((decorations as Decoration[]).map((d) => [d.url, d]));

const MAX_PARAM_LENGTH = 512;
const CACHE = { "Cache-Control": "public, max-age=3600, s-maxage=86400" };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sku = params.get("effect");
  const url = params.get("decoration");

  if (sku && sku.length <= MAX_PARAM_LENGTH) {
    return NextResponse.json({ item: EFFECTS_BY_SKU.get(sku) ?? null }, { headers: CACHE });
  }
  if (url && url.length <= MAX_PARAM_LENGTH) {
    return NextResponse.json({ item: DECORATIONS_BY_URL.get(url) ?? null }, { headers: CACHE });
  }
  return NextResponse.json({ error: "Pass ?effect=<sku> or ?decoration=<url>" }, { status: 400 });
}
