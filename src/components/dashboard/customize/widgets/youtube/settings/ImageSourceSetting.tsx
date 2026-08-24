"use client";

import { useState, useRef, useEffect } from "react";

interface ImageSourceSettingProps {
  value: "channel-avatar" | "video-thumbnail";
  onChange: (val: "channel-avatar" | "video-thumbnail") => void;
}

export default function ImageSourceSetting({ value, onChange }: ImageSourceSettingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { key: "channel-avatar", label: "Channel avatar" },
    { key: "video-thumbnail", label: "Video thumbnail" },
  ] as const;

  const currentLabel = value === "channel-avatar" ? "Channel avatar" : "Video thumbnail";

  return (
    <div className="flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
      <div className="flex flex-col gap-0.5 pr-4">
        <span className="text-[13px] font-normal text-white/90 tracking-tight">
          Image source
        </span>
        <p className="text-[11.5px] text-white/40">
          Use the channel avatar or the latest video thumbnail as the main image.
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-3 min-w-[150px] px-3.5 h-10 rounded-xl bg-[#161616] border border-white/5 hover:border-white/10 text-[13px] text-white transition-colors cursor-pointer focus:outline-none"
        >
          <span>{currentLabel}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1.5 w-44 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col">
            {options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                  value === opt.key ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.key && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
