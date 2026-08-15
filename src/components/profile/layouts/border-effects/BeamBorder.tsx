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
      borderWidth={borderWidth}
      size={100}
      duration={9}
      length={1.4}
    />
  );
}
