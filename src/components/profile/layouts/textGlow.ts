import type { CSSProperties } from "react";
import { hexToRgba } from "@/lib/utils/color";

/**
 * Smooth text glow with no hard edge / hard mask.
 *
 * Uses 3 layered `text-shadow`s with increasing blur radius and
 * decreasing opacity so the falloff is soft. Never uses a 0-blur /
 * 1px shadow (which creates a crisp edge) and never uses
 * mask-image / overflow-hidden clipping on the glow wrapper.
 */
export function textGlowShadow(
  color: string | null | undefined,
  enabled?: boolean | null
): string | undefined {
  if (!enabled) return undefined;
  const c = (color?.trim() || "#ffffff") as string;
  // Soft falloff: tight core -> mid halo -> wide ambient. All blurred.
  return [
    `0 0 8px ${hexToRgba(c, 75, "255, 255, 255")}`,
    `0 0 22px ${hexToRgba(c, 42, "255, 255, 255")}`,
    `0 0 52px ${hexToRgba(c, 24, "255, 255, 255")}`,
  ].join(", ");
}

/**
 * Wrapper that gives the glow breathing room so no ancestor clips it
 * with a hard edge. Padding + negative margin keeps layout size identical
 * while `overflow: visible` guarantees no hard mask cut.
 */export function textGlowWrapperStyle(enabled?: boolean | null): CSSProperties {
  if (!enabled) {
    return { display: "inline-block", overflow: "visible" };
  }
  return {
    display: "inline-block",
    overflow: "visible",
    padding: "12px 18px",
    margin: "-12px -18px",
  };
}

/**
 * Soft `drop-shadow` glow for small SVG icons (detail chips, feedback
 * buttons). Uses the icon's own color so it matches `currentColor` icons.
 */
export function iconGlowFilter(
  color: string | null | undefined,
  enabled?: boolean | null
): string | undefined {
  if (!enabled) return undefined;
  const raw = (color?.trim() || "#ffffff") as string;
  const c = /^#[0-9a-f]{6}$/i.test(raw) ? raw : "#ffffff";
  return `drop-shadow(0 0 5px ${c}) drop-shadow(0 0 12px ${hexToRgba(c, 55, "255, 255, 255")})`;
}
