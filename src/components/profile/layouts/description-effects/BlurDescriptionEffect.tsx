"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const BLUR_MAX = 4;         // peak blur (px) — lower than the username effect,
                            // since bio text is ~15px and goes unreadable sooner
const BLUR_DURATION = 2600; // ms for one full cycle (sharp -> blurred -> sharp)

type WithStyle = { style?: CSSProperties };

/**
 * BlurDescriptionEffect
 *
 * Cycles the bio's `filter: blur()` between 0px and BLUR_MAX on a triangle
 * wave, looping forever. Same idea as BlurUsernameEffect, but the filter is
 * merged into the bio element itself instead of a wrapper <span>: the bio is a
 * block with max-w-[90%] whose width and centering resolve against its parent,
 * so an extra box in between would change where the text sits.
 */
export default function BlurDescriptionEffect({ children }: { children: ReactNode }) {
  const [blur, setBlur] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const progress = ((now - startRef.current) % BLUR_DURATION) / BLUR_DURATION;
      // triangle wave: 0 -> MAX -> 0 across one cycle
      const triangle = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setBlur(triangle * BLUR_MAX);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const style: CSSProperties = {
    filter: `blur(${blur.toFixed(2)}px)`,
    willChange: "filter",
  };

  if (isValidElement<WithStyle>(children)) {
    return cloneElement(children, {
      style: { ...children.props.style, ...style },
    });
  }

  // Fallback for a bare string / fragment — inline-block so the filter applies.
  return <span style={{ display: "inline-block", ...style }}>{children}</span>;
}
