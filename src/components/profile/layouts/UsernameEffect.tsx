"use client";

import dynamic from "next/dynamic";

// Only the selected effect is downloaded — "none" downloads nothing extra.
const BlurUsernameEffect = dynamic(() => import("./username-effects/BlurUsernameEffect"));

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

  return <>{children}</>;
}
