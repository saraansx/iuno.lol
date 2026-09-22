"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

const PETALS = [
  { left: 6, delay: 0, duration: 3400, size: 9 },
  { left: 18, delay: 800, duration: 3900, size: 7 },
  { left: 32, delay: 1500, duration: 3100, size: 10 },
  { left: 46, delay: 400, duration: 3600, size: 8 },
  { left: 58, delay: 2000, duration: 3300, size: 9 },
  { left: 70, delay: 1200, duration: 3700, size: 7 },
  { left: 82, delay: 2400, duration: 3200, size: 8 },
  { left: 94, delay: 600, duration: 3500, size: 9 },
];

type WithStyleChildren = { style?: CSSProperties; children?: ReactNode };

export default function SakuraDescriptionEffect({ children }: { children: ReactNode }) {
  const overlay = (
    <span
      aria-hidden
      style={{ position: "absolute", inset: "-40% -5%", overflow: "hidden", pointerEvents: "none" }}
    >
      {PETALS.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-12px",
            width: `${p.size}px`,
            height: `${p.size * 1.3}px`,
            animation: `description-sakura-fall ${p.duration}ms linear ${p.delay}ms infinite`,
          }}
        >
          <svg viewBox="0 0 24 30" width="100%" height="100%">
            <path
              d="M12 0 C6 6 4 12 6 18 C8 24 12 28 12 30 C12 28 16 24 18 18 C20 12 18 6 12 0 Z"
              fill="#ffb7d5"
              opacity="0.9"
            />
          </svg>
        </span>
      ))}
    </span>
  );

  const keyframes = (
    <style>{`
      @keyframes description-sakura-fall {
        0%   { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
        15%  { opacity: 1; }
        35%  { transform: translate(8px, 25%) rotate(120deg); }
        65%  { transform: translate(-8px, 60%) rotate(260deg); }
        85%  { opacity: 1; }
        100% { transform: translate(4px, 110px) rotate(400deg); opacity: 0; }
      }
    `}</style>
  );

  if (isValidElement<WithStyleChildren>(children)) {
    return cloneElement(
      children,
      { style: { ...children.props.style, position: "relative" } },
      children.props.children,
      overlay,
      keyframes,
    );
  }

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {overlay}
      {keyframes}
    </span>
  );
}
