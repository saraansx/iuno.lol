"use client";

import { useState, useEffect } from "react";
interface BlurCardTransitionProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BlurCardTransition({ children, className = "" }: BlurCardTransitionProps) {
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
        if (e.target === e.currentTarget && e.propertyName === "filter") setDone(true);
      }}
      style={{
        opacity: visible ? 1 : 0,
        filter: done ? undefined : visible ? "blur(0px)" : "blur(20px)",
        transition: "opacity 0.7s ease-out, filter 0.7s ease-out",
        willChange: done ? undefined : "filter, opacity",
      }}
    >
      {children}
    </div>
  );
}