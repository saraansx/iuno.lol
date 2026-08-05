"use client";

import React, { useRef, useState, useCallback } from "react";

interface ElasticCardEffectProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ElasticCardEffect({ children, className = "" }: ElasticCardEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("scale(1, 1)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // -1 to 1 relative to center
    const relX = (e.clientX - centerX) / (rect.width / 2);
    const relY = (e.clientY - centerY) / (rect.height / 2);

    // Stretch toward the cursor along each axis (rubber-band feel)
    const scaleX = 1 + relX * 0.15;
    const scaleY = 1 - relX * 0.06 + Math.abs(relY) * 0.05;
    const rotate = relX * 4;

    setTransform(`rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Snap back with a springy overshoot via the transition
    setTransform("scale(1, 1)");
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
