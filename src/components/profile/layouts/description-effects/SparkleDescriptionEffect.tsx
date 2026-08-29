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
  x: number;
  y: number;
  size: number;
  duration: number;
  hue: number;
}

const SPARKLE_COUNT = 10;
const SPAWN_INTERVAL_MIN = 500;
const SPAWN_INTERVAL_MAX = 1200;

type WithStyleChildren = { style?: CSSProperties; children?: ReactNode };

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
        y: 5 + Math.random() * 90,
        size: 5 + Math.random() * 7,
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

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {marks}
    </span>
  );
}

function SparkleMark({ sparkle }: { sparkle: Sparkle }) {
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
