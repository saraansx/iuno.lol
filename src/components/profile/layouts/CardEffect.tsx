"use client";

import React from "react";
import SkewCardEffect from "./card-effects/SkewCardEffect";
import MagnetCardEffect from "./card-effects/MagnetCardEffect";
import ZoomCardEffect from "./card-effects/ZoomCardEffect";
import ElasticCardEffect from "./card-effects/ElasticCardEffect";
import DiveCardEffect from "./card-effects/DiveCardEffect";

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

  if (effect === "magnet") {
    return <MagnetCardEffect className={className}>{children}</MagnetCardEffect>;
  }

  if (effect === "zoom") {
    return <ZoomCardEffect className={className}>{children}</ZoomCardEffect>;
  }

  if (effect === "elastic") {
    return <ElasticCardEffect className={className}>{children}</ElasticCardEffect>;
  }

  if (effect === "dive") {
    return <DiveCardEffect className={className}>{children}</DiveCardEffect>;
  }

  return <>{children}</>;
}
