"use client";

import { useState, useRef, useEffect } from "react";
import { CLICK_EFFECTS } from "@/lib/click-effects";
import PremiumLock from "@/components/ui/premium-lock";
import { PREMIUM_CLICK_EFFECTS, isPremiumOption } from "@/lib/premium";

interface ClickEffectSectionProps {
  isPremium: boolean;
  clickEffect: string;
  setClickEffect: (val: string) => void;
}

export default function ClickEffectSection({
  isPremium,
  clickEffect,
  setClickEffect,
}: ClickEffectSectionProps) {
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
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
        <span className="text-[14px] font-normal text-white/90">Click Effect</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">
          Click Effect
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
          >
            <span>
              {CLICK_EFFECTS.find((e) => e.id === clickEffect)?.name || "Select Effect"}
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
                {CLICK_EFFECTS.map((item) => {
                  const locked = isPremiumOption(PREMIUM_CLICK_EFFECTS, item.id) && !isPremium;
                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      setClickEffect(item.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      clickEffect === item.id
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
                    {clickEffect === item.id && (
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
        <p className="text-[11px] text-white/40">Particles burst wherever visitors click on your profile.</p>
      </div>
    </div>
  );
}
