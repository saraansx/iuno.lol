"use client";

import React from "react";
import type { TransitionRendererProps } from "./types";
import { hexToRgba, getBlurOverlayOpacity } from "./utils";

export function IrisTransition({
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
      style={{
        backgroundColor: hexToRgba(blurColor, overlayOpacity),
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        clipPath: isExiting ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)",
        transition: "clip-path 750ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none"
    >
      <div
        className={`transition-all duration-300 ${
          isExiting ? "opacity-0 scale-75 blur-sm" : "opacity-100 scale-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
