"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  SECTION_CATEGORIES,
  type ProfileSection,
} from "@/lib/profile-sections";
import CategorySelect from "./CategorySelect";

interface CustomSectionRowProps {
  data: ProfileSection;
  onChange: (patch: Partial<ProfileSection>) => void;
  onDelete: () => void;
  usedCategories: Record<string, string>;
}

export default function CustomSectionRow({
  data,
  onChange,
  onDelete,
  usedCategories,
}: CustomSectionRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <Reorder.Item
      as="div"
      value={data}
      dragListener={false}
      dragControls={dragControls}
      data-section={data.id}
      className="relative bg-[#0c0c0c] border border-white/5 rounded-[16px] transition-colors select-none"
      whileDrag={{ scale: 1.01, zIndex: 20, boxShadow: "0 14px 34px rgba(0,0,0,0.5)" }}
    >
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <button
          type="button"
          aria-label="Drag to reorder section"
          onPointerDown={(event) => dragControls.start(event)}
          className="-ml-1 flex h-9 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-white/30 transition-colors hover:text-white/60 active:cursor-grabbing"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="6" r="1.6" />
            <circle cx="15" cy="6" r="1.6" />
            <circle cx="9" cy="12" r="1.6" />
            <circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="18" r="1.6" />
            <circle cx="15" cy="18" r="1.6" />
          </svg>
        </button>

        <span className="text-[#5b6cf5] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="7" rx="2" />
            <rect x="3" y="15" width="18" height="5" rx="2" />
          </svg>
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[14px] font-normal text-white/90 tracking-tight truncate">
            {data.title || "Untitled section"}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.categories.length === 0 ? (
              <p className="text-[12.5px] text-amber-400/70">No categories yet</p>
            ) : (
              data.categories.map((category) => (
                <span
                  key={category}
                  className="text-[10px] uppercase tracking-wide text-white/40 bg-white/[0.04] border border-white/5 rounded-md px-1.5 py-0.5"
                >
                  {SECTION_CATEGORIES.find((item) => item.id === category)?.label ?? category}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            aria-label="Edit section"
            aria-expanded={editing}
            className="flex items-center justify-center w-8 h-8 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] rounded-xl text-white/60 hover:text-white/90 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="More options for this section"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center justify-center w-8 h-8 bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] rounded-xl text-white/60 hover:text-white/90 transition-colors cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.7" />
                <circle cx="12" cy="12" r="1.7" />
                <circle cx="12" cy="19" r="1.7" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#101010] border border-white/10 rounded-xl p-1.5 shadow-xl z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Edit section
                </button>

                <div className="my-1 h-px bg-white/[0.07]" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                  Delete section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] text-white/40">Title</label>
            <input
              value={data.title}
              onChange={(event) => onChange({ title: event.target.value.slice(0, 60) })}
              maxLength={60}
              placeholder="Section title"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] text-white/40">
              Description <span className="text-white/25">(optional)</span>
            </label>
            <input
              value={data.description}
              onChange={(event) => onChange({ description: event.target.value.slice(0, 160) })}
              maxLength={160}
              placeholder="A small line under the title"
              className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] text-white/40">Categories</span>
            <CategorySelect
              value={data.categories}
              onChange={(next) =>
                onChange({
                  categories: next,
                  bio: next.includes("bio") ? data.bio : "",
                })
              }
              usedCategories={usedCategories}
            />
          </div>

          {data.categories.includes("bio") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] text-white/40">
                Section bio <span className="text-white/25">(separate from your card bio)</span>
              </label>
              <textarea
                value={data.bio}
                onChange={(event) => onChange({ bio: event.target.value.slice(0, 500) })}
                maxLength={500}
                rows={4}
                placeholder="Write something for this section..."
                className="bg-[#161616] border border-white/5 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10 resize-none"
              />
            </div>
          )}
        </div>
      )}
    </Reorder.Item>
  );
}
