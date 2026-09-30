"use client";

import { useState, useEffect } from "react";
interface SlideDownCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function SlideDownCardTransition({ children, className = "" }: SlideDownCardTransitionProps) {
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
        transform: visible ? "translateY(0)" : "translateY(-20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        willChange: done ? undefined : "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}