"use client";

import { cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";

const BEAT_ONE = 1.12;       // peak size of the first, stronger thump
const BEAT_TWO = 1.07;       // peak size of the second, softer thump
const PULSE_DURATION = 1500; // ms for one full beat-beat-rest cycle

type WithStyle = { style?: CSSProperties };

/**
 * PulseDescriptionEffect
 *
 * Same heartbeat rhythm as PulseUsernameEffect — a sharp thump, a softer
 * second thump, then rest. The two-beat-plus-rest shape is what makes it read
 * as a pulse; a single slow swell just looks like breathing.
 *
 * The peaks are lower than the username's (1.18/1.11). The bio is a block at
 * max-w-[90%] that scales in both axes from its centre, so at 1.18 a full-width
 * bio would swell to ~106% of the content column and crowd the card's px-6
 * padding. 1.12 keeps the widest line clear of the edges.
 *
 * Applied to the bio element itself rather than a wrapper <span>: the bio's
 * width and centering resolve against its parent, so an extra box in between
 * would change where the text sits. `scale` is a transform, so layout is never
 * affected and the card keeps its size.
 */
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
