"use client";

import { useEffect, useRef, useState } from "react";
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
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  dropHighlight?: boolean;
  isDragging?: boolean;
  onRemove?: () => void;
}

export default function LinksSectionRow({
  data,
  onChange,
  dragHandleProps,
  dropHighlight,
  isDragging,
  onRemove,
}: LinksSectionRowProps) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { hidden, title, bigCount, aboveAbout } = data;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setMoveOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMoveOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div
      data-section="links"
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
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-normal text-white/90 tracking-tight">
              {title || "Links"}
            </span>
          </div>
          <p className="text-[12.5px] text-white/40 truncate">
            {`${bigCount} big ${bigCount === 1 ? "link" : "links"} — drag to reorder.`}
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

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setMoveOpen(false);
              }}
              aria-label="More options for Links section"
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
                className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[#101010] border border-white/10 rounded-xl p-1.5 shadow-xl z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(true);
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

                <button
                  type="button"
                  role="menuitem"
                  aria-expanded={moveOpen}
                  onClick={() => setMoveOpen((v) => !v)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7h12M8 12h12M8 17h12" />
                    <path d="M4 7h.01M4 12h.01M4 17h.01" />
                  </svg>
                  <span className="flex-1">Position</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${moveOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {moveOpen && (
                  <div className="mt-1 mb-1 ml-2 pl-2 border-l border-white/10 flex flex-col gap-0.5">
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={aboveAbout}
                      onClick={() => {
                        onChange({ aboveAbout: true });
                        setMenuOpen(false);
                        setMoveOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <span className="flex-1">Above About</span>
                      {aboveAbout && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={!aboveAbout}
                      onClick={() => {
                        onChange({ aboveAbout: false });
                        setMenuOpen(false);
                        setMoveOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <span className="flex-1">Below About</span>
                      {!aboveAbout && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onChange({ hidden: !hidden });
                    setMenuOpen(false);
                    setMoveOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    {hidden ? (
                      <>
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="m3 3 18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.1 4" />
                        <path d="M6.1 6.1A17.4 17.4 0 0 0 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.2-.9" />
                      </>
                    )}
                  </svg>
                  {hidden ? "Show on profile" : "Hide from profile"}
                </button>

                <div className="my-1 h-px bg-white/[0.07]" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setMoveOpen(false);
                    onRemove?.();
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
        </div>
      )}
    </div>
  );
}
