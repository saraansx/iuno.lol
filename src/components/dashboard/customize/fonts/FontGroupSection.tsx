"use client";

import { useState } from "react";

export const FONT_OPTIONS = [
  "Inter", "Pacifico", "Roboto", "Elegant Bloom", "Outfit",
  "Caviar Dreams", "Space Grotesk", "Caveat", "Playfair Display", "Paper Notes",
  "Poppins", "Chillax", "Montserrat", "Dancing Script", "DM Sans",
  "Comfortaa", "Syne", "Oxanium", "Pixelify"
];

export const fontVariables: Record<string, string> = {
  "Inter": "var(--font-inter)",
  "Roboto": "var(--font-roboto)",
  "Outfit": "var(--font-outfit)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Playfair Display": "var(--font-playfair)",
  "Poppins": "var(--font-poppins)",
  "Montserrat": "var(--font-montserrat)",
  "DM Sans": "var(--font-dm-sans)",
  "Syne": "var(--font-syne)",
  "Oxanium": "var(--font-oxanium)",
  "Pacifico": "var(--font-pacifico)",
  "Caveat": "var(--font-caveat)",
  "Paper Notes": "var(--font-paper-notes)",
  "Chillax": "var(--font-chillax)",
  "Dancing Script": "var(--font-dancing-script)",
  "Comfortaa": "var(--font-comfortaa)",
  "Elegant Bloom": "var(--font-elegant-bloom)",
  "Caviar Dreams": "var(--font-caviar-dreams)",
  "Pixelify": "var(--font-pixelify)",
};

interface FontGroupSectionProps {
  label: string;
  hint?: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  font: string;
  setFont: (val: string) => void;
  size: number;
  setSize: (val: number) => void;
  weight: number;
  setWeight: (val: number) => void;
  spacing: number;
  setSpacing: (val: number) => void;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export default function FontGroupSection({
  label,
  hint,
  icon,
  isOpen,
  onToggle,
  font,
  setFont,
  size,
  setSize,
  weight,
  setWeight,
  spacing,
  setSpacing,
}: FontGroupSectionProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const family = fontVariables[font] || "var(--font-inter)";

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
      >
        <div className="text-white/50">{icon}</div>
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[13px] font-medium text-white/90">{label}</span>
          {hint && <span className="text-[11.5px] text-white/40 leading-tight">{hint}</span>}
        </div>
        <span className="text-[12.5px] text-white/40 shrink-0" style={{ fontFamily: family }}>
          {font}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0.5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 h-[38px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
              >
                <span className="text-[12.5px] font-medium text-white/90 px-1" style={{ fontFamily: family }}>
                  Font Family
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-white/50" style={{ fontFamily: family }}>{font}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {FONT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFont(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors ${option === font
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                        }`}
                      style={{ fontFamily: fontVariables[option] || "var(--font-inter)" }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-medium text-white/90">Size</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                  <input
                    type="number"
                    min={10}
                    max={64}
                    value={size}
                    onChange={(e) => setSize(e.target.value === "" ? 0 : Number(e.target.value))}
                    onBlur={() => setSize(clamp(size, 10, 64))}
                    className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[13px] text-white/30 ml-2">px</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-medium text-white/90">Weight</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                  <input
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                    onBlur={() => setWeight(clamp(weight, 100, 900))}
                    className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                  <input
                    type="number"
                    min={-10}
                    max={50}
                    step={0.1}
                    value={spacing}
                    onChange={(e) => setSpacing(e.target.value === "" ? 0 : Number(e.target.value))}
                    onBlur={() => setSpacing(clamp(spacing, -10, 50))}
                    className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[13px] text-white/30 ml-2">px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
