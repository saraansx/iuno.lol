"use client";

import { useState, useEffect } from "react";
interface FlipCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function FlipCardTransition({ children, className = "" }: FlipCardTransitionProps) {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={className}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === "transform") setDone(true);
      }}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "rotateY(0deg)" : "rotateY(90deg)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        willChange: done ? undefined : "transform, opacity",
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {children}
    </div>
  );
}