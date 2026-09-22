"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

type WithStyle = { style?: CSSProperties };

export default function FlickerDescriptionEffect({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    animation: "description-flicker 2.4s steps(1, end) infinite",
  };

  const child = isValidElement<WithStyle>(children)
    ? cloneElement(children, { style: { ...children.props.style, ...style } })
    : (<span style={{ display: "inline-block", ...style }}>{children}</span>);

  return (
    <>
      {child}
      <style>{`
        @keyframes description-flicker {
          0%, 100% { opacity: 1; }
          3%   { opacity: 0.25; }
          6%   { opacity: 1; }
          38%  { opacity: 1; }
          40%  { opacity: 0.45; }
          42%  { opacity: 1; }
          44%  { opacity: 0.7; }
          46%  { opacity: 1; }
          72%  { opacity: 1; }
          74%  { opacity: 0.3; }
          77%  { opacity: 1; }
          88%  { opacity: 0.6; }
          90%  { opacity: 1; }
        }
      `}</style>
    </>
  );
}
