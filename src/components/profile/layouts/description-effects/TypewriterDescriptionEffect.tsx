"use client";

import { useEffect, useRef, useState } from "react";
import { countRichText, revealRichText } from "./richTextReveal";

const TYPE_SPEED = 40;
const ERASE_SPEED = 14;
const HOLD_AFTER_TYPE = 2400;
const HOLD_AFTER_ERASE = 300;
const INITIAL_DELAY = 300;

type Phase = "typing" | "holding-typed" | "erasing" | "holding-empty";

export default function TypewriterDescriptionEffect({ children }: { children: React.ReactNode }) {
  const total = countRichText(children);
  const [left, setLeft] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);
  const phaseRef = useRef<Phase>("typing");
  const lenRef = useRef(0);

  useEffect(() => {
    if (total === 0) return;
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
          if (lenRef.current < total) {
            nextLen = lenRef.current + 1;
            nextDelay = TYPE_SPEED;
          } else {
            nextPhase = "holding-typed";
            nextDelay = HOLD_AFTER_TYPE;
          }
          break;
        }
        case "holding-typed": {
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
            nextPhase = "holding-empty";
            nextDelay = HOLD_AFTER_ERASE;
          }
          break;
        }
        case "holding-empty": {
          nextPhase = "typing";
          nextLen = 0;
          nextDelay = TYPE_SPEED;
          break;
        }
      }

      phaseRef.current = nextPhase;
      lenRef.current = nextLen;
      setLeft(nextLen);

      if (cancelledRef.current) return;
      timeoutRef.current = setTimeout(tick, nextDelay);
    };

    timeoutRef.current = setTimeout(tick, INITIAL_DELAY);

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [total]);

  if (total === 0) return <>{children}</>;

  const shown = revealRichText(children, {
    left,
    caret: <Caret key="tw-caret" />,
    placed: false,
  });

  return <>{shown}</>;
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
        marginRight: "-0.08em",
        verticalAlign: "-0.15em",
        background: "currentColor",
        opacity: on ? 1 : 0,
        transition: "opacity 120ms linear",
      }}
    />
  );
}
