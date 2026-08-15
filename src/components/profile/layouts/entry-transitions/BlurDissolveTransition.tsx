"use client";

import React from "react";
import type { TransitionRendererProps } from "./types";
import { hexToRgba, getBlurOverlayOpacity } from "./utils";

export function BlurDissolveTransition({
  isExiting,
  onClick,
  children,
  blur = 16,
  blurColor = "#000000",
}: TransitionRendererProps) {
  const finalBlur = isExiting ? 0 : blur;
  const overlayOpacity = getBlurOverlayOpacity(blur, 75);
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isExiting ? "transparent" : hexToRgba(blurColor, overlayOpacity),
        backdropFilter: `blur(${finalBlur}px)`,
        WebkitBackdropFilter: `blur(${finalBlur}px)`,
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none transition-all duration-700 ease-out ${
        isExiting
          ? "opacity-0 scale-125 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      <div
        className={`transition-all duration-500 ${
          isExiting ? "opacity-0 scale-150 blur-lg" : "opacity-100 scale-100 blur-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
