"use client";

import { useState, useEffect } from "react";
interface FadeCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function FadeCardTransition({ children, className = "" }: FadeCardTransitionProps) {
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
        transition: "opacity 1s ease-out",
        overflow: "visible",
        willChange: "opacity",
      }}
    >
      {children}
    </div>
  );
}
