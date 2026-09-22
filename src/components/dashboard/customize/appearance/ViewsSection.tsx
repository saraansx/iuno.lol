"use client";

import { useEffect, useRef, useState } from "react";

type ViewsAnimationStyle = "none" | "countup" | "digitalroll" | "slotroll" | "speeding";

const VIEWS_ANIMATION_STYLES: Array<{ id: ViewsAnimationStyle; name: string }> = [
  { id: "none", name: "None" },
  { id: "countup", name: "Countup" },
  { id: "digitalroll", name: "Digital Roll" },
  { id: "slotroll", name: "Slot Roll" },
  { id: "speeding", name: "Speeding" },
];

interface ViewsSectionProps {
  isViewsEnabled: boolean;
  setIsViewsEnabled: (v: boolean) => void;
  isViewsAnimationEnabled: boolean;
  setIsViewsAnimationEnabled: (v: boolean) => void;
  viewsAnimationDuration: number | "";
  setViewsAnimationDuration: (v: number) => void;
  viewsAnimationStyle: ViewsAnimationStyle;
  setViewsAnimationStyle: (v: ViewsAnimationStyle) => void;
}

export default function ViewsSection({
  isViewsEnabled,
  setIsViewsEnabled,
  isViewsAnimationEnabled,
  setIsViewsAnimationEnabled,
  viewsAnimationDuration,
  setViewsAnimationDuration,
  viewsAnimationStyle,
  setViewsAnimationStyle,
}: ViewsSectionProps) {
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setStyleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedStyleName =
    VIEWS_ANIMATION_STYLES.find((s) => s.id === viewsAnimationStyle)?.name || "Countup";

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
              <circle cx="12" cy="12" r="1" fill="#5b6cf5" stroke="none"/>
            </svg>
            <h2 className="text-white font-normal text-[16px] tracking-tight">
              Views
            </h2>
          </div>
          <button
            onClick={() => setIsViewsEnabled(!isViewsEnabled)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border ${
              isViewsEnabled
                ? "bg-[#111326] border-[#202442] hover:bg-[#161933] text-[#5b6cf5]"
                : "bg-[#161616] border-white/5 hover:bg-white/[0.03] text-white/40"
            }`}
          >
            <div className={`w-8 h-5 rounded-full relative flex items-center transition-colors ${isViewsEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${isViewsEnabled ? "right-[3px]" : "left-[3px]"}`}></div>
            </div>
            <span className={`text-[13px] font-medium pr-1 ${isViewsEnabled ? "text-[#5b6cf5]" : ""}`}>
              {isViewsEnabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>
        <p className="text-[13px] text-white/50">
          Show how many times your profile has been viewed.
        </p>
      </div>

      <div className={`flex flex-col gap-3 transition-opacity duration-200 ${isViewsEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="w-full h-px bg-white/5" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-3">
            <label className="text-[13px] font-medium text-white/90">
              Counter animation
            </label>
            <p className="text-[12px] text-white/40">
              Animate the number when the profile loads.
            </p>
          </div>
          <button
            onClick={() => setIsViewsAnimationEnabled(!isViewsAnimationEnabled)}
            disabled={!isViewsEnabled}
            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none ${isViewsAnimationEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}
          >
            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${isViewsAnimationEnabled ? "right-[4px]" : "left-[4px]"}`}></div>
          </button>
        </div>

        <div className={`flex flex-col gap-3 transition-opacity duration-200 ${isViewsAnimationEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="text-[13px] font-medium text-white/90">
            Animation style
          </label>
          <div className="relative" ref={styleDropdownRef}>
            <button
              type="button"
              onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              disabled={!isViewsEnabled || !isViewsAnimationEnabled}
              className="w-full flex items-center justify-between gap-3 px-4 h-[42px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none hover:bg-white/[0.02] disabled:cursor-default"
            >
              <span className="text-[13px] text-white/90">{selectedStyleName}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-white/40 transition-transform duration-200 ${styleDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </button>

            {styleDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#111111] border border-white/10 rounded-2xl p-2 z-50 shadow-xl overflow-hidden flex flex-col gap-0.5">
                {VIEWS_ANIMATION_STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setViewsAnimationStyle(item.id);
                      setStyleDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-[12px] text-left transition-colors text-[13px] hover:bg-white/5 ${
                      viewsAnimationStyle === item.id ? "bg-white/5 text-white" : "text-white/80"
                    }`}
                  >
                    <span>{item.name}</span>
                    {viewsAnimationStyle === item.id && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="text-[13px] font-medium text-white/90">
              Animation duration
            </label>
            <span className="text-[12px] text-white/40 font-mono">
              {viewsAnimationDuration}ms
            </span>
          </div>

          <div className="relative flex items-center h-5 group w-full">
            <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-[#5b6cf5]"
                style={{ width: `${((Number(viewsAnimationDuration) || 0) / 5000) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={viewsAnimationDuration}
              onChange={(e) => setViewsAnimationDuration(Number(e.target.value))}
              disabled={!isViewsEnabled || !isViewsAnimationEnabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-default"
            />
            <div
              className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
              style={{
                left: `calc(${((Number(viewsAnimationDuration) || 0) / 5000) * 100}% - 8px)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
