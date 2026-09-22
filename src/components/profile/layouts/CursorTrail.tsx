"use client";

import dynamic from "next/dynamic";

const FluidLineTrail = dynamic(() => import("./cursor-trails/FluidLine").then((m) => m.FluidLineTrail), { ssr: false });
const StarsTrail = dynamic(() => import("./cursor-trails/Stars").then((m) => m.StarsTrail), { ssr: false });
const GhostTrail = dynamic(() => import("./cursor-trails/Ghost").then((m) => m.GhostTrail), { ssr: false });
const SakuraTrail = dynamic(() => import("./cursor-trails/Sakura").then((m) => m.SakuraTrail), { ssr: false });
const OnekoTrail = dynamic(() => import("./cursor-trails/Oneko").then((m) => m.OnekoTrail), { ssr: false });
const GlowTrail = dynamic(() => import("./cursor-trails/Glow").then((m) => m.GlowTrail), { ssr: false });
const StardustTrail = dynamic(() => import("./cursor-trails/Stardust").then((m) => m.StardustTrail), { ssr: false });
const SnowflakeTrail = dynamic(() => import("./cursor-trails/Snowflake").then((m) => m.SnowflakeTrail), { ssr: false });
const BubblesTrail = dynamic(() => import("./cursor-trails/Bubbles").then((m) => m.BubblesTrail), { ssr: false });

export function CursorTrail({
  trail,
  color = "#ffffff",
}: {
  trail?: string;
  color?: string;
}) {
  if (!trail || trail === "none") return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-[80]">
      {trail === "fluid-line" && <FluidLineTrail color={color} />}
      {trail === "stars" && <StarsTrail color={color} />}
      {trail === "ghost" && <GhostTrail color={color} />}
      {trail === "sakura" && <SakuraTrail color={color} />}
      {trail === "oneko" && <OnekoTrail color={color} />}
      {trail === "glow" && <GlowTrail color={color} />}
      {trail === "stardust" && <StardustTrail color={color} />}
      {trail === "snowflake" && <SnowflakeTrail color={color} />}
      {trail === "bubbles" && <BubblesTrail color={color} />}
    </div>
  );
}
