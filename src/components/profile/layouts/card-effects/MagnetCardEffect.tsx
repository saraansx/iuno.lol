"use client";

import { useRef, useState, useCallback } from "react";
interface MagnetCardEffectProps {
  children?: React.ReactNode;
  className?: string;
}

export default function MagnetCardEffect({ children, className = "" }: MagnetCardEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;

    setTransform(`translate(${offsetX}px, ${offsetY}px)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("translate(0px, 0px)");
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
