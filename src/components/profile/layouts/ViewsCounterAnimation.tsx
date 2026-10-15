"use client";

import { useEffect, useRef } from "react";

export type ViewsAnimationStyle = "none" | "countup" | "digitalroll" | "slotroll" | "speeding";

interface ViewsCounterAnimationProps {
  value: number;
  style: ViewsAnimationStyle;
  duration: number;
  enabled: boolean;
}

const DIGIT_HEIGHT = 1.2;
const SLOT_CYCLES = 3;

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SLOT_COLUMNS = new Map<number, number[]>();

function slotColumn(cycleCount: number): number[] {
  let column = SLOT_COLUMNS.get(cycleCount);
  if (!column) {
    column = [];
    for (let c = 0; c < cycleCount; c++) {
      for (let d = 0; d < 10; d++) column.push(d);
    }
    SLOT_COLUMNS.set(cycleCount, column);
  }
  return column;
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function DigitalRoll({ value, duration }: { value: number; duration: number }) {
  const digits = String(Math.max(0, value)).split("");

  return (
    <span
      className="inline-flex align-middle"
      style={{ height: `${DIGIT_HEIGHT}em`, lineHeight: `${DIGIT_HEIGHT}em` }}
    >
      {digits.map((digit, index) => {
        const target = Number(digit);

        return (
          <span
            key={`${index}-${target}`}
            className="relative inline-block overflow-hidden"
            style={{ height: `${DIGIT_HEIGHT}em`, width: "0.62em" }}
          >
            <span
              className="absolute left-0 top-0 flex flex-col"
              style={{
                animation: `views-digit-roll ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 70}ms both`,
              }}
            >
              {DIGITS.map((n, i) => (
                <span key={`d-${i}`} style={{ height: `${DIGIT_HEIGHT}em` }}>
                  {n}
                </span>
              ))}
              <span key="target" style={{ height: `${DIGIT_HEIGHT}em` }}>{target}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

function SlotRoll({ value, duration }: { value: number; duration: number }) {
  const digits = String(Math.max(0, value)).split("");
  const cycleCount = Math.max(2, Math.min(SLOT_CYCLES, Math.ceil(duration / 400)));
  const column = slotColumn(cycleCount);

  return (
    <span
      className="inline-flex align-middle"
      style={{ height: `${DIGIT_HEIGHT}em`, lineHeight: `${DIGIT_HEIGHT}em` }}
    >
      {digits.map((digit, index) => {
        const target = Number(digit);
        const stopDelay = Math.max(0, index * Math.min(120, duration * 0.12));
        const spinDuration = Math.max(200, duration - stopDelay);
        const travel = column.length * DIGIT_HEIGHT;

        return (
          <span
            key={`${index}-${target}`}
            className="relative inline-block overflow-hidden"
            style={{ height: `${DIGIT_HEIGHT}em`, width: "0.62em" }}
          >
            <span
              className="absolute left-0 top-0 flex flex-col"
              style={{
                animation: `views-slot-spin ${spinDuration}ms cubic-bezier(0.15, 0.85, 0.25, 1.05) ${stopDelay}ms both`,
                ["--slot-travel" as string]: `-${travel}em`,
              }}
            >
              {column.map((n, i) => (
                <span key={`c-${i}`} style={{ height: `${DIGIT_HEIGHT}em` }}>
                  {n}
                </span>
              ))}
              <span key="target" style={{ height: `${DIGIT_HEIGHT}em` }}>{target}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function ViewsCounterAnimation({
  value,
  style,
  duration: rawDuration,
  enabled,
}: ViewsCounterAnimationProps) {
  const target = Math.max(0, Math.floor(value));
  const duration = Math.max(0, rawDuration) || 1000;
  const numRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animated = enabled && target > 0 && (style === "countup" || style === "speeding");
    const num = numRef.current;
    if (!animated || !num) return;

    const start = performance.now();
    let lastText = "0";
    num.textContent = lastText;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const text = String(Math.floor(target * easeOutQuad(t)));
      if (text !== lastText) {
        lastText = text;
        num.textContent = text;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        num.textContent = String(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, style, duration, enabled]);

  if (!enabled || style === "none") return <>{target}</>;
  if (style === "digitalroll") return <DigitalRoll value={target} duration={duration} />;
  if (style === "slotroll") return <SlotRoll value={target} duration={duration} />;

  return (
    <span
      className="inline-block"
      style={{
        transformOrigin: "left center",
        fontVariantNumeric: "tabular-nums",
        animation: style === "speeding" ? `views-speed-pulse ${duration}ms linear` : undefined,
      }}
    >
      <span ref={numRef}>{target > 0 ? 0 : target}</span>
    </span>
  );
}
