"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

type WithStyle = { style?: CSSProperties };

export default function DistortDescriptionEffect({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    display: isValidElement<WithStyle>(children) ? undefined : "inline-block",
    animation: "description-distort 2.6s ease-in-out infinite",
    willChange: "transform",
  };

  const child = isValidElement<WithStyle>(children)
    ? cloneElement(children, { style: { ...children.props.style, ...style } })
    : (<span style={style}>{children}</span>);

  return (
    <>
      {child}
      <style>{`
        @keyframes description-distort {
          0%, 100% { transform: skewX(0deg) scaleY(1) scaleX(1); }
          15% { transform: skewX(5deg) scaleY(1.05) scaleX(0.98); }
          30% { transform: skewX(-4deg) scaleY(0.95) scaleX(1.02); }
          50% { transform: skewX(3deg) scaleY(1.03) scaleX(1); }
          70% { transform: skewX(-5deg) scaleY(0.97) scaleX(0.99); }
          85% { transform: skewX(2deg) scaleY(1.02) scaleX(1.01); }
        }
      `}</style>
    </>
  );
}
