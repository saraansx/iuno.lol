"use client";

import { useEffect, useState } from "react";
export function SnowEffect({ intensity = 50, color = "#ffffff" }: { intensity?: number; color?: string }) {
  const [flakes, setFlakes] = useState<{ id: number; left: number; animationDuration: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const flakeCount = Math.floor((intensity / 100) * 150);
    // Wrap in setTimeout to prevent synchronous cascading render warnings
    const timeoutId = setTimeout(() => {
      setFlakes((prev) => {
        if (prev.length === flakeCount) return prev;
        if (prev.length > flakeCount) return prev.slice(0, flakeCount);
        const newFlakes = [...prev];
        for (let i = prev.length; i < flakeCount; i++) {
          newFlakes.push({
            id: i,
            left: Math.random() * 100,
            animationDuration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
            size: Math.random() * 4 + 2,
          });
        }
        return newFlakes;
      });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [intensity]);

  return (
    <>
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10vh) translateX(0px); opacity: 1; }
          100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; }
        }
      `}</style>
      {flakes.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full opacity-80"
          style={{
            backgroundColor: color,
            left: `${f.left}%`,
            top: `-5%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animation: `snowfall ${f.animationDuration}s linear infinite`,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}
    </>
  );
}
