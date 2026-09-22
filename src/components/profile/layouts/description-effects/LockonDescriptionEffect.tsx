"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

type WithStyleChildren = { style?: CSSProperties; children?: ReactNode };

const cornerStyle = (pos: CSSProperties): CSSProperties => ({
  position: "absolute",
  width: "10px",
  height: "10px",
  borderColor: "#5b6cf5",
  borderStyle: "solid",
  borderWidth: 0,
  pointerEvents: "none",
  animation: "description-lockon 1.8s ease-in-out infinite",
  ...pos,
});

export default function LockonDescriptionEffect({ children }: { children: ReactNode }) {
  const overlay = (
    <span aria-hidden>
      <span style={cornerStyle({ top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 })} />
      <span style={cornerStyle({ top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 })} />
      <span style={cornerStyle({ bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 })} />
      <span style={cornerStyle({ bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 })} />
    </span>
  );

  const keyframes = (
    <style>{`
      @keyframes description-lockon {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50%      { opacity: 1;   transform: scale(1.15); }
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
    <span style={{ position: "relative", display: "inline-block", padding: "6px 8px" }}>
      {children}
      {overlay}
      {keyframes}
    </span>
  );
}
