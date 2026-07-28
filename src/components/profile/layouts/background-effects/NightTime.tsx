"use client";

import React, { useEffect, useState } from "react";

export function NightTimeEffect({ intensity = 50 }: { intensity?: number }) {
  const [stars, setStars] = useState<{ id: number; left: number; top: number; size: number; animationDuration: number; delay: number }[]>([]);

  useEffect(() => {
    const starCount = Math.floor((intensity / 100) * 100);
    setStars((prev) => {
      if (prev.length === starCount) return prev;
      if (prev.length > starCount) return prev.slice(0, starCount);
      const newStars = [...prev];
      for (let i = prev.length; i < starCount; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + 1,
          animationDuration: Math.random() * 3 + 2,
          delay: Math.random() * 5,
        });
      }
      return newStars;
    });
  }, [intensity]);

  // The darkness opacity scales with intensity, up to 90% dark
  const darknessOpacity = (intensity / 100) * 0.75;

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      
      {/* Dark overlay for night effect */}
      <div 
        className="absolute inset-0 bg-[#02040a] transition-opacity duration-500" 
        style={{ opacity: darknessOpacity }} 
      />
      
      {/* Stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `twinkle ${s.animationDuration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
}
