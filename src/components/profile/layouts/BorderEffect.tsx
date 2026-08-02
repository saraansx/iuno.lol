"use client";

import React, { useMemo } from "react";
import { BeamBorderEffect } from "./border-effects/BeamBorder";
import { ShineBorderEffect } from "./border-effects/ShineBorderEffect";
import { ElectricBorderEffect } from "./border-effects/ElectricBorderEffect";

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

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ borderRadius: `${borderRadius}px`, zIndex }}
    >
      {effect === "border-beam" && (
        <BeamBorderEffect colorFrom={from} colorTo={to} borderWidth={borderWidth} />
      )}
      {effect === "shine-border" && (
        <ShineBorderEffect colorFrom={from} colorTo={to} borderWidth={borderWidth} />
      )}
      {effect === "electric-border" && (
        <ElectricBorderEffect colorFrom={from} borderRadius={borderRadius} />
      )}
    </div>
  );
}
