"use client";

import ColorBends from "./effects/ColorBends";

const SharedBackground = () => {
  return (
    <div
      className="fixed left-0 right-0 top-0 z-0 h-screen w-full pointer-events-none"
      style={{ height: "100lvh" }}
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
