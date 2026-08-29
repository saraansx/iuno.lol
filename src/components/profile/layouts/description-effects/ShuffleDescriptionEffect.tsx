"use client";

import { useEffect, useRef, useState } from "react";
import { countRichText } from "./richTextReveal";
import { scrambleRichText } from "./richTextScramble";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";

const CYCLE_INTERVAL = 2600;
const SCRAMBLE_PER_CHAR = 60;
const SETTLE_HOLD = 1400;
const START_DELAY = 400;

const randomGlyph = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

export default function ShuffleDescriptionEffect({ children }: { children: React.ReactNode }) {
  const total = countRichText(children);
  const [settled, setSettled] = useState(total);
  const [, setFrame] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (total === 0) return;
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      const steps = Math.max(1, Math.ceil(CYCLE_INTERVAL / SCRAMBLE_PER_CHAR));
      let step = 0;

      const tick = () => {
        if (cancelled) return;
        step += 1;
        setSettled(Math.min(total, Math.floor((step / steps) * total)));
        setFrame((f) => f + 1);

        if (step < steps) {
          timeoutRef.current = setTimeout(tick, SCRAMBLE_PER_CHAR);
        } else {
          setSettled(total);
          timeoutRef.current = setTimeout(runCycle, SETTLE_HOLD);
        }
      };

      setSettled(0);
      tick();
    };

    timeoutRef.current = setTimeout(runCycle, START_DELAY);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [total]);

  if (total === 0) return <>{children}</>;
  if (settled >= total) return <>{children}</>;

  return <>{scrambleRichText(children, { index: 0, settled, glyph: randomGlyph })}</>;
}
