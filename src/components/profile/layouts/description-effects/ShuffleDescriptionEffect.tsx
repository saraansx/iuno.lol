"use client";

import { useEffect, useRef, useState } from "react";
import { countRichText } from "./richTextReveal";
import { scrambleRichText } from "./richTextScramble";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";

const CYCLE_INTERVAL = 2600;   // ms for one full scramble-to-settled pass
const SCRAMBLE_PER_CHAR = 60;  // ms between frames while resolving
const SETTLE_HOLD = 1400;      // ms the real bio holds before scrambling again
const START_DELAY = 400;       // ms before the first cycle, so the real bio paints first

const randomGlyph = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

/**
 * ShuffleDescriptionEffect
 *
 * Scrambles the bio with random glyphs, then resolves it left to right back to
 * the real text, like a decrypt animation. Loops forever.
 *
 * The username version reads its text with extractText and swaps the whole
 * string via replaceText. That approach can't be reused here — the bio carries
 * bold/underline runs, bullet rows and line breaks, and flattening it to one
 * string would drop the formatting and collapse it onto a single line. Instead
 * the tree is walked and only the characters are substituted, so tags, spacing
 * and line structure stay put and the card never resizes mid-scramble. See
 * richTextScramble.tsx.
 */
export default function ShuffleDescriptionEffect({ children }: { children: React.ReactNode }) {
  const total = countRichText(children);
  const [settled, setSettled] = useState(total);
  // Bumping this re-renders with freshly rolled glyphs each frame.
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
        // Advance the "settled" boundary rightwards; everything past it stays
        // random. Re-rendering each frame also re-rolls those glyphs.
        setSettled(Math.min(total, Math.floor((step / steps) * total)));
        setFrame((f) => f + 1);

        if (step < steps) {
          timeoutRef.current = setTimeout(tick, SCRAMBLE_PER_CHAR);
        } else {
          setSettled(total); // snap exactly to the real bio
          timeoutRef.current = setTimeout(runCycle, SETTLE_HOLD);
        }
      };

      setSettled(0); // start fully scrambled, then resolve from the left
      tick();
    };

    timeoutRef.current = setTimeout(runCycle, START_DELAY);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [total]);

  if (total === 0) return <>{children}</>;
  // Fully settled — render the real tree so no clones sit in the DOM at rest.
  if (settled >= total) return <>{children}</>;

  return <>{scrambleRichText(children, { index: 0, settled, glyph: randomGlyph })}</>;
}
