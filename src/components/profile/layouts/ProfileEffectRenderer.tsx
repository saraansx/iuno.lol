"use client";

import { useEffect, useRef, useState } from "react";

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

const DESIGN_WIDTH = 450;

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

function useContainerWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function FxLayer({ fx, containerWidth }: { fx: Fx; containerWidth: number }) {
  const visible = useFxVisible(fx);
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMountKey((k) => k + 1);
    }
  }, [visible]);

  if (!visible) return null;

  const hasPos =
    fx.position && typeof fx.position.x === "number" && typeof fx.position.y === "number";
  const hasSize = fx.width != null || fx.height != null;

  const layerWidth = containerWidth > 0 ? containerWidth : DESIGN_WIDTH;
  const authoredWidth = fx.width || DESIGN_WIDTH;
  const layerHeight = fx.height != null ? (fx.height / authoredWidth) * layerWidth : "100%";

  const style: React.CSSProperties = hasPos || hasSize
    ? {
        left: hasPos ? `${(fx.position!.x / DESIGN_WIDTH) * layerWidth}px` : 0,
        top: 0,
        width: layerWidth,
        height: layerHeight,
        objectFit: "cover" as const,
        objectPosition: "top center" as const,
      }
    : {};

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
  const [containerRef, containerWidth] = useContainerWidth();

  if (!effects.length) return null;
  return (
    <div
      ref={containerRef}
      className={className ?? "absolute inset-0 pointer-events-none z-30 overflow-hidden"}
      style={{
        borderRadius: borderRadius != null ? `${borderRadius}px` : undefined,
        filter: hue ? `hue-rotate(${hue}deg)` : undefined,
      }}
      aria-hidden
    >
      {effects.map((fx, i) => (
        <FxLayer key={i} fx={fx} containerWidth={containerWidth} />
      ))}
    </div>
  );
}