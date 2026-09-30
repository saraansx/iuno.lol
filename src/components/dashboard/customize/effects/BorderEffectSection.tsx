"use client";

import { useState, useRef, useEffect } from "react";
import ColorPickerInput from "@/components/ui/color-picker";
import PremiumLock from "@/components/ui/premium-lock";
import { PREMIUM_BORDER_EFFECTS, isPremiumOption } from "@/lib/premium";
interface BorderEffectSectionProps {
  isPremium: boolean;
  borderEffect: string;
  setBorderEffect: (val: string) => void;
  borderEffectColor: string;
  setBorderEffectColor: (val: string) => void;
}

function parseBorderColors(value: string): { from: string; to: string } {
  const parts = (value || "#ffffff").split(",");
  const from = parts[0]?.trim() || "#ffffff";
  const to = parts[1]?.trim() || from;
  return { from, to };
}

const BORDER_EFFECTS = [
  { id: "none", name: "None" },
  { id: "shine-border", name: "Shine Border" },
  { id: "electric-border", name: "Electric Border" }
];

export default function BorderEffectSection({
  isPremium,
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

  const borderEffects = BORDER_EFFECTS;
  const isBorderDisabled = !borderEffect || borderEffect === "none";
  const isSingleColorEffect = borderEffect === "electric-border";

  const { from, to } = parseBorderColors(borderEffectColor);

  const setBorderColors = (nextFrom: string, nextTo: string) => {
    setBorderEffectColor(nextFrom === nextTo ? nextFrom : `${nextFrom},${nextTo}`);
  };

  const setFrom = (val: string) => {
    if (isSingleColorEffect) {
      setBorderEffectColor(val);
    } else {
      setBorderColors(val, to);
    }
  };
  const setTo = (val: string) => setBorderColors(from, val);

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
        </svg>
        <span className="text-[14px] font-normal text-white/90">Border Effect</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">
          Border Effect
        </label>

        <div className="relative" ref={borderDropdownRef}>
          <button
            type="button"
            onClick={() => setBorderDropdownOpen(!borderDropdownOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
          >
            <span>
              {borderEffects.find(e => e.id === borderEffect)?.name || "Select Effect"}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 opacity-60 ${borderDropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {borderDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1.5 bg-[#161616] border border-white/10 rounded-xl p-1.5 z-30 shadow-xl max-h-48 overflow-y-auto">
              <div className="flex flex-col gap-0.5">
                {borderEffects.map((effect) => {
                  const locked = isPremiumOption(PREMIUM_BORDER_EFFECTS, effect.id) && !isPremium;
                  return (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      setBorderEffect(effect.id);
                      setBorderDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${borderEffect === effect.id
                      ? "bg-white/10 text-white font-medium"
                      : locked
                      ? "text-white/35"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <span className="text-[13px] flex items-center gap-2">
                      {effect.name}
                      {locked && <PremiumLock size={12} />}
                    </span>
                    {borderEffect === effect.id && (
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

      <div className={`flex flex-col gap-3 mt-6 transition-opacity duration-200 ${isBorderDisabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <label className="text-[12.5px] font-medium text-white/90">
          {isSingleColorEffect ? "Color" : "Gradient"}
        </label>

        <div className="flex flex-col gap-2">
          <ColorPickerInput
            disabled={isBorderDisabled}
            value={from}
            onChange={setFrom}
          />

          {!isSingleColorEffect && (
            <ColorPickerInput
              disabled={isBorderDisabled}
              value={to}
              onChange={setTo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
