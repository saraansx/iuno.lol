"use client";

import { useState, useEffect } from "react";
interface ZoomInCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ZoomInCardTransition({ children, className = "" }: ZoomInCardTransitionProps) {
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
        transform: visible ? "scale(1)" : "scale(0.8)",
        transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}