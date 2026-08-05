"use client";

import LineWaves from "./LineWaves";

const SharedBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 blur-[3px] pointer-events-none">
      <LineWaves
        speed={0.4}
        innerLineCount={12}
        outerLineCount={20}
        warpIntensity={1}
        rotation={-45}
        edgeFadeWidth={0}
        colorCycleSpeed={1}
        brightness={0.1}
        color1="#609fda"
        color2="#000000"
        color3="#90afcc"
        enableMouseInteraction
        mouseInfluence={0.1}
      />
    </div>
  );
};

export default SharedBackground;
