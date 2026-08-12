"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

const FLIP_DURATION = 3400; // ms for one full rest-and-flip cycle

type WithStyle = { style?: CSSProperties };

/**
 * FlipDescriptionEffect
 *
 * Same two-half-turn tumble as FlipUsernameEffect: the top rolls away
 * (0° → 180°), holds upside down briefly, then completes the turn back to
 * normal (180° → 360°).
 *
 * The perspective is deeper than the username's 600px. Perspective distortion
 * scales with how large the element is relative to the vanishing point, and the
 * bio is a wide multi-line block rather than a short single line — at 600px the
 * far edge would splay out noticeably mid-turn. 1200px keeps the turn readable.
 *
 * Applied to the bio element itself rather than a wrapper <span>: the bio's
 * width and centering resolve against its parent, so an extra box in between
 * would change where the text sits. `rotateX` is a transform, so layout is
 * never affected and the card keeps its size.
 */
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
