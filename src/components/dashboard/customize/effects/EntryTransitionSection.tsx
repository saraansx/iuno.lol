"use client";

import { useState, useRef, useEffect } from "react";

interface EntryTransitionSectionProps {
  entryTransition: string;
  setEntryTransition: (val: string) => void;
  disabled?: boolean;
}

const ENTRY_TRANSITIONS = [
  { id: "none", name: "None" },
  { id: "fade-black", name: "Fade Blackout" },
  { id: "fade", name: "Smooth Fade" },
  { id: "curtain", name: "Curtain Split" },
  { id: "iris", name: "Iris Zoom" },
  { id: "blur-dissolve", name: "Blur Dissolve" },
];

export default function EntryTransitionSection({
  entryTransition,
  setEntryTransition,
  disabled = false,
}: EntryTransitionSectionProps) {
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
    <div
      className={`bg-[#0c0c0c] border border-white/5 rounded-[20px] flex flex-col p-6 transition-all duration-200 shadow-sm ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
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
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <span className="text-[14px] font-normal text-white/90">Entry Transition</span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">
          Entry Transition
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
          >
            <span>
              {ENTRY_TRANSITIONS.find((t) => t.id === entryTransition)?.name || "None"}
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
                {ENTRY_TRANSITIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEntryTransition(item.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      entryTransition === item.id
                        ? "bg-white/10 text-white font-medium"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-[13px]">{item.name}</span>
                    {entryTransition === item.id && (
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

        <p className="flex items-center gap-1.5 text-[11.5px] text-white/40 pt-1">
          <span className="w-1 h-1 rounded-full bg-white/40 inline-block shrink-0" />
          <span>Enable Enter Text below to activate profile entry transitions.</span>
        </p>
      </div>
    </div>
  );
}
