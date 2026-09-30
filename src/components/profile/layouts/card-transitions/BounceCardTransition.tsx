"use client";

import { useState, useEffect } from "react";
interface BounceCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BounceCardTransition({ children, className = "" }: BounceCardTransitionProps) {
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
        transform: visible ? "scale(1)" : "scale(0.3)",
        transition: "opacity 0.5s ease-out, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        willChange: done ? undefined : "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}