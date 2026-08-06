"use client";

import ColorBends from "./effects/ColorBends";

const SharedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 blur-[3px] pointer-events-none">
      <ColorBends
        colors={["#609fda", "#000000", "#90afcc"]}
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
        transparent
      />
    </div>
  );
};

export default SharedBackground;
