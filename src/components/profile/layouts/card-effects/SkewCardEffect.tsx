"use client";

import React, { useRef, useState, useCallback } from "react";

interface SkewCardEffectProps {
  children?: React.ReactNode;
  className?: string;
}

export default function SkewCardEffect({ children, className = "" }: SkewCardEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / (rect.width / 2)) * 6;
    const rotateX = -(mouseY / (rect.height / 2)) * 6;
    const skewX = (mouseX / (rect.width / 2)) * 5;
    const skewY = -(mouseY / (rect.height / 2)) * 3;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) skew(${skewY}deg, ${skewX}deg)`
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
