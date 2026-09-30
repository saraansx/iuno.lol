"use client";

import { useState, useEffect } from "react";
interface FadeCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function FadeCardTransition({ children, className = "" }: FadeCardTransitionProps) {
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
        if (e.target === e.currentTarget && e.propertyName === "opacity") setDone(true);
      }}
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease-out",
        overflow: "visible",
        willChange: done ? undefined : "opacity",
      }}
    >
      {children}
    </div>
  );
}
