"use client";

export function DitherEffect({ intensity = 50 }: { intensity?: number }) {
  const dotOpacity = 0.05 + (intensity / 100) * 0.55;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Fixed dark tint — baked in, not adjustable */}
        <div className="absolute inset-0 bg-black/30" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 0, 0, ${dotOpacity}) 0.5px, rgba(0, 0, 0, 0) 0.8px)`,
            backgroundSize: "3px 3px",
          }}
        />
      </div>
    </>
  );
}
