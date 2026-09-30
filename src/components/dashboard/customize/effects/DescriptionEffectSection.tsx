"use client";

import { useState, useRef, useEffect } from "react";
import PremiumLock from "@/components/ui/premium-lock";
import { PREMIUM_TEXT_EFFECTS, isPremiumOption } from "@/lib/premium";

interface DescriptionEffectSectionProps {
  isPremium: boolean;
  descriptionEffect: string;
  setDescriptionEffect: (val: string) => void;
  glowEnabled: boolean;
  setGlowEnabled: (val: boolean) => void;
}

const DESCRIPTION_EFFECTS = [
  { id: "none", name: "None" },
  { id: "float", name: "Float" },
  { id: "pulse", name: "Pulse" },
  { id: "flip", name: "Flip" },
  { id: "sparkle", name: "Sparkle" },
  { id: "shuffle", name: "Shuffle" },
  { id: "typewriter", name: "Typewriter" },
  { id: "sakura", name: "Sakura" },
  { id: "blur", name: "Blur" },
  { id: "flicker", name: "Flicker" },
  { id: "flames", name: "Flames" },
  { id: "shimmer", name: "Shimmer" },
  { id: "glitch", name: "Glitch" },
  { id: "distort", name: "Distort" },
];

export default function DescriptionEffectSection({
  isPremium,
  descriptionEffect,
  setDescriptionEffect,
  glowEnabled,
  setGlowEnabled,
}: DescriptionEffectSectionProps) {
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

  const descriptionEffects = DESCRIPTION_EFFECTS;

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
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="14" y2="17" />
        </svg>
        <span className="text-[14px] font-normal text-white/90">Description Effect</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">
          Description Effect
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
          >
            <span>
              {descriptionEffects.find((e) => e.id === descriptionEffect)?.name || "Select Effect"}
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
                {descriptionEffects.map((item) => {
                  const locked = isPremiumOption(PREMIUM_TEXT_EFFECTS, item.id) && !isPremium;
                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      setDescriptionEffect(item.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      descriptionEffect === item.id
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
                    {descriptionEffect === item.id && (
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-white/90">Glow</span>
            <span className="text-[11px] text-white/40 leading-tight">Soft smooth glow over text.</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={glowEnabled}
            onClick={() => setGlowEnabled(!glowEnabled)}
            className={`w-9 h-5 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${glowEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full absolute shadow-sm bg-white transition-all ${glowEnabled ? "right-[3px]" : "left-[3px]"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
