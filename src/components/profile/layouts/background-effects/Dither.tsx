"use client";

import React from "react";

function hexToRgb(hex: string) {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map(c => c + c).join("");
  }
  if (clean.length !== 6) return "0, 0, 0";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function DitherEffect({ intensity = 50, color = "#000000" }: { intensity?: number, color?: string }) {
  // Intensity scales the opacity of the grain layer and darkness of dots
  const grainOpacity = 0.02 + (intensity / 100) * 0.08; 
  const dotOpacity = 0.2 + (intensity / 100) * 0.8;
  
  const rgbColor = hexToRgb(color);

  return (
    <>
      {/* Container for the Dither effects */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        
        {/* 1. Dot Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(${rgbColor}, ${dotOpacity}) 1px, rgba(${rgbColor}, 0) 1.4px)`,
            backgroundSize: "4px 4px",
          }}
        />

        {/* 2. Grain Texture */}
        <div 
          className="absolute inset-0"
          style={{
            opacity: grainOpacity,
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noise)'/></svg>\")",
          }}
        />
      </div>
    </>
  );
}
