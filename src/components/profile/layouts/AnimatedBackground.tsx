"use client";

import type { AnimatedBackgroundId } from "@/lib/animated-background";
import { AuroraEffect, type AuroraColors } from "./background-effects/Aurora";
import { DarkVeilEffect, type DarkVeilSettings } from "./background-effects/DarkVeil";
import { PixelBlastEffect, type PixelBlastSettings } from "./background-effects/PixelBlast";
import { ColorBendsEffect, type ColorBendsSettings } from "./background-effects/ColorBends";
import { LiquidChromeEffect, type LiquidChromeSettings } from "./background-effects/LiquidChrome";
import { CRTWarpEffect, type CRTWarpSettings } from "./background-effects/CRTWarp";

export interface AuroraSettings {
  colors?: AuroraColors;
  speed?: number | null;
  blend?: number | null;
}

/**
 * Preset animated page backgrounds, rendered in the live profile,
 * the dashboard preview and the picker thumbnails.
 */
export default function AnimatedBackground({ id, aurora, darkveil, pixelblast, colorbends, liquidchrome, crtwarp }: { id: AnimatedBackgroundId; aurora?: AuroraSettings; darkveil?: DarkVeilSettings; pixelblast?: PixelBlastSettings; colorbends?: ColorBendsSettings; liquidchrome?: LiquidChromeSettings; crtwarp?: CRTWarpSettings }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
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

      {id === "crtwarp" && (
        <CRTWarpEffect
          color={crtwarp?.color}
          background={crtwarp?.background}
          speed={crtwarp?.speed}
          curvature={crtwarp?.curvature}
          waveAmount={crtwarp?.waveAmount}
          waveDensity={crtwarp?.waveDensity}
          scanStrength={crtwarp?.scanStrength}
          scanDensity={crtwarp?.scanDensity}
          bloom={crtwarp?.bloom}
          bloomRadius={crtwarp?.bloomRadius}
          noise={crtwarp?.noise}
          vignette={crtwarp?.vignette}
          brightness={crtwarp?.brightness}
          rgbShift={crtwarp?.rgbShift}
          pixelSize={crtwarp?.pixelSize}
          renderQuality={crtwarp?.renderQuality}
          frameRate={crtwarp?.frameRate}
          pointerWarp={crtwarp?.pointerWarp}
          pointerStrength={crtwarp?.pointerStrength}
          paused={crtwarp?.paused}
        />
      )}
    </div>
  );
}
