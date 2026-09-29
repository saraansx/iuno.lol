import "server-only";

import effects from "@/effects.json";
import decorations from "@/Deco.json";
import type { ProfileEffect } from "@/components/dashboard/EffectsPicker";
import type { Decoration } from "@/components/dashboard/DecorationPicker";

const EFFECTS_BY_SKU = new Map((effects as unknown as ProfileEffect[]).map((e) => [e.sku_id, e]));
const DECORATIONS_BY_URL = new Map((decorations as Decoration[]).map((d) => [d.url, d]));

export function getEffectBySku(sku: string | null | undefined): ProfileEffect | null {
  return (sku && EFFECTS_BY_SKU.get(sku)) || null;
}

export function getEffectByUrl(url: string | null | undefined): ProfileEffect | null {
  return getEffectBySku(url?.split("effect:")[1]);
}

export function getDecorationByUrl(url: string | null | undefined): Decoration | null {
  return (url && DECORATIONS_BY_URL.get(url)) || null;
}
