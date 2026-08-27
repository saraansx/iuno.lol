"use client";

/**
 * Dithering grain overlay.
 *
 * Deliberately has no colour option: the effect is a darkening texture laid over
 * whatever is behind it, and a light dot colour inverts that into a haze that
 * washes the page out rather than texturing it. The dots are always black and
 * only their opacity responds to intensity.
 */
export function DitherEffect({ intensity = 50 }: { intensity?: number }) {
  // Intensity scales the opacity of the grain layer and darkness of dots
  const grainOpacity = 0.02 + (intensity / 100) * 0.08;
  const dotOpacity = 0.2 + (intensity / 100) * 0.8;

  return (
    <>
      {/* Container for the Dither effects */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        
        {/* 1. Dot Pattern
             Tighter grid (3px vs 4px) with a smaller dot radius, so the pattern
             reads as fine dithering rather than visible spots. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 0, 0, ${dotOpacity}) 0.5px, rgba(0, 0, 0, 0) 0.9px)`,
            backgroundSize: "3px 3px",
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
