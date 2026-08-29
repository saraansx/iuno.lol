"use client";

import React from "react";
import type { TransitionRendererProps } from "./types";
import { hexToRgba, getBlurOverlayOpacity } from "./utils";

export function CurtainTransition({
  isExiting,
  onClick,
  children,
  blur = 16,
  blurColor = "#000000",
}: TransitionRendererProps) {
  const overlayOpacity = getBlurOverlayOpacity(blur, 70);

  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      <div
        style={{
          backgroundColor: hexToRgba(blurColor, overlayOpacity),
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
        }}
        className={`absolute top-0 left-0 right-0 h-1/2 transition-transform duration-700 ease-in-out origin-top ${
          isExiting ? "-translate-y-full" : "translate-y-0"
        }`}
      />

      <div
        style={{
          backgroundColor: hexToRgba(blurColor, overlayOpacity),
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
        }}
        className={`absolute bottom-0 left-0 right-0 h-1/2 transition-transform duration-700 ease-in-out origin-bottom ${
          isExiting ? "translate-y-full" : "translate-y-0"
        }`}
      />

      <div
        className={`relative z-10 transition-all duration-300 ${
          isExiting ? "opacity-0 scale-90" : "opacity-100 scale-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
