"use client";

import dynamic from "next/dynamic";

const BlurDescriptionEffect = dynamic(() => import("./description-effects/BlurDescriptionEffect"));
const SparkleDescriptionEffect = dynamic(() => import("./description-effects/SparkleDescriptionEffect"));
const ShuffleDescriptionEffect = dynamic(() => import("./description-effects/ShuffleDescriptionEffect"));
const TypewriterDescriptionEffect = dynamic(() => import("./description-effects/TypewriterDescriptionEffect"));
const FloatDescriptionEffect = dynamic(() => import("./description-effects/FloatDescriptionEffect"));
const PulseDescriptionEffect = dynamic(() => import("./description-effects/PulseDescriptionEffect"));
const FlipDescriptionEffect = dynamic(() => import("./description-effects/FlipDescriptionEffect"));

interface DescriptionEffectProps {
  effect?: string;
  children: React.ReactNode;
}

export function DescriptionEffect({ effect = "none", children }: DescriptionEffectProps) {
  if (!effect || effect === "none") {
    return <>{children}</>;
  }

  if (effect === "blur") {
    return <BlurDescriptionEffect>{children}</BlurDescriptionEffect>;
  }

  if (effect === "sparkle") {
    return <SparkleDescriptionEffect>{children}</SparkleDescriptionEffect>;
  }

  if (effect === "shuffle") {
    return <ShuffleDescriptionEffect>{children}</ShuffleDescriptionEffect>;
  }

  if (effect === "typewriter") {
    return <TypewriterDescriptionEffect>{children}</TypewriterDescriptionEffect>;
  }

  if (effect === "float") {
    return <FloatDescriptionEffect>{children}</FloatDescriptionEffect>;
  }

  if (effect === "pulse") {
    return <PulseDescriptionEffect>{children}</PulseDescriptionEffect>;
  }

  if (effect === "flip") {
    return <FlipDescriptionEffect>{children}</FlipDescriptionEffect>;
  }

  return <>{children}</>;
}
