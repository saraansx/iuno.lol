"use client";

import React from "react";
import type { TransitionRendererProps } from "./types";
import { hexToRgba, getBlurOverlayOpacity } from "./utils";

export function FadeTransition({
  isExiting,
  onClick,
  children,
  blur = 16,
  blurColor = "#000000",
}: TransitionRendererProps) {
  const overlayOpacity = getBlurOverlayOpacity(blur, 65);

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: isExiting ? "transparent" : hexToRgba(blurColor, overlayOpacity),
        backdropFilter: isExiting ? "none" : `blur(${blur}px)`,
        WebkitBackdropFilter: isExiting ? "none" : `blur(${blur}px)`,
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none transition-all duration-700 ease-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div
        className={`transition-all duration-400 ${
          isExiting ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
