import { resolveEffectConfig, EFFECT_CONFIG_KEYS } from "@/lib/effect-config";
import { TEMPLATE_BACKGROUNDS_KEY } from "@/lib/template-config";

export function applyTemplateStyle<T extends object>(
  base: T,
  overrides: Record<string, unknown>,
): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const [k, v] of Object.entries(overrides)) {
    if (k === "effectConfig" || k === TEMPLATE_BACKGROUNDS_KEY) continue;
    out[k] = v;
  }

  const eff = overrides.effectConfig;
  if (eff && typeof eff === "object") {
    const merged: Record<string, unknown> = { ...((out.effectConfig as Record<string, unknown> | undefined) ?? undefined) };
    for (const key of EFFECT_CONFIG_KEYS) {
      const v = (eff as Record<string, unknown>)[key];
      if (v !== undefined && v !== null) merged[key] = v;
    }
    out.effectConfig = merged;
    for (const key of EFFECT_CONFIG_KEYS) {
      const v = (eff as Record<string, unknown>)[key];
      if (v !== undefined && v !== null) out[key] = v;
    }
  }

  return out as T;
}

export function templateBackgrounds(overrides: Record<string, unknown>): string[] | null {
  const b = overrides[TEMPLATE_BACKGROUNDS_KEY];
  if (!Array.isArray(b)) return null;
  const urls = b.filter((u): u is string => typeof u === "string" && u.length > 0).slice(0, 20);
  return urls.length > 0 ? urls : [];
}

export { resolveEffectConfig };