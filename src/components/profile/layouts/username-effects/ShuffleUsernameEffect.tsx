"use client";

import { useEffect, useRef, useState } from "react";
import { extractText } from "./extractText";
import { replaceText } from "./replaceText";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";

const CYCLE_INTERVAL = 2000;
const SCRAMBLE_PER_CHAR = 60;

export default function ShuffleUsernameEffect({ children }: { children: React.ReactNode }) {
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

        const settledCount = Math.min(totalChars, Math.floor((step / totalSteps) * totalChars));
        let next = "";
        for (let i = 0; i < totalChars; i++) {
          if (i < settledCount) {
            next += target[i];
          } else {
            next += target[i] === " " ? " " : CHARSET[Math.floor(Math.random() * CHARSET.length)];
          }
        }
        setDisplay(next);

        if (step < totalSteps) {
          timeoutRef.current = setTimeout(tick, SCRAMBLE_PER_CHAR);
        } else {
          setDisplay(target);
          timeoutRef.current = setTimeout(runCycle, 900);
        }
      };

      tick();
    };

    timeoutRef.current = setTimeout(runCycle, 400);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [target]);

  return target ? replaceText(children, display) : children;
}

