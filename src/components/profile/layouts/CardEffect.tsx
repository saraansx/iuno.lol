"use client";

import dynamic from "next/dynamic";

const SkewCardEffect = dynamic(() => import("./card-effects/SkewCardEffect"));
const MagnetCardEffect = dynamic(() => import("./card-effects/MagnetCardEffect"));
const ZoomCardEffect = dynamic(() => import("./card-effects/ZoomCardEffect"));
const ElasticCardEffect = dynamic(() => import("./card-effects/ElasticCardEffect"));
const DiveCardEffect = dynamic(() => import("./card-effects/DiveCardEffect"));

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
