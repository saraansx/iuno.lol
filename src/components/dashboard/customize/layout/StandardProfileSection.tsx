"use client";

import { useEffect, useRef, useState } from "react";
import { type ContentAlignment } from "@/components/profile/layouts/ProfilePresetLayout";

export type ProfilePreset = "split" | "floating" | "modern" | "classic";

interface PresetOption {
  id: ProfilePreset;
  name: string;
  description: string;
}

const PRESETS: PresetOption[] = [
  {
    id: "split",
    name: "Split",
    description: "Avatar on the side with profile details.",
  },
  {
    id: "floating",
    name: "Floating",
    description: "Centered profile with a floating avatar.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Left-aligned layout with details at the bottom.",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Simple and balanced profile.",
  },
];

interface StandardProfileSectionProps {
  preset: ProfilePreset;
  setPreset: (val: ProfilePreset) => void;
  wrapInCard: boolean;
  setWrapInCard: (val: boolean) => void;
  contentWidth: number;
  setContentWidth: (val: number) => void;
  profileOpacity: number;
  setProfileOpacity: (val: number) => void;
  isCustom?: boolean;
  alignment: ContentAlignment;
  setAlignment: (val: ContentAlignment) => void;
}

const CONTENT_WIDTH_MIN = 480;
const CONTENT_WIDTH_MAX = 1000;

const CARD_OPACITY_MIN = 10;
const CARD_OPACITY_MAX = 100;

function RowLabel({ text, hint, disabled }: { text: string; hint: string; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 w-full sm:w-[130px] shrink-0">
      <span className={`text-[12.5px] font-medium ${disabled ? "text-white/35" : "text-white/90"}`}>
        {text}
      </span>
      <span className="text-white/25" title={hint}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </span>
    </div>
  );
}

export default function StandardProfileSection({
  preset,
  setPreset,
  wrapInCard,
  setWrapInCard,
  contentWidth,
  setContentWidth,
  profileOpacity,
  setProfileOpacity,
  isCustom = false,
  alignment,
  setAlignment,
}: StandardProfileSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = PRESETS.find((p) => p.id === preset);

const displayWidth = Math.min(CONTENT_WIDTH_MAX, Math.max(CONTENT_WIDTH_MIN, contentWidth));
  const fillPercent =
    ((displayWidth - CONTENT_WIDTH_MIN) / (CONTENT_WIDTH_MAX - CONTENT_WIDTH_MIN)) * 100;

  const displayOpacity = Math.min(CARD_OPACITY_MAX, Math.max(CARD_OPACITY_MIN, profileOpacity));
  const opacityFillPercent =
    ((displayOpacity - CARD_OPACITY_MIN) / (CARD_OPACITY_MAX - CARD_OPACITY_MIN)) * 100;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <h2 className="text-white font-normal text-[16px] tracking-tight">
            Presets
          </h2>
        </div>
        <p className="text-[13px] text-white/40">
          How the avatar and your profile details are arranged on the card.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[12.5px] font-medium text-white/90">Preset</label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer focus:outline-none"
          >
            <span className={isCustom ? "text-white/50" : ""}>
              {isCustom ? "Custom" : selected?.name ?? "Modern"}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 opacity-60 ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[280px] overflow-y-auto custom-scrollbar">
              {PRESETS.map((option) => {
                const isSelected = !isCustom && option.id === preset;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setPreset(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 text-left px-3.5 py-2.5 transition-colors cursor-pointer ${
                      isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="w-3.5 shrink-0 pt-[3px] text-[#5b6cf5]">
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className={`text-[13px] font-medium ${isSelected ? "text-white" : "text-white/80"}`}>
                        {option.name}
                      </span>
                      <span className="text-[11.5px] text-white/35 leading-snug">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-white/5" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <RowLabel
            text="Alignment"
            hint="Whether the card's content is aligned left, centred or right."
          />
          <div className="flex-1 grid grid-cols-3 gap-3">
            {(["left", "center", "right"] as const).map((option) => {
              const isSelected = alignment === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAlignment(option)}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-center gap-2 h-[38px] rounded-xl border transition-colors cursor-pointer focus:outline-none ${
                    isSelected
                      ? "bg-[#111326] border-[#5b6cf5]/40"
                      : "bg-[#111111] border-white/5 hover:border-white/15"
                  }`}
                >
                  <span className={`flex flex-col gap-[3px] ${option === "center" ? "items-center" : option === "right" ? "items-end" : ""}`}>
                    <span className={`block h-[2px] w-4 rounded-full ${isSelected ? "bg-[#5b6cf5]" : "bg-white/30"}`} />
                    <span className={`block h-[2px] w-2.5 rounded-full ${isSelected ? "bg-[#5b6cf5]" : "bg-white/30"}`} />
                  </span>
                  <span className={`text-[13px] ${isSelected ? "text-[#5b6cf5] font-medium" : "text-white/70"}`}>
                    {option === "left" ? "Left" : option === "right" ? "Right" : "Center"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
            <RowLabel
              text="Content width"
              hint={`How wide the card is, between ${CONTENT_WIDTH_MIN} and ${CONTENT_WIDTH_MAX}px.`}
            />
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex items-center h-5 group w-full min-w-0">
                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="absolute h-full bg-[#5b6cf5]" style={{ width: `${fillPercent}%` }} />
                </div>
                <input
                  type="range"
                  min={CONTENT_WIDTH_MIN}
                  max={CONTENT_WIDTH_MAX}
                  step={4}
                  value={displayWidth}
                  onChange={(e) => setContentWidth(Number(e.target.value))}
                  aria-label="Content width"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div
                  className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
                  style={{ left: `calc(${fillPercent}% - 8px)` }}
                />
              </div>
              <span className="text-[12px] text-white/40 font-mono shrink-0 w-[62px] text-right">
                {displayWidth} px
              </span>
            </div>
          </div>
          {contentWidth < CONTENT_WIDTH_MIN && (
            <span className="text-[11.5px] text-[#e2894b] pl-0 sm:pl-[146px]">
              Minimum is {CONTENT_WIDTH_MIN} px
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <RowLabel
            text="Wrap in card"
            hint="Off removes the card background, border and shadow, leaving the content on the page."
          />
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              onClick={() => setWrapInCard(!wrapInCard)}
              aria-pressed={wrapInCard}
              className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 cursor-pointer focus:outline-none ${
                wrapInCard ? "bg-[#5b6cf5]" : "bg-white/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${
                  wrapInCard ? "right-[4px]" : "left-[4px]"
                }`}
              />
            </button>
          </div>
        </div>


        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <RowLabel
            text="Card opacity"
            hint={`How solid the card is, between ${CARD_OPACITY_MIN}% and ${CARD_OPACITY_MAX}%.`}
            disabled={!wrapInCard}
          />
          <div
            className={`flex-1 flex items-center gap-4 transition-opacity ${
              wrapInCard ? "" : "opacity-40"
            }`}
          >
            <div className="relative flex items-center h-5 group w-full min-w-0">
              <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={wrapInCard ? "absolute h-full bg-[#5b6cf5]" : "absolute h-full bg-white/20"}
                  style={{ width: `${opacityFillPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={CARD_OPACITY_MIN}
                max={CARD_OPACITY_MAX}
                step={1}
                value={displayOpacity}
                disabled={!wrapInCard}
                onChange={(e) => setProfileOpacity(Number(e.target.value))}
                aria-label="Card opacity"
                className={`absolute inset-0 w-full h-full opacity-0 z-20 ${
                  wrapInCard ? "cursor-pointer" : "cursor-not-allowed"
                }`}
              />
              <div
                className={`absolute w-4 h-4 bg-[#050505] border-[2px] rounded-full pointer-events-none transition-transform shadow-lg ${
                  wrapInCard ? "border-[#5b6cf5] group-active:scale-110" : "border-white/20"
                }`}
                style={{ left: `calc(${opacityFillPercent}% - 8px)` }}
              />
            </div>
            <span className="text-[12px] text-white/40 font-mono shrink-0 w-[62px] text-right">
              {displayOpacity} %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
