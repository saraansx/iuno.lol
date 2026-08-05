"use client";

import { useRef, useState, useCallback } from "react";
interface ZoomCardEffectProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ZoomCardEffect({ children, className = "" }: ZoomCardEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("scale(1)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Slight perspective tilt toward the cursor while zoomed
    const rotateY = (mouseX / (rect.width / 2)) * 4;
    const rotateX = -(mouseY / (rect.height / 2)) * 4;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.06)`
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("scale(1)");
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
