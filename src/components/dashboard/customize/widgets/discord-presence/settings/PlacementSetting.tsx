"use client";

import { useState, useRef, useEffect } from "react";

interface PlacementSettingProps {
  value: "inside" | "outside";
  onChange: (val: "inside" | "outside") => void;
}

export default function PlacementSetting({ value, onChange }: PlacementSettingProps) {
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

  return (
    <div className="flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Card Placement
        </span>
        <p className="text-[11.5px] text-white/40">
          Show inside the main profile card or outside as floating widgets.
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 min-w-[140px] px-3.5 h-10 rounded-xl bg-[#161616] border border-white/5 hover:border-white/10 text-[13px] text-white transition-colors cursor-pointer focus:outline-none"
        >
          <span className="capitalize">{value === "inside" ? "Inside Card" : "Outside Card"}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/40 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-40 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col">
            {(["inside", "outside"] as const).map((placement) => (
              <button
                key={placement}
                type="button"
                onClick={() => {
                  onChange(placement);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer capitalize ${
                  value === placement
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{placement === "inside" ? "Inside Card" : "Outside Card"}</span>
                {value === placement && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
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
