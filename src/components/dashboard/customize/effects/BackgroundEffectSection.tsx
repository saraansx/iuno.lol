"use client";

import { useState, useRef, useEffect } from "react";
interface BackgroundEffectSectionProps {
  backgroundEffect: string;
  setBackgroundEffect: (val: string) => void;
  backgroundEffectIntensity: number;
  setBackgroundEffectIntensity: (val: number) => void;
  backgroundEffectColor: string;
  setBackgroundEffectColor: (val: string) => void;
  backgroundEffectAboveContainer: boolean;
  setBackgroundEffectAboveContainer: (val: boolean) => void;
}

const BACKGROUND_EFFECTS = [
  { id: "none", name: "None" },
  { id: "snow", name: "Snow" },
  { id: "rain", name: "Rain" },
  { id: "particles", name: "Particles" },
  { id: "shootingstars", name: "Shooting Stars" },
  { id: "hearts", name: "Hearts" },
  { id: "nighttime", name: "Night Time" },
  { id: "oldtv", name: "Old TV" },
  { id: "dither", name: "Dither" },
];

const EFFECTS_WITH_COLOR = ["dither", "snow", "rain", "particles", "shootingstars", "hearts"];

export default function BackgroundEffectSection({
  backgroundEffect,
  setBackgroundEffect,
  backgroundEffectIntensity,
  setBackgroundEffectIntensity,
  backgroundEffectColor,
  setBackgroundEffectColor,
  backgroundEffectAboveContainer,
  setBackgroundEffectAboveContainer,
}: BackgroundEffectSectionProps) {
  const [bgDropdownOpen, setBgDropdownOpen] = useState(false);
  const bgDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bgDropdownRef.current && !bgDropdownRef.current.contains(event.target as Node)) {
        setBgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const effects = BACKGROUND_EFFECTS;
  const isBgDisabled = !backgroundEffect || backgroundEffect === "none";
  const effectsWithColor = EFFECTS_WITH_COLOR;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] flex flex-col p-6 transition-all duration-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5b6cf5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="text-[13px] font-medium text-white/90">Background Effect</span>
      </div>

      <div className={`flex items-center justify-between mb-4 mt-2 transition-opacity duration-200 ${isBgDisabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <span className="text-[12.5px] font-medium text-white/90">Render Above Container</span>
        <button
          disabled={isBgDisabled}
          onClick={() => setBackgroundEffectAboveContainer(!backgroundEffectAboveContainer)}
          className={`relative inline-flex h-5 w-[34px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${
            backgroundEffectAboveContainer ? 'bg-[#5b6cf5]' : 'bg-[#1a1a1a]'
          } ${isBgDisabled ? 'cursor-not-allowed' : ''}`}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              backgroundEffectAboveContainer ? 'translate-x-[14px]' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="text-[12.5px] font-medium text-white/90">
          Background Effect
        </label>
        <div className="relative" ref={bgDropdownRef}>
          <button
            onClick={() => setBgDropdownOpen(!bgDropdownOpen)}
            className="w-full flex items-center justify-between px-3 h-[38px] rounded-xl border bg-[#161616] border-white/5 transition-all duration-200 focus:outline-none"
          >
            <span className="text-[13px] text-white font-medium">
              {effects.find(e => e.id === backgroundEffect)?.name || "Select Effect"}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${bgDropdownOpen ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {bgDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              <div className="flex flex-col">
                {effects.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => {
                      setBackgroundEffect(effect.id);
                      if (effect.id === "dither") setBackgroundEffectColor("#000000");
                      else if (effect.id === "snow") setBackgroundEffectColor("#ffffff");
                      else if (effect.id === "rain") setBackgroundEffectColor("#7dd3fc");
                      else if (effect.id === "particles") setBackgroundEffectColor("#ffffff");
                      else if (effect.id === "shootingstars") setBackgroundEffectColor("#ffffff");
                      else if (effect.id === "hearts") setBackgroundEffectColor("#ffb6c1");
                      setBgDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${backgroundEffect === effect.id
                      ? "bg-white/10 text-white font-medium"
                      : "bg-transparent hover:bg-white/5 text-white/60"
                      }`}
                  >
                    <span className="text-[13px]">{effect.name}</span>
                    {backgroundEffect === effect.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-3 mt-5 transition-opacity duration-200 ${isBgDisabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <div className="flex items-center justify-between">
          <label className="text-[12.5px] font-medium text-white/90">
            Intensity
          </label>
          <span className="text-[12px] text-white/40 font-mono">
            {backgroundEffectIntensity}
          </span>
        </div>
        <div className="relative flex items-center h-5 group w-full">
          <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-[#5b6cf5]"
              style={{ width: `${backgroundEffectIntensity}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            disabled={isBgDisabled}
            value={backgroundEffectIntensity}
            onChange={(e) => setBackgroundEffectIntensity(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
          />
          <div
            className={`absolute w-4 h-4 bg-[#050505] border-[2px] ${isBgDisabled ? "border-[#252a4a]" : "border-[#5b6cf5]"
              } rounded-full pointer-events-none transition-transform shadow-lg`}
            style={{
              left: `calc(${backgroundEffectIntensity}% - 8px)`
            }}
          />
        </div>
      </div>

      {(() => {
        const isColorDisabled = isBgDisabled || !effectsWithColor.includes(backgroundEffect);
        return (
          <div className={`flex flex-col gap-3 mt-6 transition-opacity duration-200 ${isColorDisabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
            <label className="text-[12.5px] font-medium text-white/90">
              Color
            </label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px] group transition-colors focus-within:border-white/10">
              <span className={`text-[13px] mr-2 ${isColorDisabled ? 'text-white/10' : 'text-white/30'}`}>#</span>
              <input
                type="text"
                disabled={isColorDisabled}
                value={(backgroundEffectColor || "#ffffff").replace('#', '')}
                onChange={(e) => setBackgroundEffectColor('#' + e.target.value)}
                className={`w-full bg-transparent text-[13px] focus:outline-none ${isColorDisabled ? 'text-white/30 cursor-not-allowed' : 'text-white'}`}
                maxLength={6}
              />
              <div className={`relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 ${isColorDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="color"
                  disabled={isColorDisabled}
                  value={backgroundEffectColor || "#ffffff"}
                  onChange={(e) => setBackgroundEffectColor(e.target.value)}
                  className={`absolute -inset-1 w-8 h-8 border-0 p-0 ${isColorDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
