"use client";

import { useState, useRef, useEffect } from "react";
import { CLICK_SOUNDS } from "@/lib/click-effects";
import PremiumLock from "@/components/ui/premium-lock";
import { PREMIUM_CLICK_SOUNDS, isPremiumOption } from "@/lib/premium";

interface ClickSoundSectionProps {
  isPremium: boolean;
  clickSound: string;
  setClickSound: (val: string) => void;
}

export default function ClickSoundSection({
  isPremium,
  clickSound,
  setClickSound,
}: ClickSoundSectionProps) {
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
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        </svg>
        <span className="text-[14px] font-normal text-white/90">Click Sound</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">
          Click Sound
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
          >
            <span>
              {CLICK_SOUNDS.find((s) => s.id === clickSound)?.name || "Select Sound"}
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
                {CLICK_SOUNDS.map((item) => {
                  const locked = isPremiumOption(PREMIUM_CLICK_SOUNDS, item.id) && !isPremium;
                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (locked) return;
                      setClickSound(item.id);
                      if (item.url) {
                        try {
                          const preview = new Audio(item.url);
                          preview.volume = 0.7;
                          preview.play().catch(() => {});
                        } catch {
                        }
                      }
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      clickSound === item.id
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
                    {clickSound === item.id && (
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
        <p className="text-[11px] text-white/40">Built-in sound played on every click. Preview on select.</p>
      </div>
    </div>
  );
}
