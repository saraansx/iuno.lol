"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

// Only the selected effect is downloaded — "none" downloads nothing extra.
const ShineBorderEffect = dynamic(() => import("./border-effects/ShineBorderEffect").then((m) => m.ShineBorderEffect), { ssr: false });
const ElectricBorderEffect = dynamic(() => import("./border-effects/ElectricBorderEffect").then((m) => m.ElectricBorderEffect), { ssr: false });

interface BorderEffectProps {
  effect?: string;
  color?: string;
  borderRadius?: number;
  borderWidth?: number;
  zIndex?: number;
}

function parseBorderColors(colorStr?: string) {
  if (!colorStr) return { from: "#ffffff", to: "#ffffff" };
  const parts = colorStr.split(",");
  const from = parts[0]?.trim() || "#ffffff";
  const to = (parts[1] || parts[0])?.trim() || "#ffffff";
  return { from, to };
}

export function BorderEffect({
  effect,
  color = "#ffffff",
  borderRadius = 0,
  borderWidth = 2,
  zIndex = 30,
}: BorderEffectProps) {
  const { from, to } = useMemo(() => parseBorderColors(color), [color]);

  if (!effect || effect === "none") return null;

  // These effects paint their own stroke rather than tinting the card's border, so
  // they need a thickness of their own. `profileBorderWidth` defaults to 0 —
  // meaning "no card border" — and passing that through rendered a zero-width
  // beam, i.e. nothing at all. Floor it so choosing an effect always shows
  // something, while a user who has set a wider border still gets that width.
  const strokeWidth = Math.max(borderWidth, 2);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: `${borderRadius}px`, zIndex }}
    >
      {effect === "shine-border" && (
        <ShineBorderEffect colorFrom={from} colorTo={to} borderWidth={strokeWidth} />
      )}
      {effect === "electric-border" && (
        <ElectricBorderEffect colorFrom={from} borderRadius={borderRadius} />
      )}
    </div>
  );
}
