"use client";

import dynamic from "next/dynamic";

// Only the selected trail is downloaded — "none" downloads nothing extra.
const FluidLineTrail = dynamic(() => import("./cursor-trails/FluidLine").then((m) => m.FluidLineTrail), { ssr: false });
const StarsTrail = dynamic(() => import("./cursor-trails/Stars").then((m) => m.StarsTrail), { ssr: false });
const GhostTrail = dynamic(() => import("./cursor-trails/Ghost").then((m) => m.GhostTrail), { ssr: false });
const SakuraTrail = dynamic(() => import("./cursor-trails/Sakura").then((m) => m.SakuraTrail), { ssr: false });

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
    </div>
  );
}
