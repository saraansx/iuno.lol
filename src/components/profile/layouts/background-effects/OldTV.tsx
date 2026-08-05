"use client";

export function OldTVEffect({ intensity = 50 }: { intensity?: number }) {
  // Intensity scales the opacity of the static noise. Cap at a higher opacity (0.35) for more grain.
  const staticOpacity = (intensity / 100) * 0.35; 
  
  // Scale the scanline darkness with intensity (between 0.15 and 0.45)
  const scanlineDarkness = 0.15 + (intensity / 100) * 0.3;
  
  // Scale the vignette darkness with intensity (between 0.5 and 0.95)
  const vignetteDarkness = 0.5 + (intensity / 100) * 0.45;

  return (
    <>
      <style>{`
        @keyframes tv-static-anim {
          0% { background-position: 0px 0px; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
      
      {/* Container for the TV effects */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        
        {/* 1. Static Noise Effect */}
        <div 
          className="absolute inset-0"
          style={{
            opacity: staticOpacity,
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")",
            animation: "tv-static-anim 0.4s steps(8) infinite",
          }}
        />

        {/* 2. Scanlines Effect */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, ${scanlineDarkness}) 0%, rgba(0, 0, 0, ${scanlineDarkness}) 50%, transparent 50%, transparent 100%)`,
            backgroundSize: "100% 4px",
          }}
        />

        {/* 3. Vignette (Dark Corners) */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, transparent 35%, rgba(0, 0, 0, ${vignetteDarkness}) 100%)`
          }}
        />
      </div>
    </>
  );
}
