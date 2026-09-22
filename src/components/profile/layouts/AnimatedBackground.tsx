"use client";

import type { AnimatedBackgroundId } from "@/lib/animated-background";
import { AuroraEffect, type AuroraColors } from "./background-effects/Aurora";
import { DarkVeilEffect, type DarkVeilSettings } from "./background-effects/DarkVeil";
import { PixelBlastEffect, type PixelBlastSettings } from "./background-effects/PixelBlast";
import { ColorBendsEffect, type ColorBendsSettings } from "./background-effects/ColorBends";

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
export default function AnimatedBackground({ id, aurora, darkveil, pixelblast, colorbends }: { id: AnimatedBackgroundId; aurora?: AuroraSettings; darkveil?: DarkVeilSettings; pixelblast?: PixelBlastSettings; colorbends?: ColorBendsSettings }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
      <style>{`
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

      {id === "colorbends" && (
        <ColorBendsEffect
          color={colorbends?.color}
          rotation={colorbends?.rotation}
          autoRotate={colorbends?.autoRotate}
          speed={colorbends?.speed}
          scale={colorbends?.scale}
          frequency={colorbends?.frequency}
          warpStrength={colorbends?.warpStrength}
          mouseInfluence={colorbends?.mouseInfluence}
          parallax={colorbends?.parallax}
          noise={colorbends?.noise}
          iterations={colorbends?.iterations}
          intensity={colorbends?.intensity}
          bandWidth={colorbends?.bandWidth}
        />
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
