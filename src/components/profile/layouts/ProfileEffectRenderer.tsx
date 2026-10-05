"use client";

import { useEffect, useState } from "react";

type Fx = {
  src: string;
  loop: boolean;
  duration: number;
  start: number;
  loop_delay?: number;
  z_index?: number;
  height?: number | null;
  width?: number | null;
  position?: { x: number; y: number } | null;
};

function useFxVisible(fx: Fx) {
  const [visible, setVisible] = useState(() => fx.start === 0);

  useEffect(() => {
    let vTimer: ReturnType<typeof setTimeout> | undefined;
    let hTimer: ReturnType<typeof setTimeout> | undefined;
    let sTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    if (!fx.loop) {
      if (fx.start === 0) {
        vTimer = setTimeout(() => {
          if (!cancelled) setVisible(false);
        }, fx.duration);
      } else {
        sTimer = setTimeout(() => {
          if (cancelled) return;
          setVisible(true);
          vTimer = setTimeout(() => {
            if (!cancelled) setVisible(false);
          }, fx.duration);
        }, fx.start);
      }
      return () => {
        cancelled = true;
        clearTimeout(vTimer);
        clearTimeout(sTimer);
      };
    }

    const delay = fx.loop_delay ?? 0;

    const cycle = () => {
      if (cancelled) return;
      setVisible(true);
      vTimer = setTimeout(() => {
        if (cancelled) return;
        setVisible(false);
        hTimer = setTimeout(cycle, delay);
      }, fx.duration);
    };

    if (fx.start > 0) {
      sTimer = setTimeout(cycle, fx.start);
    } else {
      // already visible at t=0 — schedule first hide, then loop
      vTimer = setTimeout(() => {
        if (cancelled) return;
        setVisible(false);
        hTimer = setTimeout(cycle, delay);
      }, fx.duration);
    }

    return () => {
      cancelled = true;
      clearTimeout(vTimer);
      clearTimeout(hTimer);
      clearTimeout(sTimer);
    };
  }, [fx.start, fx.duration, fx.loop, fx.loop_delay]);

  return visible;
}

function FxLayer({ fx }: { fx: Fx }) {
  const visible = useFxVisible(fx);
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    if (visible) {
      // Remount <img> so APNG/GIF restarts from frame 0 each cycle.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMountKey((k) => k + 1);
    }
  }, [visible]);

  if (!visible) return null;

  const hasPos =
    fx.position && typeof fx.position.x === "number" && typeof fx.position.y === "number";
  const hasSize = fx.width != null || fx.height != null;

  const style: React.CSSProperties = {
    zIndex: fx.z_index ?? 30,
    ...(hasPos || hasSize
      ? {
          left: hasPos ? `${fx.position!.x}px` : 0,
          top: hasPos ? `${fx.position!.y}px` : 0,
          width: fx.width ? `${fx.width}px` : "100%",
          height: fx.height ? `${fx.height}px` : "100%",
          objectFit: "cover" as const,
        }
      : {}),
  };

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      key={mountKey}
      src={fx.src}
      alt=""
      aria-hidden
      draggable={false}
      loading="eager"
      className={
        hasPos || hasSize
          ? "absolute pointer-events-none select-none"
          : "absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
      }
      style={style}
    />
  );
}

export default function ProfileEffectRenderer({
  effects,
  hue,
  borderRadius,
  className,
}: {
  effects: Fx[];
  hue?: number;
  borderRadius?: number;
  className?: string;
}) {
  if (!effects.length) return null;
  return (
    <div
      className={className ?? "absolute inset-0 pointer-events-none z-30 overflow-hidden"}
      style={{
        borderRadius: borderRadius != null ? `${borderRadius}px` : undefined,
        filter: hue ? `hue-rotate(${hue}deg)` : undefined,
      }}
      aria-hidden
    >
      {effects.map((fx, i) => (
        <FxLayer key={i} fx={fx} />
      ))}
    </div>
  );
}
