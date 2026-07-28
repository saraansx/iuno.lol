"use client";

import React from "react";
import { SnowEffect } from "./background-effects/Snow";
import { NightTimeEffect } from "./background-effects/NightTime";
import { OldTVEffect } from "./background-effects/OldTV";
import { DitherEffect } from "./background-effects/Dither";
import { RainEffect } from "./background-effects/Rain";
import { ParticlesEffect } from "./background-effects/Particles";
import { ShootingStarsEffect } from "./background-effects/ShootingStars";
import { HeartsEffect } from "./background-effects/Hearts";

export function BackgroundEffect({
  effect,
  intensity = 50,
  color = "#ffffff",
}: {
  effect?: string;
  intensity?: number;
  color?: string;
}) {
  if (!effect || effect === "none") return null;

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]`}>
      {effect === "snow" && <SnowEffect intensity={intensity} color={color} />}
      {effect === "nighttime" && <NightTimeEffect intensity={intensity} />}
      {effect === "oldtv" && <OldTVEffect intensity={intensity} />}
      {effect === "dither" && <DitherEffect intensity={intensity} color={color} />}
      {effect === "rain" && <RainEffect intensity={intensity} color={color} />}
      {effect === "particles" && <ParticlesEffect intensity={intensity} color={color} />}
      {effect === "shootingstars" && <ShootingStarsEffect intensity={intensity} color={color} />}
      {effect === "hearts" && <HeartsEffect intensity={intensity} color={color} />}
    </div>
  );
}
