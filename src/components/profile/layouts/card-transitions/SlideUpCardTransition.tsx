"use client";

import { useState, useEffect } from "react";
interface SlideUpCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function SlideUpCardTransition({ children, className = "" }: SlideUpCardTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}