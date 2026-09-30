import React from "react";
import { parseInlineFormatting } from "./entry-transitions/parseInlineFormatting";
import { hexToRgba as toRgba } from "@/lib/utils/color";

export const SHAPE_CLASSES: Record<string, string> = {
  square: "rounded-lg",
  soft: "rounded-[14px]",
  rounded: "rounded-[24px]",
  circle: "rounded-full",
};

export const renderFormattedText = (text: string, align: "left" | "center" | "right" = "center") => {
  if (!text) return null;

  const lines = text.split("\n");

  const parsedLines = lines.map((line, idx) => {
    let content = line;

    const isSubtext = /^-#\s+(.*)/.exec(content);
    if (isSubtext) {
      content = isSubtext[1];
    }

    const isBullet = /^(?:-|\*|•)\s+(.*)/.exec(content);
    if (isBullet && !isSubtext) {
      content = isBullet[1];
    }

    const formatted = parseInlineFormatting(content);

    if (isSubtext) {
      return (
        <span key={idx} className="text-[11px] opacity-60 leading-tight block">
          {formatted}
        </span>
      );
    }

    if (isBullet) {
      return (
        <span key={idx} className={`flex items-center gap-2 ${align === "left" ? "justify-start" : align === "right" ? "justify-end flex-row-reverse" : "justify-center"}`}>
          <span className="text-[12px] opacity-70">•</span>
          <span>{formatted}</span>
        </span>
      );
    }

    return (
      <React.Fragment key={idx}>
        <span>{formatted}</span>
        {idx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return <>{parsedLines}</>;
};

export const hexToRgba = (hex: string | undefined, opacity: number) =>
  toRgba(hex, opacity, "5, 5, 5");

export const MOBILE_ANIMATED_BG_MAX_BLUR = 6;

const COARSE_POINTER_QUERY = "(pointer: coarse)";
export function subscribeCoarsePointer(onChange: () => void) {
  const mq = window.matchMedia(COARSE_POINTER_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
export function isCoarsePointer() {
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}
