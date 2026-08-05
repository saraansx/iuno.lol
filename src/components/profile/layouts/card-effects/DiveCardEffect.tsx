"use client";

import { useRef, useState, useCallback } from "react";
interface DiveCardEffectProps {
  children?: React.ReactNode;
  className?: string;
}

export default function DiveCardEffect({ children, className = "" }: DiveCardEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1200px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // -1 to 1 relative to center
    const relX = (e.clientX - centerX) / (rect.width / 2);
    const relY = (e.clientY - centerY) / (rect.height / 2);

    // Stronger tilt than zoom — the card "dives" toward the cursor
    const rotateY = relX * 10;
    const rotateX = -relY * 10;

    setTransform(
      `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Spring back with a bounce
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg)");
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-500 ${className}`}
      style={{ transform, transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
