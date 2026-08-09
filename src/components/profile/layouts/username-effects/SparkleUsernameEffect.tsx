"use client";

import { useEffect, useRef, useState } from "react";

interface Sparkle {
  id: number;
  x: number;       // % across the username width
  y: number;       // % above/below the baseline
  size: number;    // px
  duration: number; // ms the sparkle's twinkle lasts
  hue: number;     // hue-rotate deg for variety
}

const SPARKLE_COUNT = 8;
const SPAWN_INTERVAL_MIN = 600;
const SPAWN_INTERVAL_MAX = 1400;

/**
 * SparkleUsernameEffect
 *
 * Sprinkles small four-point star sparkles around the username. Each sparkle
 * is a CSS-animated <span> positioned absolutely inside a wrapper that hugs
 * the username. Sparkles spawn at random positions and twinkle in and out
 * (scale + opacity), then get recycled.
 */
export default function SparkleUsernameEffect({ children }: { children: React.ReactNode }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const spawn = () => {
      if (cancelled) return;
      idRef.current += 1;
      const next: Sparkle = {
        id: idRef.current,
        x: Math.random() * 100,
        y: -10 + Math.random() * 120, // -10% → 110% so sparkles can sit above or below
        size: 6 + Math.random() * 8,  // 6–14px
        duration: 900 + Math.random() * 700,
        hue: Math.random() * 360,
      };
      setSparkles((prev) => [...prev.slice(-(SPARKLE_COUNT - 1)), next]);

      // Schedule next spawn
      const wait = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
      timeoutId = setTimeout(spawn, wait);
    };

    // Kick off the loop with the first sparkle
    timeoutId = setTimeout(spawn, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        // No forced line-height here — let the wrapped username keep its own
        // line box so the card doesn't shrink.
      }}
    >
      {children}
      {sparkles.map((s) => (
        <SparkleMark key={s.id} sparkle={s} />
      ))}
    </span>
  );
}

function SparkleMark({ sparkle }: { sparkle: Sparkle }) {
  // The pop animation ends at opacity 0 with `forwards` fill, so the mark
  // fades out and stays hidden on its own — no extra timer/state needed.
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        left: `${sparkle.x}%`,
        top: `${sparkle.y}%`,
        width: `${sparkle.size}px`,
        height: `${sparkle.size}px`,
        pointerEvents: "none",
        transform: "translate(-50%, -50%) scale(1)",
        animation: `username-sparkle-pop ${sparkle.duration}ms ease-out forwards`,
        filter: `hue-rotate(${sparkle.hue}deg) drop-shadow(0 0 4px rgba(255,255,255,0.6))`,
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
        {/* Four-point star — narrow vertically/horizontally, fat on the diagonals */}
        <path d="M12 0 C12.6 6.5 17.5 11.4 24 12 C17.5 12.6 12.6 17.5 12 24 C11.4 17.5 6.5 12.6 0 12 C6.5 11.4 11.4 6.5 12 0 Z" />
      </svg>
      <style>{`
        @keyframes username-sparkle-pop {
          0%   { transform: translate(-50%, -50%) scale(0) rotate(0deg);   opacity: 0; }
          30%  { transform: translate(-50%, -50%) scale(1) rotate(20deg);  opacity: 1; }
          70%  { transform: translate(-50%, -50%) scale(0.9) rotate(-10deg); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(0) rotate(0deg);   opacity: 0; }
        }
      `}</style>
    </span>
  );
}
