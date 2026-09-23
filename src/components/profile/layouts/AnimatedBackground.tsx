"use client";

import type { AnimatedBackgroundId } from "@/lib/animated-background";
import { AuroraEffect, type AuroraColors } from "./background-effects/Aurora";
import { DarkVeilEffect, type DarkVeilSettings } from "./background-effects/DarkVeil";
import { PixelBlastEffect, type PixelBlastSettings } from "./background-effects/PixelBlast";
import { ColorBendsEffect, type ColorBendsSettings } from "./background-effects/ColorBends";
import { LiquidChromeEffect, type LiquidChromeSettings } from "./background-effects/LiquidChrome";

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
export default function AnimatedBackground({ id, aurora, darkveil, pixelblast, colorbends, liquidchrome }: { id: AnimatedBackgroundId; aurora?: AuroraSettings; darkveil?: DarkVeilSettings; pixelblast?: PixelBlastSettings; colorbends?: ColorBendsSettings; liquidchrome?: LiquidChromeSettings }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
      <style>{`
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

      {id === "liquidchrome" && (
        <LiquidChromeEffect
          color={liquidchrome?.color}
          speed={liquidchrome?.speed}
          amplitude={liquidchrome?.amplitude}
          interactive={liquidchrome?.interactive}
        />
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
