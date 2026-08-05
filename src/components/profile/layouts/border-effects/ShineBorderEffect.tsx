"use client";

import { ShineBorder } from "@/components/ui/shine-border";

interface ShineBorderEffectProps {
  colorFrom: string;
  colorTo: string;
  borderWidth?: number;
}

export function ShineBorderEffect({ colorFrom, colorTo, borderWidth = 2 }: ShineBorderEffectProps) {
  const shineColor = colorFrom === colorTo ? colorFrom : [colorFrom, colorTo];

  return (
    <ShineBorder
      shineColor={shineColor}
      borderWidth={borderWidth > 0 ? borderWidth : 2}
      duration={14}
    />
  );
}
