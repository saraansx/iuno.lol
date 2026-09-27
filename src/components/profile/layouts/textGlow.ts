import type { CSSProperties } from "react";
import { hexToRgba } from "@/lib/utils/color";

export function textGlowShadow(
  color: string | null | undefined,
  enabled?: boolean | null
): string | undefined {
  if (!enabled) return undefined;
  const c = (color?.trim() || "#ffffff") as string;
  return [
    `0 0 8px ${hexToRgba(c, 75, "255, 255, 255")}`,
    `0 0 22px ${hexToRgba(c, 42, "255, 255, 255")}`,
    `0 0 52px ${hexToRgba(c, 24, "255, 255, 255")}`,
  ].join(", ");
}

export function textGlowWrapperStyle(enabled?: boolean | null): CSSProperties {
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

export function iconGlowFilter(
  color: string | null | undefined,
  enabled?: boolean | null
): string | undefined {
  if (!enabled) return undefined;
  const raw = (color?.trim() || "#ffffff") as string;
  const c = /^#[0-9a-f]{6}$/i.test(raw) ? raw : "#ffffff";
  return `drop-shadow(0 0 5px ${c}) drop-shadow(0 0 12px ${hexToRgba(c, 55, "255, 255, 255")})`;
}
