"use client";

import { useState, useEffect } from "react";
interface BlurCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BlurCardTransition({ children, className = "" }: BlurCardTransitionProps) {
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
        filter: visible ? "blur(0px)" : "blur(20px)",
        transition: "opacity 0.7s ease-out, filter 0.7s ease-out",
        willChange: "filter, opacity",
      }}
    >
      {children}
    </div>
  );
}