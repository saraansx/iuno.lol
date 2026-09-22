"use client";

import { useEffect, useRef, useState } from "react";

export type ViewsAnimationStyle = "none" | "countup" | "digitalroll" | "slotroll" | "speeding";

const DIGIT_HEIGHT = 1.2;
const SLOT_CYCLES = 3;

interface ViewsCounterAnimationProps {
  value: number;
  style: ViewsAnimationStyle;
  duration: number;
  enabled: boolean;
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
        const column = Array.from({ length: 10 }, (_, n) => n);
        column.push(target);

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
              {column.map((n, i) => (
                <span key={i} style={{ height: `${DIGIT_HEIGHT}em` }}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      <style>{`
        @keyframes views-digit-roll {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-10 * ${DIGIT_HEIGHT}em)); }
        }
      `}</style>
    </span>
  );
}

function SlotRoll({ value, duration }: { value: number; duration: number }) {
  const digits = String(Math.max(0, value)).split("");
  const cycleCount = Math.max(2, Math.min(SLOT_CYCLES, Math.ceil(duration / 400)));

  return (
    <span
      className="inline-flex align-middle"
      style={{ height: `${DIGIT_HEIGHT}em`, lineHeight: `${DIGIT_HEIGHT}em` }}
    >
      {digits.map((digit, index) => {
        const target = Number(digit);
        const column: number[] = [];
        for (let c = 0; c < cycleCount; c++) {
          for (let d = 0; d < 10; d++) column.push(d);
        }
        column.push(target);

        const stopDelay = Math.max(0, index * Math.min(120, duration * 0.12));
        const spinDuration = Math.max(200, duration - stopDelay);
        const travel = (column.length - 1) * DIGIT_HEIGHT;

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
                <span key={i} style={{ height: `${DIGIT_HEIGHT}em` }}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      <style>{`
        @keyframes views-slot-spin {
          0% { transform: translateY(0); }
          100% { transform: translateY(var(--slot-travel)); }
        }
      `}</style>
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
  const [display, setDisplay] = useState(enabled ? 0 : target);
  const [blur, setBlur] = useState(0);
  const [stretch, setStretch] = useState(1);
  const frameRef = useRef<number>(null);

  useEffect(() => {
    if (!enabled || target === 0 || style === "none" || style === "digitalroll" || style === "slotroll") {
      const id = requestAnimationFrame(() => {
        setDisplay(target);
        setBlur(0);
        setStretch(1);
      });
      return () => cancelAnimationFrame(id);
    }

    const start = performance.now();
    let seeded = false;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);

      if (!seeded) {
        seeded = true;
        if (style === "countup") setDisplay(0);
      }

      if (style === "speeding") {
        const p = easeOutQuad(t);
        setDisplay(Math.floor(target * p));
        const intensity = Math.sin(t * Math.PI);
        setBlur(intensity * 7);
        setStretch(1 + intensity * 0.35);
      } else {
        const p = easeOutQuad(t);
        setDisplay(Math.floor(target * p));
        setBlur(0);
        setStretch(1);
      }

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        setBlur(0);
        setStretch(1);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, style, duration, enabled]);

  if (!enabled || style === "none") return <>{target}</>;
  if (style === "digitalroll") return <DigitalRoll value={target} duration={duration} />;
  if (style === "slotroll") return <SlotRoll value={target} duration={duration} />;

  return (
    <span
      className="inline-block"
      style={{
        filter: blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : undefined,
        transform: stretch !== 1 ? `scaleX(${stretch.toFixed(3)})` : undefined,
        transformOrigin: "left center",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {display}
    </span>
  );
}
