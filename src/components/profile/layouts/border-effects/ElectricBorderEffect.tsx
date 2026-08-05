"use client";

import ElectricBorder from "@/components/ui/electric-border";

interface ElectricBorderEffectProps {
  colorFrom: string;
  borderRadius?: number;
}

export function ElectricBorderEffect({ colorFrom, borderRadius = 24 }: ElectricBorderEffectProps) {
  return (
    <ElectricBorder
      color={colorFrom}
      speed={1}
      chaos={0.12}
      borderRadius={borderRadius}
      className="w-full h-full absolute inset-0 pointer-events-none"
    />
  );
}
