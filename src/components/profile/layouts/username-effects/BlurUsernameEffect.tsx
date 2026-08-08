"use client";

import { useEffect, useRef, useState } from "react";

const BLUR_MAX = 6;         // peak blur (px) — how soft it gets at the extremes
const BLUR_DURATION = 2000; // ms for one full cycle (blur -> clear -> blur)

/**
 * BlurUsernameEffect
 *
 * Cycles the wrapped element's `filter: blur()` between 0px and BLUR_MAX
 * over a single BLUR_DURATION ms period, then loops forever:
 *
 *   0ms       → 0px  (sharp)
 *   750ms     → 6px  (blurred)
 *   1500ms    → 0px  (sharp) — full cycle ends, next one starts
 *
 * Each character stays perfectly anchored while the filter is animated,
 * so it reads as a "blur in / blur out" pulse on the username.
 */
export default function BlurUsernameEffect({ children }: { children: React.ReactNode }) {
  const [blur, setBlur] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) % BLUR_DURATION;
      // triangle wave: 0 -> MAX -> 0 across one cycle
      const progress = elapsed / BLUR_DURATION;
      const triangle = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setBlur(triangle * BLUR_MAX);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <span
      style={{
        display: "inline-block",
        filter: `blur(${blur}px)`,
        // Keep the blurred version visually balanced so the layout doesn't
        // jump when the filter strength changes.
        textShadow: blur > 0.1 ? `0 0 ${blur}px currentColor` : undefined,
      }}
    >
      {children}
    </span>
  );
}
