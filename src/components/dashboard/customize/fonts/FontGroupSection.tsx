"use client";

import { useState } from "react";
import { FONT_FAMILY_VARS, FONT_OPTIONS as SHARED_FONT_OPTIONS } from "@/lib/fonts";
import NumberDraftInput from "@/components/ui/number-draft-input";

export const FONT_OPTIONS = SHARED_FONT_OPTIONS;

export const fontVariables = FONT_FAMILY_VARS;

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
                <NumberDraftInput
                  min={10}
                  max={64}
                  suffix="px"
                  value={size}
                  onCommit={setSize}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-medium text-white/90">Weight</label>
                <NumberDraftInput
                  min={100}
                  max={900}
                  step={100}
                  value={weight}
                  onCommit={setWeight}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
                <NumberDraftInput
                  min={-10}
                  max={50}
                  step={0.1}
                  suffix="px"
                  value={spacing}
                  onCommit={setSpacing}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
