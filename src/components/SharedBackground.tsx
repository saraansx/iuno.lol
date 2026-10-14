"use client";

import ColorBends from "./effects/ColorBends";

const SharedBackground = () => {
  return (
    <div
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(120% 100% at 20% 10%, #5b6cf5 0%, #080808 55%, #000000 100%)",
      }}
    >
      <ColorBends
        colors={["#5b6cf5", "#000000", "#8b93e8"]}
        rotation={90}
        speed={0.15}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={0.8}
        noise={0.1}
        parallax={0.5}
        iterations={1}
        intensity={0.4}
        bandWidth={6}
        maxPixelRatio={1.25}
        transparent
      />
    </div>
  );
};

export default SharedBackground;
