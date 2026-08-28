"use client";

import { useEffect, useRef, useState } from "react";
import { type AvatarPlacement } from "@/components/profile/layouts/ProfilePresetLayout";

/**
 * Header placement settings for the standard profile.
 *
 * Avatar is wired up; Badges is still presentational, shown so the shape of the
 * setting is visible but rendered inert until it has a column behind it.
 */

const AVATAR_OPTIONS: { id: AvatarPlacement; name: string; description: string }[] = [
  { id: "top", name: "Top", description: "Avatar displayed above the name." },
  { id: "left", name: "Left", description: "Avatar displayed to the left of the name." },
  { id: "right", name: "Right", description: "Avatar displayed to the right of the name." },
  { id: "floating", name: "Floating", description: "Avatar overlaps the box as a floating element." },
];

/** The value the Badges dropdown currently displays. */
const BADGES_PLACEMENT = "Header footer";

/** Label with a hint icon, matching the layout rows in StandardProfileSection. */
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

/** A dropdown trigger rendered without a menu, since nothing is selectable yet. */
function InertDropdown({ value }: { value: string }) {
  return (
    <div className="flex-1 flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5">
      <span className="text-[13.5px] text-white/70">{value}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/40"
      >
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5 5" />
      </svg>
    </div>
  );
}

interface HeaderSectionProps {
  avatarPlacement: AvatarPlacement;
  setAvatarPlacement: (val: AvatarPlacement) => void;
}

export default function HeaderSection({
  avatarPlacement,
  setAvatarPlacement,
}: HeaderSectionProps) {
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

  const selected = AVATAR_OPTIONS.find((o) => o.id === avatarPlacement);

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
            <circle cx="7.5" cy="6" r="1.25" fill="#5b6cf5" stroke="none" />
          </svg>
          <h2 className="text-white font-normal text-[16px] tracking-tight">
            Header
          </h2>
        </div>
        <p className="text-[13px] text-white/40">
          Choose where your avatar and badges appear in the header.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <RowLabel text="Avatar" hint="Where the avatar sits relative to your name." />
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer focus:outline-none"
            >
              <span>{selected?.name ?? "Floating"}</span>
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
                {AVATAR_OPTIONS.map((option) => {
                  const isSelected = option.id === avatarPlacement;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setAvatarPlacement(option.id);
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

        {/* Badges has no column yet, so it stays inert rather than looking editable. */}
        <div className="flex items-center gap-4 opacity-40 pointer-events-none select-none">
          <RowLabel text="Badges" hint="Not available yet." disabled />
          <InertDropdown value={BADGES_PLACEMENT} />
        </div>
      </div>
    </div>
  );
}
