"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

const BEAT_ONE = 1.12;
const BEAT_TWO = 1.07;
const PULSE_DURATION = 1500;

type WithStyle = { style?: CSSProperties };

export default function PulseDescriptionEffect({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    willChange: "transform",
    animation: `description-pulse ${PULSE_DURATION}ms ease-out infinite`,
  };

  const child = isValidElement<WithStyle>(children)
    ? cloneElement(children, { style: { ...children.props.style, ...style } })
    : (<span style={{ display: "inline-block", ...style }}>{children}</span>);

  return (
    <>
      {child}
      <style>{`
        @keyframes description-pulse {
          0%   { transform: scale(1); }
          10%  { transform: scale(${BEAT_ONE}); }
          20%  { transform: scale(1); }
          30%  { transform: scale(${BEAT_TWO}); }
          42%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
