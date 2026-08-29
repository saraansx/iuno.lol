"use client";

import dynamic from "next/dynamic";

const BlurUsernameEffect = dynamic(() => import("./username-effects/BlurUsernameEffect"));
const SparkleUsernameEffect = dynamic(() => import("./username-effects/SparkleUsernameEffect"));
const ShuffleUsernameEffect = dynamic(() => import("./username-effects/ShuffleUsernameEffect"));
const TypewriterUsernameEffect = dynamic(() => import("./username-effects/TypewriterUsernameEffect"));
const FloatUsernameEffect = dynamic(() => import("./username-effects/FloatUsernameEffect"));
const PulseUsernameEffect = dynamic(() => import("./username-effects/PulseUsernameEffect"));
const FlipUsernameEffect = dynamic(() => import("./username-effects/FlipUsernameEffect"));

interface UsernameEffectProps {
  effect?: string;
  children: React.ReactNode;
}

export function UsernameEffect({ effect = "none", children }: UsernameEffectProps) {
  if (!effect || effect === "none") {
    return <>{children}</>;
  }

  if (effect === "blur") {
    return <BlurUsernameEffect>{children}</BlurUsernameEffect>;
  }

  if (effect === "sparkle") {
    return <SparkleUsernameEffect>{children}</SparkleUsernameEffect>;
  }

  if (effect === "shuffle") {
    return <ShuffleUsernameEffect>{children}</ShuffleUsernameEffect>;
  }

  if (effect === "typewriter") {
    return <TypewriterUsernameEffect>{children}</TypewriterUsernameEffect>;
  }

  if (effect === "float") {
    return <FloatUsernameEffect>{children}</FloatUsernameEffect>;
  }

  if (effect === "pulse") {
    return <PulseUsernameEffect>{children}</PulseUsernameEffect>;
  }

  if (effect === "flip") {
    return <FlipUsernameEffect>{children}</FlipUsernameEffect>;
  }

  return <>{children}</>;
}
