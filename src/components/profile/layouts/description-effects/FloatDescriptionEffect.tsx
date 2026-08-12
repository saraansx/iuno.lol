"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

const FLOAT_DURATION = 3200; // ms for one full float cycle

type WithStyle = { style?: CSSProperties };

/**
 * FloatDescriptionEffect
 *
 * Same elliptical drift as FloatUsernameEffect, but the animation is applied
 * to the bio element itself rather than a wrapper <span>. The bio is a block
 * with max-w-[90%] whose width and centering resolve against its parent, so an
 * extra box in between would change where the text sits. transform never
 * affects layout, so the drift can't resize or shift the card.
 */
export default function FloatDescriptionEffect({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    willChange: "transform",
    animation: `description-float ${FLOAT_DURATION}ms linear infinite`,
  };

  const child = isValidElement<WithStyle>(children)
    ? cloneElement(children, { style: { ...children.props.style, ...style } })
    : (<span style={{ display: "inline-block", ...style }}>{children}</span>);

  return (
    <>
      {child}
      <style>{`
        @keyframes description-float {
          0%     { transform: translate3d(0px, 0px, 0) rotate(0deg); }
          12.5%  { transform: translate3d(2px, -1px, 0) rotate(1deg); }
          25%    { transform: translate3d(3px, -3px, 0) rotate(1.5deg); }
          37.5%  { transform: translate3d(2px, -4px, 0) rotate(1deg); }
          50%    { transform: translate3d(0px, -5px, 0) rotate(0deg); }
          62.5%  { transform: translate3d(-2px, -4px, 0) rotate(-1deg); }
          75%    { transform: translate3d(-3px, -3px, 0) rotate(-1.5deg); }
          87.5%  { transform: translate3d(-2px, -1px, 0) rotate(-1deg); }
          100%   { transform: translate3d(0px, 0px, 0) rotate(0deg); }
        }
      `}</style>
    </>
  );
}
