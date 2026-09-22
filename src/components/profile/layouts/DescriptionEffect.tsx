"use client";

import dynamic from "next/dynamic";
import { textGlowShadow, textGlowWrapperStyle } from "./textGlow";

const BlurDescriptionEffect = dynamic(() => import("./description-effects/BlurDescriptionEffect"));
const SparkleDescriptionEffect = dynamic(() => import("./description-effects/SparkleDescriptionEffect"));
const ShuffleDescriptionEffect = dynamic(() => import("./description-effects/ShuffleDescriptionEffect"));
const TypewriterDescriptionEffect = dynamic(() => import("./description-effects/TypewriterDescriptionEffect"));
const FloatDescriptionEffect = dynamic(() => import("./description-effects/FloatDescriptionEffect"));
const PulseDescriptionEffect = dynamic(() => import("./description-effects/PulseDescriptionEffect"));
const FlipDescriptionEffect = dynamic(() => import("./description-effects/FlipDescriptionEffect"));
const SakuraDescriptionEffect = dynamic(() => import("./description-effects/SakuraDescriptionEffect"));
const FlickerDescriptionEffect = dynamic(() => import("./description-effects/FlickerDescriptionEffect"));
const FlamesDescriptionEffect = dynamic(() => import("./description-effects/FlamesDescriptionEffect"));
const ShimmerDescriptionEffect = dynamic(() => import("./description-effects/ShimmerDescriptionEffect"));
const GlitchDescriptionEffect = dynamic(() => import("./description-effects/GlitchDescriptionEffect"));
const DistortDescriptionEffect = dynamic(() => import("./description-effects/DistortDescriptionEffect"));
const LockonDescriptionEffect = dynamic(() => import("./description-effects/LockonDescriptionEffect"));

interface DescriptionEffectProps {
  effect?: string;
  glow?: boolean | null;
  glowColor?: string | null;
  children: React.ReactNode;
}

export function DescriptionEffect({ effect = "none", glow = false, glowColor, children }: DescriptionEffectProps) {
  let inner: React.ReactNode;

  if (!effect || effect === "none") {
    inner = <>{children}</>;
  } else if (effect === "blur") {
    inner = <BlurDescriptionEffect>{children}</BlurDescriptionEffect>;
  } else if (effect === "sparkle") {
    inner = <SparkleDescriptionEffect>{children}</SparkleDescriptionEffect>;
  } else if (effect === "shuffle") {
    inner = <ShuffleDescriptionEffect>{children}</ShuffleDescriptionEffect>;
  } else if (effect === "typewriter") {
    inner = <TypewriterDescriptionEffect>{children}</TypewriterDescriptionEffect>;
  } else if (effect === "float") {
    inner = <FloatDescriptionEffect>{children}</FloatDescriptionEffect>;
  } else if (effect === "pulse") {
    inner = <PulseDescriptionEffect>{children}</PulseDescriptionEffect>;
  } else if (effect === "flip") {
    inner = <FlipDescriptionEffect>{children}</FlipDescriptionEffect>;
  } else if (effect === "sakura") {
    inner = <SakuraDescriptionEffect>{children}</SakuraDescriptionEffect>;
  } else if (effect === "flicker") {
    inner = <FlickerDescriptionEffect>{children}</FlickerDescriptionEffect>;
  } else if (effect === "flames") {
    inner = <FlamesDescriptionEffect>{children}</FlamesDescriptionEffect>;
  } else if (effect === "shimmer") {
    inner = <ShimmerDescriptionEffect baseColor={glowColor ?? "#ffffff"}>{children}</ShimmerDescriptionEffect>;
  } else if (effect === "glitch") {
    inner = <GlitchDescriptionEffect>{children}</GlitchDescriptionEffect>;
  } else if (effect === "distort") {
    inner = <DistortDescriptionEffect>{children}</DistortDescriptionEffect>;
  } else if (effect === "lockon") {
    inner = <LockonDescriptionEffect>{children}</LockonDescriptionEffect>;
  } else {
    inner = <>{children}</>;
  }

  if (!glow) {
    return <>{inner}</>;
  }

  // Smooth outer glow: overflow visible + breathing room so there is
  // no hard edge / hard mask cut. text-shadow layers are all blurred.
  return (
    <span style={{ ...textGlowWrapperStyle(true), textShadow: textGlowShadow(glowColor, true) }}>
      {inner}
    </span>
  );
}
