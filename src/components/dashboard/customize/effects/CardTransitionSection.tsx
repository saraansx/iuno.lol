"use client";

import { useState, useRef, useEffect } from "react";
interface CardTransitionSectionProps {
  cardEffect?: string;
  setCardEffect?: (val: string) => void;
  cardTransition?: string;
  setCardTransition?: (val: string) => void;
}

const CARD_EFFECTS = [
  { id: "none", name: "None" },
  { id: "skew", name: "Skew" },
  { id: "magnet", name: "Magnet" },
  { id: "zoom", name: "Zoom" },
  { id: "elastic", name: "Elastic" },
  { id: "dive", name: "Dive" },
];

const CARD_TRANSITIONS = [
  { id: "none", name: "None" },
  { id: "fade", name: "Fade" },
  { id: "slide-up", name: "Slide Up" },
  { id: "slide-down", name: "Slide Down" },
  { id: "zoom-in", name: "Zoom In" },
  { id: "flip", name: "Flip" },
  { id: "bounce", name: "Bounce" },
  { id: "blur", name: "Blur" },
];

export default function CardTransitionSection({
  cardEffect = "none",
  setCardEffect,
  cardTransition = "none",
  setCardTransition,
}: CardTransitionSectionProps) {
  const [effectDropdownOpen, setEffectDropdownOpen] = useState(false);
  const [transitionDropdownOpen, setTransitionDropdownOpen] = useState(false);
  const effectRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (effectRef.current && !effectRef.current.contains(event.target as Node)) {
        setEffectDropdownOpen(false);
      }
      if (transitionRef.current && !transitionRef.current.contains(event.target as Node)) {
        setTransitionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cardEffects = CARD_EFFECTS;
  const cardTransitions = CARD_TRANSITIONS;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] flex flex-col p-6 transition-all duration-200 shadow-sm col-span-1 md:col-span-2">
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
          <path d="M9 3v18" />
        </svg>
        <span className="text-[14px] font-normal text-white/90">Card Effect & Card Transition</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Effect */}
        <div className="flex flex-col gap-3">
          <label className="text-[12.5px] font-medium text-white/90">
            Card Effect
          </label>

          <div className="relative" ref={effectRef}>
            <button
              type="button"
              onClick={() => setEffectDropdownOpen(!effectDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
            >
              <span>
                {cardEffects.find((e) => e.id === cardEffect)?.name || "Select Effect"}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 opacity-60 ${effectDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {effectDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1.5 bg-[#161616] border border-white/10 rounded-xl p-1.5 z-30 shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-0.5">
                  {cardEffects.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCardEffect?.(item.id);
                        setEffectDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                        cardEffect === item.id
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-[13px]">{item.name}</span>
                      {cardEffect === item.id && (
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

        {/* Card Transition */}
        <div className="flex flex-col gap-3">
          <label className="text-[12.5px] font-medium text-white/90">
            Card Transition
          </label>

          <div className="relative" ref={transitionRef}>
            <button
              type="button"
              onClick={() => setTransitionDropdownOpen(!transitionDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
            >
              <span>
                {cardTransitions.find((t) => t.id === cardTransition)?.name || "Select Transition"}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 opacity-60 ${transitionDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {transitionDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1.5 bg-[#161616] border border-white/10 rounded-xl p-1.5 z-30 shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-0.5">
                  {cardTransitions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCardTransition?.(item.id);
                        setTransitionDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                        cardTransition === item.id
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-[13px]">{item.name}</span>
                      {cardTransition === item.id && (
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
    </div>
  );
}

