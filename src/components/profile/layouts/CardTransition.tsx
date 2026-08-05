"use client";

import dynamic from "next/dynamic";

// Only the selected transition is downloaded — "none" downloads nothing extra.
const FadeCardTransition = dynamic(() => import("./card-transitions/FadeCardTransition"));

interface CardTransitionProps {
  transition?: string;
  children: React.ReactNode;
  className?: string;
}

export function CardTransition({ transition = "none", children, className = "" }: CardTransitionProps) {
  if (!transition || transition === "none") {
    return <>{children}</>;
  }

  if (transition === "fade") {
    return <FadeCardTransition className={className}>{children}</FadeCardTransition>;
  }

  return <>{children}</>;
}
