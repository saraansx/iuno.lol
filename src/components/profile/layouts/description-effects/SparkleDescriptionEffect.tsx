"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface Sparkle {
  id: number;
  x: number;        // % across the bio width
  y: number;        // % down the bio height
  size: number;     // px
  duration: number; // ms the sparkle's twinkle lasts
  hue: number;      // hue-rotate deg for variety
}

const SPARKLE_COUNT = 10;
const SPAWN_INTERVAL_MIN = 500;
const SPAWN_INTERVAL_MAX = 1200;

type WithStyleChildren = { style?: CSSProperties; children?: ReactNode };

/**
 * SparkleDescriptionEffect
 *
 * Sprinkles small four-point star sparkles across the bio. Each one spawns at a
 * random spot, twinkles in and out, then gets recycled.
 *
 * Unlike SparkleUsernameEffect there is no wrapper element. The bio is a block
 * at max-w-[90%] and is a flex item in both of Layout1's render paths, so any
 * wrapper would become the flex item itself and shrink-wrap to its content —
 * max-w-[90%] would then resolve against that shrunken box instead of the
 * content column, re-wrapping the text and shifting it out of place. Instead
 * `position: relative` is merged onto the bio element and the sparkles are
 * rendered inside it, matching how the other description effects apply
 * themselves. Being absolutely positioned they are out of flow, so they add no
 * size and never move the text.
 *
 * Sparkles also stay within 5–95% vertically, rather than the username's
 * -10–110%: the bio is a taller multi-line block, so sparkles drifting outside
 * it read as floating debris rather than decoration.
 */
export default function SparkleDescriptionEffect({ children }: { children: ReactNode }) {
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
        y: 5 + Math.random() * 90, // keep sparkles over the text, not floating off it
        size: 5 + Math.random() * 7, // 5–12px — smaller than the username's, to suit ~15px text
        duration: 900 + Math.random() * 700,
        hue: Math.random() * 360,
      };
      setSparkles((prev) => [...prev.slice(-(SPARKLE_COUNT - 1)), next]);

      const wait = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
      timeoutId = setTimeout(spawn, wait);
    };

    timeoutId = setTimeout(spawn, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const marks = sparkles.map((s) => <SparkleMark key={s.id} sparkle={s} />);

  if (isValidElement<WithStyleChildren>(children)) {
    return cloneElement(
      children,
      { style: { ...children.props.style, position: "relative" } },
      children.props.children,
      marks,
    );
  }

  // Fallback for a bare string / fragment — needs its own positioning context.
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {marks}
    </span>
  );
}

function SparkleMark({ sparkle }: { sparkle: Sparkle }) {
  // The pop animation ends at opacity 0 with `forwards` fill, so the mark fades
  // out and stays hidden on its own — no extra timer or state needed.
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
        animation: `description-sparkle-pop ${sparkle.duration}ms ease-out forwards`,
        filter: `hue-rotate(${sparkle.hue}deg) drop-shadow(0 0 4px rgba(255,255,255,0.6))`,
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="white">
        {/* Four-point star — narrow vertically/horizontally, fat on the diagonals */}
        <path d="M12 0 C12.6 6.5 17.5 11.4 24 12 C17.5 12.6 12.6 17.5 12 24 C11.4 17.5 6.5 12.6 0 12 C6.5 11.4 11.4 6.5 12 0 Z" />
      </svg>
      <style>{`
        @keyframes description-sparkle-pop {
          0%   { transform: translate(-50%, -50%) scale(0) rotate(0deg);     opacity: 0; }
          30%  { transform: translate(-50%, -50%) scale(1) rotate(20deg);    opacity: 1; }
          70%  { transform: translate(-50%, -50%) scale(0.9) rotate(-10deg); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(0) rotate(0deg);     opacity: 0; }
        }
      `}</style>
    </span>
  );
}
