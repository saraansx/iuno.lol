"use client";

import React from "react";
import type { TransitionRendererProps } from "./types";
import { hexToRgba, getBlurOverlayOpacity } from "./utils";

export function FadeBlackTransition({
  isExiting,
  onClick,
  children,
  blur = 16,
  blurColor = "#000000",
}: TransitionRendererProps) {
  const overlayOpacity = getBlurOverlayOpacity(blur, 85);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isExiting ? "transparent" : hexToRgba(blurColor, overlayOpacity),
        backdropFilter: isExiting ? "none" : `blur(${blur}px)`,
        WebkitBackdropFilter: isExiting ? "none" : `blur(${blur}px)`,
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none transition-all duration-700 ease-in-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`transition-opacity duration-300 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
