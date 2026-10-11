"use client";

import React, { useState, useRef, useEffect } from "react";
import { parseInlineFormatting } from "./entry-transitions/parseInlineFormatting";
import { FadeBlackTransition } from "./entry-transitions/FadeBlackTransition";
import { FadeTransition } from "./entry-transitions/FadeTransition";
import { CurtainTransition } from "./entry-transitions/CurtainTransition";
import { IrisTransition } from "./entry-transitions/IrisTransition";
import { BlurDissolveTransition } from "./entry-transitions/BlurDissolveTransition";
import { hexToRgba } from "./entry-transitions/utils";

interface EntryTransitionProps {
  transition?: string;
  enabled?: boolean;
  text?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  color?: string;
  opacity?: number;
  blur?: number;
  blurColor?: string;
  fontClassMap?: Record<string, string>;
  onEnter?: () => void;
}

export function EntryTransition({
  transition = "none",
  enabled = false,
  text = "click to enter",
  font = "Inter",
  fontSize = 16,
  fontWeight = 400,
  letterSpacing = 0,
  color = "#ffffff",
  opacity = 100,
  blur = 16,
  blurColor = "#000000",
  fontClassMap = {},
  onEnter,
}: EntryTransitionProps) {
  const [hasEntered, setHasEntered] = useState(!enabled);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  if (!enabled || hasEntered) return null;

  const handleEnter = () => {
    if (transition && transition !== "none") {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setHasEntered(true);
        setIsExiting(false);
        onEnter?.();
      }, 700);
    } else {
      setHasEntered(true);
      onEnter?.();
    }
  };

  const content = (
    <p
      className="flex items-center justify-center gap-1.5"
      style={{
        fontFamily: fontClassMap[font] || "var(--font-inter)",
        fontSize: `${fontSize}px`,
        fontWeight,
        letterSpacing: `${letterSpacing}px`,
        color: color || "#ffffff",
        opacity: opacity / 100,
      }}
    >
      {parseInlineFormatting(text || "click to enter")}
    </p>
  );

  switch (transition) {
    case "fade-black":
      return (
        <FadeBlackTransition
          isExiting={isExiting}
          onClick={handleEnter}
          blur={blur}
          blurColor={blurColor}
        >
          {content}
        </FadeBlackTransition>
      );
    case "fade":
      return (
        <FadeTransition
          isExiting={isExiting}
          onClick={handleEnter}
          blur={blur}
          blurColor={blurColor}
        >
          {content}
        </FadeTransition>
      );
    case "curtain":
      return (
        <CurtainTransition
          isExiting={isExiting}
          onClick={handleEnter}
          blur={blur}
          blurColor={blurColor}
        >
          {content}
        </CurtainTransition>
      );
    case "iris":
      return (
        <IrisTransition
          isExiting={isExiting}
          onClick={handleEnter}
          blur={blur}
          blurColor={blurColor}
        >
          {content}
        </IrisTransition>
      );
    case "blur-dissolve":
      return (
        <BlurDissolveTransition
          isExiting={isExiting}
          onClick={handleEnter}
          blur={blur}
          blurColor={blurColor}
        >
          {content}
        </BlurDissolveTransition>
      );
    default:
      return (
        <div
          onClick={handleEnter}
          style={{
            backgroundColor: isExiting ? "transparent" : hexToRgba(blurColor, 60),
            backdropFilter: isExiting ? "none" : `blur(${blur}px)`,
            WebkitBackdropFilter: isExiting ? "none" : `blur(${blur}px)`,
          }}
          className={`fixed inset-0 z-[100] flex items-center justify-center cursor-pointer select-none transition-all duration-500 ${
            isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {content}
        </div>
      );
  }
}
