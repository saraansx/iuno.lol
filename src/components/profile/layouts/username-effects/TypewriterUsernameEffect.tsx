"use client";

import { useEffect, useRef, useState } from "react";
import { extractText } from "./extractText";
import { replaceText } from "./replaceText";

const TYPE_SPEED = 90;     // ms per character typed
const ERASE_SPEED = 50;    // ms per character erased
const HOLD_AFTER_TYPE = 1200; // ms the full username lingers before erasing
const HOLD_AFTER_ERASE = 400; // ms the empty state lingers before retyping
const INITIAL_DELAY = 400; // ms before the first cycle starts

type Phase = "typing" | "holding-typed" | "erasing" | "holding-empty";

/**
 * TypewriterUsernameEffect
 *
 * Cycles: type char-by-char → hold → erase char-by-char → hold blank → retype.
 *
 * Uses an explicit phase machine driven by a single self-rescheduling `tick`.
 * All state lives in refs and is read fresh on each tick to avoid stale
 * closures; React state is only updated for rendering. A single `timeoutRef`
 * owns the next scheduled frame, so cycles never overlap (which is what caused
 * the post-cycle glitching).
 */
export default function TypewriterUsernameEffect({ children }: { children: React.ReactNode }) {
  const target = extractText(children);
  const [display, setDisplay] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);
  // Refs the tick() reads on every frame — always fresh, never stale.
  const phaseRef = useRef<Phase>("typing");
  const lenRef = useRef(0); // current display length

  useEffect(() => {
    if (!target) return;
    cancelledRef.current = false;
    phaseRef.current = "typing";
    lenRef.current = 0;

    const tick = () => {
      if (cancelledRef.current) return;

      const phase = phaseRef.current;
      let nextPhase: Phase = phase;
      let nextLen = lenRef.current;
      let nextDelay = 0;

      switch (phase) {
        case "typing": {
          if (lenRef.current < target.length) {
            nextLen = lenRef.current + 1;
            nextDelay = TYPE_SPEED;
          } else {
            // Finished typing — hold the full name before erasing
            nextPhase = "holding-typed";
            nextDelay = HOLD_AFTER_TYPE;
          }
          break;
        }
        case "holding-typed": {
          // Done holding; drop one char to enter the erase branch
          nextLen = Math.max(0, lenRef.current - 1);
          nextPhase = "erasing";
          nextDelay = ERASE_SPEED;
          break;
        }
        case "erasing": {
          if (lenRef.current > 0) {
            nextLen = lenRef.current - 1;
            nextDelay = ERASE_SPEED;
          } else {
            // Fully erased — hold blank before retyping
            nextPhase = "holding-empty";
            nextDelay = HOLD_AFTER_ERASE;
          }
          break;
        }
        case "holding-empty": {
          // Done holding empty — start typing again
          nextPhase = "typing";
          nextLen = 0;
          nextDelay = TYPE_SPEED;
          break;
        }
      }

      // Apply this frame's transition
      phaseRef.current = nextPhase;
      lenRef.current = nextLen;
      setDisplay(target.slice(0, nextLen));

      if (cancelledRef.current) return;
      timeoutRef.current = setTimeout(tick, nextDelay);
    };

    // First frame after the initial delay
    timeoutRef.current = setTimeout(tick, INITIAL_DELAY);

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [target]);

  // Render the typed text inside the same element as the original child so its
  // font styling and layout are preserved, with the caret appended inline.
  return target ? replaceText(children, display, <Caret />) : children;
}

function Caret() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "0.08em",
        height: "1em",
        marginLeft: "2px",
        verticalAlign: "-0.15em",
        background: "currentColor",
        opacity: on ? 1 : 0,
        transition: "opacity 120ms linear",
      }}
    />
  );
}

