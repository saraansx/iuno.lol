"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  MAX_SECTION_CATEGORIES,
  SECTION_CATEGORIES,
  type SectionCategory,
} from "@/lib/profile-sections";

interface CategorySelectProps {
  value: SectionCategory[];
  onChange: (next: SectionCategory[]) => void;
  usedCategories: Record<string, string>;
}

export default function CategorySelect({ value, onChange, usedCategories }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = (category: SectionCategory) => {
    if (usedCategories[category]) return;
    if (value.includes(category)) {
      onChange(value.filter((item) => item !== category));
      return;
    }
    if (value.length >= MAX_SECTION_CATEGORIES) return;
    onChange([...value, category]);
  };

  const summary = value.length
    ? value
        .map((id) => SECTION_CATEGORIES.find((category) => category.id === id)?.label ?? id)
        .join(", ")
    : "Select categories";

  return (
    <div className="flex flex-col gap-1.5" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full flex items-center gap-2 bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-left transition-colors hover:border-white/10 focus:outline-none focus:border-white/10 cursor-pointer"
      >
        <span className={`flex-1 truncate ${value.length ? "text-white" : "text-white/25"}`}>{summary}</span>
        <span className="text-[11px] text-white/25 shrink-0">{value.length}/{MAX_SECTION_CATEGORIES}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="rounded-xl border border-white/10 bg-[#101010] p-1 flex flex-col gap-0.5"
        >
          {SECTION_CATEGORIES.map((category) => {
            const usedIn = usedCategories[category.id];
            const active = value.includes(category.id);
            const limitReached = !active && value.length >= MAX_SECTION_CATEGORIES;
            const disabled = Boolean(usedIn) || limitReached;

            return (
              <button
                key={category.id}
                type="button"
                role="option"
                aria-selected={active}
                disabled={disabled}
                onClick={() => toggle(category.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-left transition-colors ${
                  disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-white/[0.06]"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-4 h-4 rounded-[5px] border shrink-0 ${
                    active ? "bg-[#5b6cf5] border-[#5b6cf5] text-white" : "border-white/15 text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="flex-1 text-[12.5px] text-white/85">{category.label}</span>
                <span className="text-[10.5px] text-white/30 truncate max-w-[55%]">
                  {usedIn ? `Used in ${usedIn}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
