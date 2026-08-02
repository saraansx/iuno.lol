"use client";

import React from "react";
import BackgroundEffectSection from "./BackgroundEffectSection";
import BorderEffectSection from "./BorderEffectSection";

interface EffectsCustomizationProps {
  backgroundEffect: string;
  setBackgroundEffect: (val: string) => void;
  backgroundEffectIntensity: number;
  setBackgroundEffectIntensity: (val: number) => void;
  backgroundEffectColor: string;
  setBackgroundEffectColor: (val: string) => void;
  backgroundEffectAboveContainer: boolean;
  setBackgroundEffectAboveContainer: (val: boolean) => void;
  borderEffect: string;
  setBorderEffect: (val: string) => void;
  borderEffectColor: string;
  setBorderEffectColor: (val: string) => void;
}

export default function EffectsCustomization({
  backgroundEffect,
  setBackgroundEffect,
  backgroundEffectIntensity,
  setBackgroundEffectIntensity,
  backgroundEffectColor,
  setBackgroundEffectColor,
  backgroundEffectAboveContainer,
  setBackgroundEffectAboveContainer,
  borderEffect,
  setBorderEffect,
  borderEffectColor,
  setBorderEffectColor,
}: EffectsCustomizationProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BackgroundEffectSection
            backgroundEffect={backgroundEffect}
            setBackgroundEffect={setBackgroundEffect}
            backgroundEffectIntensity={backgroundEffectIntensity}
            setBackgroundEffectIntensity={setBackgroundEffectIntensity}
            backgroundEffectColor={backgroundEffectColor}
            setBackgroundEffectColor={setBackgroundEffectColor}
            backgroundEffectAboveContainer={backgroundEffectAboveContainer}
            setBackgroundEffectAboveContainer={setBackgroundEffectAboveContainer}
          />
          <BorderEffectSection
            borderEffect={borderEffect}
            setBorderEffect={setBorderEffect}
            borderEffectColor={borderEffectColor}
            setBorderEffectColor={setBorderEffectColor}
          />
        </div>
      </div>
    </div>
  );
}
