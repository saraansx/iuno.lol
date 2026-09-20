"use client";

import dynamic from "next/dynamic";
import { textGlowShadow, textGlowWrapperStyle } from "./textGlow";

const BlurUsernameEffect = dynamic(() => import("./username-effects/BlurUsernameEffect"));
const SparkleUsernameEffect = dynamic(() => import("./username-effects/SparkleUsernameEffect"));
const ShuffleUsernameEffect = dynamic(() => import("./username-effects/ShuffleUsernameEffect"));
const TypewriterUsernameEffect = dynamic(() => import("./username-effects/TypewriterUsernameEffect"));
const FloatUsernameEffect = dynamic(() => import("./username-effects/FloatUsernameEffect"));
const PulseUsernameEffect = dynamic(() => import("./username-effects/PulseUsernameEffect"));
const FlipUsernameEffect = dynamic(() => import("./username-effects/FlipUsernameEffect"));

interface UsernameEffectProps {
  effect?: string;
  glow?: boolean | null;
  glowColor?: string | null;
  children: React.ReactNode;
}

export function UsernameEffect({ effect = "none", glow = false, glowColor, children }: UsernameEffectProps) {
  let inner: React.ReactNode;

  if (!effect || effect === "none") {
    inner = <>{children}</>;
  } else if (effect === "blur") {
    inner = <BlurUsernameEffect>{children}</BlurUsernameEffect>;
  } else if (effect === "sparkle") {
    inner = <SparkleUsernameEffect>{children}</SparkleUsernameEffect>;
  } else if (effect === "shuffle") {
    inner = <ShuffleUsernameEffect>{children}</ShuffleUsernameEffect>;
  } else if (effect === "typewriter") {
    inner = <TypewriterUsernameEffect>{children}</TypewriterUsernameEffect>;
  } else if (effect === "float") {
    inner = <FloatUsernameEffect>{children}</FloatUsernameEffect>;
  } else if (effect === "pulse") {
    inner = <PulseUsernameEffect>{children}</PulseUsernameEffect>;
  } else if (effect === "flip") {
    inner = <FlipUsernameEffect>{children}</FlipUsernameEffect>;
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
