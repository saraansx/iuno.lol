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
const SakuraUsernameEffect = dynamic(() => import("./username-effects/SakuraUsernameEffect"));
const FlickerUsernameEffect = dynamic(() => import("./username-effects/FlickerUsernameEffect"));
const FlamesUsernameEffect = dynamic(() => import("./username-effects/FlamesUsernameEffect"));
const ShimmerUsernameEffect = dynamic(() => import("./username-effects/ShimmerUsernameEffect"));
const GlitchUsernameEffect = dynamic(() => import("./username-effects/GlitchUsernameEffect"));
const DistortUsernameEffect = dynamic(() => import("./username-effects/DistortUsernameEffect"));
const LockonUsernameEffect = dynamic(() => import("./username-effects/LockonUsernameEffect"));

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
  } else if (effect === "sakura") {
    inner = <SakuraUsernameEffect>{children}</SakuraUsernameEffect>;
  } else if (effect === "flicker") {
    inner = <FlickerUsernameEffect>{children}</FlickerUsernameEffect>;
  } else if (effect === "flames") {
    inner = <FlamesUsernameEffect>{children}</FlamesUsernameEffect>;
  } else if (effect === "shimmer") {
    inner = <ShimmerUsernameEffect baseColor={glowColor ?? "#ffffff"}>{children}</ShimmerUsernameEffect>;
  } else if (effect === "glitch") {
    inner = <GlitchUsernameEffect>{children}</GlitchUsernameEffect>;
  } else if (effect === "distort") {
    inner = <DistortUsernameEffect>{children}</DistortUsernameEffect>;
  } else if (effect === "lockon") {
    inner = <LockonUsernameEffect>{children}</LockonUsernameEffect>;
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
