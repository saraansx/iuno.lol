"use client";

import { useState, useRef, useEffect } from "react";
import ColorPickerInput from "@/components/ui/color-picker";
import PremiumLock from "@/components/ui/premium-lock";
import { PREMIUM_CURSOR_TRAILS, isPremiumOption } from "@/lib/premium";

interface CursorTrailSectionProps {
  isPremium: boolean;
  cursorTrail: string;
  setCursorTrail: (val: string) => void;
  cursorTrailColor: string;
  setCursorTrailColor: (val: string) => void;
}

const CURSOR_TRAILS = [
  { id: "none", name: "None" },
  { id: "fluid-line", name: "Fluid Line" },
  { id: "stars", name: "Sparkles" },
  { id: "ghost", name: "Ghost" },
  { id: "sakura", name: "Sakura Petals" },
  { id: "oneko", name: "Oneko" },
  { id: "glow", name: "Glow" },
  { id: "stardust", name: "Stardust" },
  { id: "snowflake", name: "Snowflake" },
  { id: "bubbles", name: "Bubbles" },
];

export default function CursorTrailSection({
  isPremium,
  cursorTrail,
  setCursorTrail,
  cursorTrailColor,
  setCursorTrailColor,
}: CursorTrailSectionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cursorTrails = CURSOR_TRAILS;
  const isColorDisabled = !cursorTrail || cursorTrail === "none";

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
          <path d="M5 3l6.5 17 2-6.5L20 11.5 5 3z" />
        </svg>
        <span className="text-[14px] font-normal text-white/90">Cursor Trail</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">
          Cursor Trail
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
          >
            <span>
              {cursorTrails.find((e) => e.id === cursorTrail)?.name || "Select Effect"}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 opacity-60 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1.5 bg-[#161616] border border-white/10 rounded-xl p-1.5 z-30 shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-0.5">
                {cursorTrails.map((item) => {
                  const locked = isPremiumOption(PREMIUM_CURSOR_TRAILS, item.id) && !isPremium;
                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      setCursorTrail(item.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      cursorTrail === item.id
                        ? "bg-white/10 text-white font-medium"
                        : locked
                        ? "text-white/35"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-[13px] flex items-center gap-2">
                      {item.name}
                      {locked && <PremiumLock size={12} />}
                    </span>
                    {cursorTrail === item.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-3 mt-6 transition-opacity duration-200 ${isColorDisabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <label className="text-[12.5px] font-medium text-white/90">
          Color
        </label>

        <ColorPickerInput
          disabled={isColorDisabled}
          value={cursorTrailColor || "#ffffff"}
          onChange={setCursorTrailColor}
        />
      </div>
    </div>
  );
}
