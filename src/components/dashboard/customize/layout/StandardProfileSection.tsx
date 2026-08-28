"use client";

import { useEffect, useRef, useState } from "react";

/** Which arrangement the standard card uses. Mirrors PROFILE_PRESETS in the action. */
export type ProfilePreset = "split" | "floating" | "modern" | "classic";

interface PresetOption {
  id: ProfilePreset;
  name: string;
  description: string;
}

export const PRESETS: PresetOption[] = [
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
}

/** Matches the clamp in updateLayoutProfile. */
export const CONTENT_WIDTH_MIN = 480;
export const CONTENT_WIDTH_MAX = 1000;

/**
 * Label with a hint icon, matching the row style used across the layout settings.
 * `disabled` dims it for the rows that are not wired up yet.
 */
function RowLabel({ text, hint, disabled }: { text: string; hint: string; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 w-[130px] shrink-0">
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

/**
 * Presets for the standard (single-card) profile.
 *
 * Kept in its own component so the structure picker stays a plain chooser and a
 * future sectioned equivalent never has to be untangled from shared code. The
 * Layout page renders this only while `profileStructure` is `standard`.
 */
export default function StandardProfileSection({
  preset,
  setPreset,
  wrapInCard,
  setWrapInCard,
  contentWidth,
  setContentWidth,
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

  // Held locally while dragging, so each pixel of movement re-renders this row
  // rather than pushing a new width into the shared overrides and relaying out the
  // whole preview card. `null` means "not dragging" — the committed value is used.
  const [draftWidth, setDraftWidth] = useState<number | null>(null);
  const draftRef = useRef<number | null>(null);

  // Commit on a window-level pointerup rather than the input's own: a drag very
  // often ends with the cursor outside the 20px-tall track, and the input's
  // onPointerUp never fires in that case, which left the value stuck at its old
  // number and read as the slider refusing to move.
  useEffect(() => {
    const commit = () => {
      if (draftRef.current === null) return;
      setContentWidth(draftRef.current);
      draftRef.current = null;
      setDraftWidth(null);
    };
    window.addEventListener("pointerup", commit);
    window.addEventListener("pointercancel", commit);
    return () => {
      window.removeEventListener("pointerup", commit);
      window.removeEventListener("pointercancel", commit);
    };
  }, [setContentWidth]);

  // The slider is driven by the clamped value so the thumb can never sit off the
  // track, while `contentWidth` itself stays untouched for the warning below.
  const clampedWidth = Math.min(CONTENT_WIDTH_MAX, Math.max(CONTENT_WIDTH_MIN, contentWidth));
  const displayWidth = draftWidth ?? clampedWidth;
  const fillPercent =
    ((displayWidth - CONTENT_WIDTH_MIN) / (CONTENT_WIDTH_MAX - CONTENT_WIDTH_MIN)) * 100;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm">
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
            <span>{selected?.name ?? "Classic"}</span>
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
                const isSelected = option.id === preset;
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
                    {/* Fixed-width check column so every row's text starts on the
                        same edge whether or not it is the selected one. */}
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
        {/* Alignment is presentational for now: it is shown so the shape of the
            settings is visible, but it is not wired to a column yet. Content width
            and Wrap in card below both change the profile. */}
        <div className="flex items-center gap-4 opacity-40 pointer-events-none select-none">
          <RowLabel text="Alignment" hint="Not available yet." disabled />
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 h-[38px] rounded-xl bg-[#111111] border border-white/5">
              <span className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-4 rounded-full bg-white/30" />
                <span className="block h-[2px] w-2.5 rounded-full bg-white/30" />
              </span>
              <span className="text-[13px] text-white/70">Left</span>
            </div>
            <div className="flex items-center justify-center gap-2 h-[38px] rounded-xl bg-[#111111] border border-white/5">
              <span className="flex flex-col items-center gap-[3px]">
                <span className="block h-[2px] w-4 rounded-full bg-white/30" />
                <span className="block h-[2px] w-2.5 rounded-full bg-white/30" />
              </span>
              <span className="text-[13px] text-white/70">Center</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-4">
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
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    draftRef.current = next;
                    setDraftWidth(next);
                  }}
                  // Keyboard changes never see a pointerup, so they commit here.
                  onKeyUp={() => {
                    if (draftRef.current === null) return;
                    setContentWidth(draftRef.current);
                    draftRef.current = null;
                    setDraftWidth(null);
                  }}
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
          {/* The range input cannot go below the floor, so this only appears for a
              stored value that predates the limit — it explains the snap rather
              than letting the number silently change. */}
          {contentWidth < CONTENT_WIDTH_MIN && (
            <span className="text-[11.5px] text-[#e2894b] pl-[146px]">
              Minimum is {CONTENT_WIDTH_MIN} px
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
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
      </div>
    </div>
  );
}
