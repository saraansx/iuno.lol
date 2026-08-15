"use client";

import { useState } from "react";
import ColorPickerInput from "@/components/ui/color-picker";

const FONT_OPTIONS = [
  "Inter", "Pacifico", "Roboto", "Elegant Bloom", "Outfit",
  "Caviar Dreams", "Space Grotesk", "Caveat", "Playfair Display", "Paper Notes",
  "Poppins", "Matcha Mint", "Montserrat", "Dancing Script", "DM Sans",
  "Comfortaa", "Syne", "Indie Flower", "Oswald", "Lobster"
];

const fontVariables: Record<string, string> = {
  "Inter": "var(--font-inter)",
  "Roboto": "var(--font-roboto)",
  "Outfit": "var(--font-outfit)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Playfair Display": "var(--font-playfair)",
  "Poppins": "var(--font-poppins)",
  "Montserrat": "var(--font-montserrat)",
  "DM Sans": "var(--font-dm-sans)",
  "Syne": "var(--font-syne)",
  "Oswald": "var(--font-oswald)",
  "Pacifico": "var(--font-pacifico)",
  "Caveat": "var(--font-caveat)",
  "Paper Notes": "var(--font-paper-notes)",
  "Matcha Mint": "var(--font-matcha-mint)",
  "Dancing Script": "var(--font-dancing-script)",
  "Comfortaa": "var(--font-comfortaa)",
  "Elegant Bloom": "var(--font-elegant-bloom)",
  "Caviar Dreams": "var(--font-caviar-dreams)",
  "Indie Flower": "var(--font-indie-flower)",
  "Lobster": "var(--font-lobster)",
};

interface TapToEnterSectionProps {
  enterScreenEnabled: boolean;
  setEnterScreenEnabled: (val: boolean) => void;
  enterScreenText: string;
  setEnterScreenText: (val: string) => void;
  enterScreenFont: string;
  setEnterScreenFont: (val: string) => void;
  enterScreenFontSize: number;
  setEnterScreenFontSize: (val: number) => void;
  enterScreenFontWeight: number;
  setEnterScreenFontWeight: (val: number) => void;
  enterScreenLetterSpacing: number;
  setEnterScreenLetterSpacing: (val: number) => void;
  enterScreenColor: string;
  setEnterScreenColor: (val: string) => void;
  enterScreenOpacity: number;
  setEnterScreenOpacity: (val: number) => void;
  enterScreenBlur: number;
  setEnterScreenBlur: (val: number) => void;
  enterScreenBlurColor: string;
  setEnterScreenBlurColor: (val: string) => void;
}

export default function TapToEnterSection({
  enterScreenEnabled,
  setEnterScreenEnabled,
  enterScreenText,
  setEnterScreenText,
  enterScreenFont,
  setEnterScreenFont,
  enterScreenFontSize,
  setEnterScreenFontSize,
  enterScreenFontWeight,
  setEnterScreenFontWeight,
  enterScreenLetterSpacing,
  setEnterScreenLetterSpacing,
  enterScreenColor,
  setEnterScreenColor,
  enterScreenOpacity,
  setEnterScreenOpacity,
  enterScreenBlur,
  setEnterScreenBlur,
  enterScreenBlurColor,
  setEnterScreenBlurColor,
}: TapToEnterSectionProps) {
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] flex flex-col p-6 transition-all duration-200 shadow-sm col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span className="text-[16px] font-semibold text-white/90">Enter text</span>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enterScreenEnabled}
          onClick={() => setEnterScreenEnabled(!enterScreenEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enterScreenEnabled ? "bg-[#5b6cf5]" : "bg-white/10"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              enterScreenEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className={`flex flex-col gap-5 transition-opacity duration-200 ${enterScreenEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        {/* Overlay Text Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-medium text-white/90">
            Overlay Text
          </label>
          <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] group transition-colors focus-within:border-white/10">
            <input
              type="text"
              disabled={!enterScreenEnabled}
              value={enterScreenText}
              onChange={(e) => setEnterScreenText(e.target.value)}
              placeholder="click to enter"
              maxLength={60}
              className="w-full bg-transparent text-[13.5px] text-white placeholder-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Typography Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Font Family Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Font Family</label>
            <div className="relative">
              <button
                type="button"
                disabled={!enterScreenEnabled}
                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-3.5 h-[40px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
              >
                <span className="text-[13px] text-white/90" style={{ fontFamily: fontVariables[enterScreenFont] || "var(--font-inter)" }}>
                  {enterScreenFont}
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
                  className={`text-white/40 transition-transform duration-200 ${isFontDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isFontDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => {
                        setEnterScreenFont(font);
                        setIsFontDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                        enterScreenFont === font
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                      style={{ fontFamily: fontVariables[font] || "var(--font-inter)" }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Text Color</label>
            <ColorPickerInput
              disabled={!enterScreenEnabled}
              value={enterScreenColor || "#ffffff"}
              onChange={setEnterScreenColor}
            />
          </div>
        </div>

        {/* Font Size, Weight, Letter Spacing */}
        <div className="grid grid-cols-3 gap-3">
          {/* Size */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Size</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
              <input
                type="number"
                disabled={!enterScreenEnabled}
                min={10}
                max={48}
                value={enterScreenFontSize}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") setEnterScreenFontSize(0);
                  else setEnterScreenFontSize(Number(val));
                }}
                onBlur={() => {
                  if (typeof enterScreenFontSize === "number") {
                    setEnterScreenFontSize(Math.max(10, Math.min(48, enterScreenFontSize)));
                  }
                }}
                className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[13px] text-white/30 ml-2">px</span>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Weight</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
              <input
                type="number"
                disabled={!enterScreenEnabled}
                min={100}
                max={900}
                step={100}
                value={enterScreenFontWeight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") setEnterScreenFontWeight(0);
                  else setEnterScreenFontWeight(Number(val));
                }}
                onBlur={() => {
                  if (typeof enterScreenFontWeight === "number") {
                    setEnterScreenFontWeight(Math.max(100, Math.min(900, enterScreenFontWeight)));
                  }
                }}
                className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
              <input
                type="number"
                disabled={!enterScreenEnabled}
                min={-5}
                max={20}
                step={0.5}
                value={enterScreenLetterSpacing}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") setEnterScreenLetterSpacing(0);
                  else setEnterScreenLetterSpacing(Number(val));
                }}
                onBlur={() => {
                  if (typeof enterScreenLetterSpacing === "number") {
                    setEnterScreenLetterSpacing(Math.max(-5, Math.min(20, enterScreenLetterSpacing)));
                  }
                }}
                className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[13px] text-white/30 ml-2">px</span>
            </div>
          </div>
        </div>

        {/* Text Opacity Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-[12.5px] font-medium text-white/90">Text Opacity</label>
            <span className="text-[12px] text-white/40 font-mono">{enterScreenOpacity}%</span>
          </div>
          <div className="relative flex items-center h-5 group w-full">
            <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-[#5b6cf5]"
                style={{ width: `${((enterScreenOpacity - 10) / 90) * 100}%` }}
              />
            </div>
            <input
              type="range"
              disabled={!enterScreenEnabled}
              min={10}
              max={100}
              step={1}
              value={enterScreenOpacity}
              onChange={(e) => setEnterScreenOpacity(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div
              className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
              style={{
                left: `calc(${((enterScreenOpacity - 10) / 90) * 100}% - 8px)`
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/30">
            <span>10 %</span>
            <span>50 %</span>
            <span>100 %</span>
          </div>
        </div>

        {/* Blur Intensity & Blur Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Blur Intensity Slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[12.5px] font-medium text-white/90">Blur Intensity</label>
              <span className="text-[12px] text-white/40 font-mono">{enterScreenBlur}px</span>
            </div>
            <div className="relative flex items-center h-5 group w-full">
              <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-[#5b6cf5]"
                  style={{ width: `${(Math.min(enterScreenBlur, 40) / 40) * 100}%` }}
                />
              </div>
              <input
                type="range"
                disabled={!enterScreenEnabled}
                min={0}
                max={40}
                step={1}
                value={enterScreenBlur}
                onChange={(e) => setEnterScreenBlur(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div
                className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
                style={{
                  left: `calc(${(Math.min(enterScreenBlur, 40) / 40) * 100}% - 8px)`
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-white/30">
              <span>0 px</span>
              <span>20 px</span>
              <span>40 px</span>
            </div>
          </div>

          {/* Blur Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Blur Color</label>
            <ColorPickerInput
              disabled={!enterScreenEnabled}
              value={enterScreenBlurColor || "#000000"}
              onChange={setEnterScreenBlurColor}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[11.5px] text-white/40">
          <p>
            Visitors will see a fullscreen overlay with this text and style, and must click to reveal your profile.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/40 inline-block shrink-0" />
            <span>Supports Markdown and custom Discord emojis (e.g. &lt;:emoji:id&gt; or &lt;a:emoji:id&gt;).</span>
          </p>
        </div>
      </div>
    </div>
  );
}
