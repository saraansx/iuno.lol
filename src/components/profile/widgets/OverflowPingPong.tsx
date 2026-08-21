"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface OverflowPingPongProps {
  children: ReactNode;
  className?: string;
  speed?: number; // pixels per second travel speed
  pauseDuration?: number; // seconds to pause on each side
  deps?: unknown[];
}

export default function OverflowPingPong({
  children,
  className = "",
  speed = 18,
  pauseDuration = 1.0,
  deps = [],
}: OverflowPingPongProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollShift, setScrollShift] = useState(0);
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const calculateOverflow = () => {
      const containerWidth = container.clientWidth;
      const contentWidth = content.scrollWidth;

      if (containerWidth <= 0 || contentWidth <= 0) {
        setScrollShift(0);
        return;
      }

      const overflow = contentWidth - containerWidth;
      setScrollShift(overflow > 3 ? Math.ceil(overflow + 8) : 0);
    };

    calculateOverflow();

    const ro = new ResizeObserver(() => {
      calculateOverflow();
    });

    ro.observe(container);
    ro.observe(content);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(calculateOverflow);
    }

    return () => ro.disconnect();
  }, [depsKey]);

  const duration =
    pauseDuration * 2 + (scrollShift / speed) * 2 + pauseDuration * 2;

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-0 overflow-hidden ${
        scrollShift > 0
          ? "[mask-image:linear-gradient(to_right,black_calc(100%-16px),transparent_100%)]"
          : ""
      } ${className}`}
    >
      <div
        ref={contentRef}
        className={`flex items-center shrink-0 whitespace-nowrap ${
          scrollShift > 0 ? "animate-pingpong" : "w-fit"
        }`}
        style={
          scrollShift > 0
            ? ({
                "--scroll-shift": `${scrollShift}px`,
                "--duration": `${duration}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
