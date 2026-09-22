"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

type WithStyle = { style?: CSSProperties };

export default function ShimmerDescriptionEffect({
  children,
  baseColor = "#ffffff",
}: {
  children: ReactNode;
  baseColor?: string;
}) {
  const style: CSSProperties = {
    background: `linear-gradient(110deg, ${baseColor} 30%, rgba(255,255,255,0.55) 45%, ${baseColor} 50%, ${baseColor} 60%, rgba(255,255,255,0.55) 75%, ${baseColor} 90%)`,
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    animation: "description-shimmer 5.5s linear 1.2s infinite",
  };

  const child = isValidElement<WithStyle>(children)
    ? cloneElement(children, { style: { ...children.props.style, ...style } })
    : (<span style={{ display: "inline-block", ...style }}>{children}</span>);

  return (
    <>
      {child}
      <style>{`
        @keyframes description-shimmer {
          0%   { background-position: 150% 0; }
          100% { background-position: -150% 0; }
        }
      `}</style>
    </>
  );
}
