"use client";

import type { AnimatedBackgroundId } from "@/lib/animated-background";
import { AuroraEffect, type AuroraColors } from "./background-effects/Aurora";
import { DarkVeilEffect, type DarkVeilSettings } from "./background-effects/DarkVeil";
import { PixelBlastEffect, type PixelBlastSettings } from "./background-effects/PixelBlast";

export interface AuroraSettings {
  colors?: AuroraColors;
  speed?: number | null;
  blend?: number | null;
}

/**
 * Preset animated page backgrounds. Pure CSS (no assets, no canvas),
 * so they work in the live profile, the dashboard preview and the
 * picker thumbnails with zero extra cost.
 *
 * The `aurora` preset reuses the WebGL background effect.
 */
export default function AnimatedBackground({ id, aurora, darkveil, pixelblast }: { id: AnimatedBackgroundId; aurora?: AuroraSettings; darkveil?: DarkVeilSettings; pixelblast?: PixelBlastSettings }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
      <style>{`
        @keyframes abg-mist-x { 0%,100% { transform: translateX(-10%); } 50% { transform: translateX(10%); } }
        @keyframes abg-wave-x { to { transform: translateX(-50%); } }
        @keyframes abg-pulse { 0%,100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.06); } }
      `}</style>

      {id === "aurora" && <AuroraEffect intensity={65} color="#8a7bff" colors={aurora?.colors} speed={aurora?.speed} blend={aurora?.blend} />}

      {id === "darkveil" && (
        <DarkVeilEffect
          speed={darkveil?.speed}
          hueShift={darkveil?.hueShift}
          noiseIntensity={darkveil?.noiseIntensity}
          scanlineFrequency={darkveil?.scanlineFrequency}
          scanlineIntensity={darkveil?.scanlineIntensity}
          warpAmount={darkveil?.warpAmount}
        />
      )}

      {id === "pixelblast" && (
        <PixelBlastEffect
          variant={pixelblast?.variant}
          pixelSize={pixelblast?.pixelSize}
          color={pixelblast?.color}
          patternScale={pixelblast?.patternScale}
          patternDensity={pixelblast?.patternDensity}
          pixelJitter={pixelblast?.pixelJitter}
          speed={pixelblast?.speed}
          edgeFade={pixelblast?.edgeFade}
          ripples={pixelblast?.ripples}
          liquid={pixelblast?.liquid}
        />
      )}

      {id === "mist" && (
        <>
          <div className="absolute inset-y-0 -left-[20%] w-[90%] opacity-50 blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(91,108,245,0.55) 0%, transparent 70%)", animation: "abg-mist-x 16s ease-in-out infinite" }} />
          <div className="absolute inset-y-0 -right-[20%] w-[90%] opacity-40 blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.45) 0%, transparent 70%)", animation: "abg-mist-x 20s ease-in-out infinite reverse" }} />
        </>
      )}

      {id === "waves" && (
        <>
          {[0, 1, 2].map((layer) => (
            <div
              key={layer}
              className="absolute inset-y-0 w-[200%]"
              style={{
                background: `repeating-linear-gradient(${115 + layer * 12}deg, transparent 0px, transparent 46px, ${layer === 1 ? "rgba(168,85,247,0.28)" : "rgba(91,108,245,0.28)"} 48px, transparent 52px)`,
                animation: `abg-wave-x ${14 + layer * 6}s linear infinite${layer === 2 ? " reverse" : ""}`,
                opacity: 0.7,
              }}
            />
          ))}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))" }} />
        </>
      )}

      {id === "pulsegrid" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(91,108,245,0.7) 1.2px, transparent 1.2px)",
            backgroundSize: "26px 26px",
            animation: "abg-pulse 4s ease-in-out infinite",
            maskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 78%)",
          }}
        />
      )}
    </div>
  );
}
