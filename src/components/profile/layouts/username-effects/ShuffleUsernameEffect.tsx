"use client";

import { useEffect, useRef, useState } from "react";
import { extractText } from "./extractText";
import { replaceText } from "./replaceText";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";

const CYCLE_INTERVAL = 2000;   // ms between full "settles" on the real username
const SCRAMBLE_PER_CHAR = 60;  // ms each character keeps a random glyph before settling

/**
 * ShuffleUsernameEffect
 *
 * Repeatedly scrambles each character of the wrapped text with random glyphs
 * from CHARSET, then resolves it back to the real character. Like a slot
 * machine / decrypt-text animation that runs forever.
 *
 * The text comes from the wrapped child (the username <h1>), read via
 * extractText; the scrambled output is rendered back through that same child
 * so its styling is preserved.
 */
export default function ShuffleUsernameEffect({ children }: { children: React.ReactNode }) {
  // Extract the underlying text once. Effects like this assume the username
  // is a single string (which is true for Layout1's <h1>).
  const target = extractText(children);

  const [display, setDisplay] = useState<string>(target);
  const cycleRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!target) return;

    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      cycleRef.current += 1;
      const totalChars = target.length;
      const totalSteps = Math.max(1, Math.ceil((CYCLE_INTERVAL - 200) / SCRAMBLE_PER_CHAR));

      let step = 0;
      const tick = () => {
        if (cancelled) return;
        step += 1;

        // Build the next frame: characters whose index is below `step` have
        // settled to their real value; characters at/above `step` are still
        // random glyphs. Each frame advances the "settled" line one step to
        // the right until the whole word is the real username.
        const settledCount = Math.min(totalChars, Math.floor((step / totalSteps) * totalChars));
        let next = "";
        for (let i = 0; i < totalChars; i++) {
          if (i < settledCount) {
            next += target[i];
          } else {
            // Preserve spaces so multi-word usernames don't visually collapse
            next += target[i] === " " ? " " : CHARSET[Math.floor(Math.random() * CHARSET.length)];
          }
        }
        setDisplay(next);

        if (step < totalSteps) {
          timeoutRef.current = setTimeout(tick, SCRAMBLE_PER_CHAR);
        } else {
          // Final settle: snap exactly to the real username
          setDisplay(target);
          timeoutRef.current = setTimeout(runCycle, 900);
        }
      };

      tick();
    };

    // Kick off after a short delay so the page paints the real name first
    timeoutRef.current = setTimeout(runCycle, 400);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [target]);

  // Render the scrambling text inside the same element as the original child
  // (the username <h1>), so its font styling, colors, and truncation are all
  // preserved instead of the card shrinking/resizing.
  return target ? replaceText(children, display) : children;
}

