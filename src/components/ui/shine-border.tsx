"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
}

export function ShineBorder({
  borderWidth = 1,
  duration = 8,
  shineColor = "#000000",
  className,
  style,
  ...props
}: ShineBorderProps) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];
  const stops = colors
    .map((c, i) => `${c} ${(0.12 + (i * 0.16) / Math.max(colors.length - 1, 1)).toFixed(3)}turn`)
    .join(", ");

  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `conic-gradient(from var(--shine-angle), transparent 0turn, ${stops}, transparent 0.4turn, transparent 1turn)`,
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit]",
        className
      )}
      {...props}
    />
  );
}
