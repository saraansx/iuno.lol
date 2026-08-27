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


  const darkOpacity = (intensity / 100) * 1.00;

  return (
    <>
      {/* Container for the Dither effects */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">

        {/* 0. Dark wash — sits beneath the dots so the texture stays visible on top. */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: darkOpacity }}
        />

        {/* 1. Dot Pattern
             The falloff has to stay well under the tile size. At 1.2px falloff on a
             3px tile the black circles nearly meet, so black becomes the dominant
             field and the *gaps* read as light dots — the pattern inverts. Keeping
             the falloff at ~0.8px leaves clear space between dots, so they read as
             dark specks over the background as intended. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 0, 0, ${dotOpacity}) 0.5px, rgba(0, 0, 0, 0) 0.8px)`,
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
