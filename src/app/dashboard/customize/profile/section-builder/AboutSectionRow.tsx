"use client";

import { useState } from "react";
import SectionVisibilityButton from "./SectionVisibilityButton";

export interface AboutSectionData {
  hidden: boolean;
  title: string;
  description: string;
}

interface AboutSectionRowProps {
  data: AboutSectionData;
  onChange: (patch: Partial<AboutSectionData>) => void;
  dragHandleProps?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  dropHighlight?: boolean;
  isDragging?: boolean;
}

export default function AboutSectionRow({ data, onChange, dragHandleProps, dropHighlight, isDragging }: AboutSectionRowProps) {
  const [open, setOpen] = useState(false);
  const { hidden, title, description } = data;

  return (
    <div
      data-section="about"
      className={`bg-[#0c0c0c] border rounded-[16px] transition-all duration-150 select-none ${hidden ? "opacity-40" : ""} ${isDragging ? "opacity-35 border-[#5b6cf5]/40 scale-[0.99]" : dropHighlight ? "border-[#5b6cf5] shadow-lg shadow-[#5b6cf5]/10" : "border-white/5"}`}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <span
          role={dragHandleProps ? "button" : undefined}
          tabIndex={dragHandleProps ? 0 : undefined}
          aria-label={dragHandleProps ? "Reorder section" : undefined}
          onPointerDown={dragHandleProps?.onPointerDown}
          onPointerMove={dragHandleProps?.onPointerMove}
          onPointerUp={dragHandleProps?.onPointerUp}
          onPointerCancel={dragHandleProps?.onPointerCancel}
          onKeyDown={dragHandleProps?.onKeyDown}
          className={dragHandleProps ? "cursor-grab active:cursor-grabbing touch-none flex shrink-0 p-2 -m-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5b6cf5]/60" : "flex shrink-0"}
        >
          <svg className="text-white/20 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.6" />
            <circle cx="15" cy="5" r="1.6" />
            <circle cx="9" cy="12" r="1.6" />
            <circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="19" r="1.6" />
            <circle cx="15" cy="19" r="1.6" />
          </svg>
        </span>

        <span className="text-[#5b6cf5] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-normal text-white/90 tracking-tight">
              {title || "About"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-white/30 bg-white/[0.04] border border-white/5 rounded-md px-1.5 py-0.5">
              Built-in section
            </span>
          </div>
          <p className="text-[12.5px] text-white/40 truncate">
            {description || "No subtitle — add a short line under the heading."}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Edit About section"
            aria-expanded={open}
            className="flex items-center justify-center w-8 h-8 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] rounded-xl text-white/60 hover:text-white/90 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <SectionVisibilityButton
            name="About"
            field="aboutSectionEnabled"
            hidden={hidden}
            onToggle={() => onChange({ hidden: !hidden })}
          />
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-title" className="text-[12.5px] text-white/40">Title</label>
            <input
              id="about-title"
              value={title}
              onChange={(e) => onChange({ title: e.target.value })}
              maxLength={60}
              placeholder="About"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="about-description" className="text-[12.5px] text-white/40">Subtitle</label>
            <textarea
              id="about-description"
              value={description}
              onChange={(e) => onChange({ description: e.target.value })}
              maxLength={200}
              rows={2}
              placeholder="A short line under the heading — the bio stays in the card"
              className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 resize-y focus:outline-none focus:border-white/10"
            />
            <span className="text-[11px] text-white/25 self-end">{description.length}/200</span>
          </div>
        </div>
      )}
    </div>
  );
}
