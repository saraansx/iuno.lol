"use client";

import { useState, useRef, useEffect } from "react";

interface DescriptionEffectSectionProps {
  descriptionEffect: string;
  setDescriptionEffect: (val: string) => void;
}

export default function DescriptionEffectSection({
  descriptionEffect,
  setDescriptionEffect,
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

  // Adding an effect = one entry here plus a case in DescriptionEffect.tsx —
  // the column is a free-form varchar, so no migration is needed.
  const descriptionEffects = [
    { id: "none", name: "None" },
    { id: "blur", name: "Blur" },
    { id: "float", name: "Float" },
    { id: "pulse", name: "Pulse" },
    { id: "flip", name: "Flip" },
    { id: "sparkle", name: "Sparkle" },
    { id: "shuffle", name: "Shuffle" },
    { id: "typewriter", name: "Typewriter" },
  ];

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
        <span className="text-[16px] font-semibold text-white/90">Description Effect</span>
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
                {descriptionEffects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDescriptionEffect(item.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      descriptionEffect === item.id
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-[13px]">{item.name}</span>
                    {descriptionEffect === item.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
