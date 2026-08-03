"use client";

import React from "react";
import SkewCardEffect from "./card-effects/SkewCardEffect";

interface CardEffectProps {
  effect?: string;
  children: React.ReactNode;
  className?: string;
}

export function CardEffect({ effect = "none", children, className = "" }: CardEffectProps) {
  if (!effect || effect === "none") {
    return <>{children}</>;
  }

  if (effect === "skew") {
    return <SkewCardEffect className={className}>{children}</SkewCardEffect>;
  }

  return <>{children}</>;
}
