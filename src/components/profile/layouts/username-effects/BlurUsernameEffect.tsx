"use client";

import { useEffect, useRef, useState } from "react";

const BLUR_MAX = 6;
const BLUR_DURATION = 2000;

export default function BlurUsernameEffect({ children }: { children: React.ReactNode }) {
  const [blur, setBlur] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) % BLUR_DURATION;
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
        textShadow: blur > 0.1 ? `0 0 ${blur}px currentColor` : undefined,
      }}
    >
      {children}
    </span>
  );
}
