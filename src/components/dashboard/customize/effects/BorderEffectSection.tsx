"use client";

import React, { useState, useRef, useEffect } from "react";

interface BorderEffectSectionProps {
  borderEffect: string;
  setBorderEffect: (val: string) => void;
  borderEffectColor: string;
  setBorderEffectColor: (val: string) => void;
}

export default function BorderEffectSection({
  borderEffect,
  setBorderEffect,
  borderEffectColor,
  setBorderEffectColor,
}: BorderEffectSectionProps) {
  const [borderDropdownOpen, setBorderDropdownOpen] = useState(false);
  const borderDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (borderDropdownRef.current && !borderDropdownRef.current.contains(event.target as Node)) {
        setBorderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const borderEffects = [
    { id: "none", name: "None" },
    { id: "border-beam", name: "Border Beam" }
  ];

  const isBorderDisabled = !borderEffect || borderEffect === "none";
  const effectsWithColor = ["dither", "snow", "rain", "particles", "shootingstars", "hearts"];

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
        <span className="text-[13px] font-medium text-white/90">Border Effect</span>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="text-[12.5px] font-medium text-white/90">
          Border Effect
        </label>
        <div className="relative" ref={borderDropdownRef}>
          <button
            onClick={() => setBorderDropdownOpen(!borderDropdownOpen)}
            className="w-full flex items-center justify-between px-3 h-[38px] rounded-xl border bg-[#161616] border-white/5 transition-all duration-200 focus:outline-none"
          >
            <span className="text-[13px] text-white font-medium">
              {borderEffects.find(e => e.id === borderEffect)?.name || "Select Effect"}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${borderDropdownOpen ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {borderDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              <div className="flex flex-col">
                {borderEffects.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => {
                      setBorderEffect(effect.id);
                      if (effect.id === "dither") setBorderEffectColor("#000000");
                      else if (effect.id === "snow") setBorderEffectColor("#ffffff");
                      else if (effect.id === "rain") setBorderEffectColor("#7dd3fc");
                      else if (effect.id === "particles") setBorderEffectColor("#ffffff");
                      else if (effect.id === "shootingstars") setBorderEffectColor("#ffffff");
                      else if (effect.id === "hearts") setBorderEffectColor("#ffb6c1");
                      setBorderDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${borderEffect === effect.id
                      ? "bg-white/10 text-white font-medium"
                      : "bg-transparent hover:bg-white/5 text-white/60"
                      }`}
                  >
                    <span className="text-[13px]">{effect.name}</span>
                    {borderEffect === effect.id && (
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

      {(() => {
        const isColorDisabled = isBorderDisabled || !effectsWithColor.includes(borderEffect);
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
                value={(borderEffectColor || "#ffffff").replace('#', '')}
                onChange={(e) => setBorderEffectColor('#' + e.target.value)}
                className={`w-full bg-transparent text-[13px] focus:outline-none ${isColorDisabled ? 'text-white/30 cursor-not-allowed' : 'text-white'}`}
                maxLength={6}
              />
              <div className={`relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 ${isColorDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="color"
                  disabled={isColorDisabled}
                  value={borderEffectColor || "#ffffff"}
                  onChange={(e) => setBorderEffectColor(e.target.value)}
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
