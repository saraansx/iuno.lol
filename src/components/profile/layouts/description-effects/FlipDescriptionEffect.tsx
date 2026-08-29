"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

const FLIP_DURATION = 3400;

type WithStyle = { style?: CSSProperties };

export default function FlipDescriptionEffect({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    willChange: "transform",
    transformStyle: "preserve-3d",
    animation: `description-flip ${FLIP_DURATION}ms ease-in-out infinite`,
  };

  const child = isValidElement<WithStyle>(children)
    ? cloneElement(children, { style: { ...children.props.style, ...style } })
    : (<span style={{ display: "inline-block", ...style }}>{children}</span>);

  return (
    <>
      {child}
      <style>{`
        @keyframes description-flip {
          0%, 45% { transform: perspective(1200px) rotateX(0deg); }
          58%     { transform: perspective(1200px) rotateX(180deg); }
          72%     { transform: perspective(1200px) rotateX(180deg); }
          100%    { transform: perspective(1200px) rotateX(360deg); }
        }
      `}</style>
    </>
  );
}
