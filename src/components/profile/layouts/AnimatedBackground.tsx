"use client";

import dynamic from "next/dynamic";
import type { AnimatedBackgroundId } from "@/lib/animated-background";
import type { AuroraColors } from "./background-effects/Aurora";
import type { DarkVeilSettings } from "./background-effects/DarkVeil";
import type { PixelBlastSettings } from "./background-effects/PixelBlast";
import type { ColorBendsSettings } from "./background-effects/ColorBends";
import type { LiquidChromeSettings } from "./background-effects/LiquidChrome";
import type { CRTWarpSettings } from "./background-effects/CRTWarp";

const AuroraEffect = dynamic(() => import("./background-effects/Aurora").then((m) => m.AuroraEffect), { ssr: false });
const DarkVeilEffect = dynamic(() => import("./background-effects/DarkVeil").then((m) => m.DarkVeilEffect), { ssr: false });
const PixelBlastEffect = dynamic(() => import("./background-effects/PixelBlast").then((m) => m.PixelBlastEffect), { ssr: false });
const ColorBendsEffect = dynamic(() => import("./background-effects/ColorBends").then((m) => m.ColorBendsEffect), { ssr: false });
const LiquidChromeEffect = dynamic(() => import("./background-effects/LiquidChrome").then((m) => m.LiquidChromeEffect), { ssr: false });
const CRTWarpEffect = dynamic(() => import("./background-effects/CRTWarp").then((m) => m.CRTWarpEffect), { ssr: false });

interface AuroraSettings {
  colors?: AuroraColors;
  speed?: number | null;
  blend?: number | null;
}

export default function AnimatedBackground({ id, aurora, darkveil, pixelblast, colorbends, liquidchrome, crtwarp, frozen = false }: { id: AnimatedBackgroundId; aurora?: AuroraSettings; darkveil?: DarkVeilSettings; pixelblast?: PixelBlastSettings; colorbends?: ColorBendsSettings; liquidchrome?: LiquidChromeSettings; crtwarp?: CRTWarpSettings; frozen?: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505] pointer-events-none">
      {id === "aurora" && <AuroraEffect intensity={65} color="#8a7bff" colors={aurora?.colors} speed={aurora?.speed} blend={aurora?.blend} frozen={frozen} />}

      {id === "darkveil" && (
        <DarkVeilEffect
          speed={darkveil?.speed}
          hueShift={darkveil?.hueShift}
          noiseIntensity={darkveil?.noiseIntensity}
          scanlineFrequency={darkveil?.scanlineFrequency}
          scanlineIntensity={darkveil?.scanlineIntensity}
          warpAmount={darkveil?.warpAmount}
          frozen={frozen}
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
          frozen={frozen}
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
          frozen={frozen}
        />
      )}

      {id === "liquidchrome" && (
        <LiquidChromeEffect
          color={liquidchrome?.color}
          speed={liquidchrome?.speed}
          amplitude={liquidchrome?.amplitude}
          interactive={liquidchrome?.interactive}
          frozen={frozen}
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
          frozen={frozen}
        />
      )}
    </div>
  );
}
