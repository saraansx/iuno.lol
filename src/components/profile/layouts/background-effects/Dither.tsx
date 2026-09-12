"use client";

export function DitherEffect({ intensity = 50 }: { intensity?: number }) {
  const grainOpacity = 0.01 + (intensity / 100) * 0.04;
  const dotOpacity = 0.05 + (intensity / 100) * 0.55;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Fixed subtle dark tint — baked in, not adjustable */}
        <div className="absolute inset-0 bg-black/25" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 0, 0, ${dotOpacity}) 0.5px, rgba(0, 0, 0, 0) 0.8px)`,
            backgroundSize: "3px 3px",
          }}
        />

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
