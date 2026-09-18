"use client";

import { useState } from "react";
import SectionVisibilityButton from "./SectionVisibilityButton";

export interface LinksSectionData {
  hidden: boolean;
  title: string;
  description: string;
  bigCount: number;
  aboveAbout: boolean;
}

interface LinksSectionRowProps {
  data: LinksSectionData;
  onChange: (patch: Partial<LinksSectionData>) => void;
  dragHandleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
  onDragOverRow?: (e: React.DragEvent) => void;
  onDropRow?: (e: React.DragEvent) => void;
  dropHighlight?: boolean;
  isDragging?: boolean;
}

export default function LinksSectionRow({
  data,
  onChange,
  dragHandleProps,
  onDragOverRow,
  onDropRow,
  dropHighlight,
  isDragging,
}: LinksSectionRowProps) {
  const [open, setOpen] = useState(false);
  const { hidden, title, description, bigCount } = data;

  return (
    <div
      onDragOver={onDragOverRow}
      onDrop={onDropRow}
      className={`bg-[#0c0c0c] border rounded-[16px] transition-all duration-150 select-none ${hidden ? "opacity-40" : ""} ${isDragging ? "opacity-35 border-[#5b6cf5]/40 scale-[0.99]" : dropHighlight ? "border-[#5b6cf5] shadow-lg shadow-[#5b6cf5]/10" : "border-white/5"}`}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <span
          draggable={!!dragHandleProps}
          onDragStart={dragHandleProps?.onDragStart}
          onDragEnd={dragHandleProps?.onDragEnd}
          className={dragHandleProps ? "cursor-grab active:cursor-grabbing flex shrink-0" : "flex shrink-0"}
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-normal text-white/90 tracking-tight">
              {title || "Links"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-white/30 bg-white/[0.04] border border-white/5 rounded-md px-1.5 py-0.5">
              Built-in section
            </span>
          </div>
          <p className="text-[12.5px] text-white/40 truncate">
            {description || `${bigCount} big ${bigCount === 1 ? "link" : "links"} — drag to reorder.`}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Edit Links section"
            aria-expanded={open}
            className="flex items-center justify-center w-8 h-8 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] rounded-xl text-white/60 hover:text-white/90 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <SectionVisibilityButton
            name="Links"
            field="linksSectionEnabled"
            hidden={hidden}
            onToggle={() => onChange({ hidden: !hidden })}
          />
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="links-title" className="text-[12.5px] text-white/40">Title</label>
            <input
              id="links-title"
              value={title}
              onChange={(e) => onChange({ title: e.target.value })}
              maxLength={60}
              placeholder="Links"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="links-description" className="text-[12.5px] text-white/40">Subtitle</label>
            <textarea
              id="links-description"
              value={description}
              onChange={(e) => onChange({ description: e.target.value })}
              maxLength={200}
              rows={2}
              placeholder="A short line under the heading"
              className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 resize-y focus:outline-none focus:border-white/10"
            />
            <span className="text-[11px] text-white/25 self-end">{description.length}/200</span>
          </div>
        </div>
      )}
    </div>
  );
}
