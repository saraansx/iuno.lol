"use client";

import { useState, useRef, useEffect } from "react";

interface SteamBackgroundSettingProps {
  value: "none" | "large" | "small";
  onChange: (val: "none" | "large" | "small") => void;
  disabled?: boolean;
}

export default function SteamBackgroundSetting({ value, onChange, disabled = false }: SteamBackgroundSettingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // The menu can still be open when the setting becomes unavailable, so derive it closed.
  const menuOpen = isOpen && !disabled;

  const options = [
    { key: "none", label: "None" },
    { key: "large", label: "Large (Profile)" },
    { key: "small", label: "Small (Mini profile)" },
  ] as const;

  const currentLabel =
    value === "none"
      ? "None"
      : value === "large"
      ? "Large (Profile)"
      : "Small (Mini profile)";

  return (
    <div
      className={`flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl transition-opacity ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Profile background
        </span>
        <p className="text-[11.5px] text-white/40">
          {disabled
            ? "Turn off Background image to use a Steam background asset."
            : "Choose which Steam background asset to use as blurred backdrop."}
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!menuOpen)}
          className={`flex items-center justify-between gap-3 min-w-[160px] px-3.5 h-10 rounded-xl bg-[#161616] border border-white/5 hover:border-white/10 text-[13px] text-white transition-colors focus:outline-none ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <span>{currentLabel}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/40 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-52 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col">
            {options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                  value === opt.key ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.key && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
