"use client";

import { BorderBeam } from "@/components/ui/border-beam";

interface BeamBorderProps {
  colorFrom: string;
  colorTo: string;
  borderWidth?: number;
}

export function BeamBorderEffect({ colorFrom, colorTo, borderWidth = 2 }: BeamBorderProps) {
  return (
    <BorderBeam
      colorFrom={colorFrom}
      colorTo={colorTo}
      borderWidth={borderWidth > 0 ? borderWidth : 2}
      size={100}
      duration={9}
      length={1.4}
    />
  );
}
