"use client";

import dynamic from "next/dynamic";

// Only the selected transition is downloaded — "none" downloads nothing extra.
const FadeCardTransition = dynamic(() => import("./card-transitions/FadeCardTransition"));
const SlideUpCardTransition = dynamic(() => import("./card-transitions/SlideUpCardTransition"));
const SlideDownCardTransition = dynamic(() => import("./card-transitions/SlideDownCardTransition"));
const ZoomInCardTransition = dynamic(() => import("./card-transitions/ZoomInCardTransition"));
const FlipCardTransition = dynamic(() => import("./card-transitions/FlipCardTransition"));
const BounceCardTransition = dynamic(() => import("./card-transitions/BounceCardTransition"));
const BlurCardTransition = dynamic(() => import("./card-transitions/BlurCardTransition"));

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

  if (transition === "slide-up") {
    return <SlideUpCardTransition className={className}>{children}</SlideUpCardTransition>;
  }

  if (transition === "slide-down") {
    return <SlideDownCardTransition className={className}>{children}</SlideDownCardTransition>;
  }

  if (transition === "zoom-in") {
    return <ZoomInCardTransition className={className}>{children}</ZoomInCardTransition>;
  }

  if (transition === "flip") {
    return <FlipCardTransition className={className}>{children}</FlipCardTransition>;
  }

  if (transition === "bounce") {
    return <BounceCardTransition className={className}>{children}</BounceCardTransition>;
  }

  if (transition === "blur") {
    return <BlurCardTransition className={className}>{children}</BlurCardTransition>;
  }

  return <>{children}</>;
}
