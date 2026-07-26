"use client";

import React from "react";

interface JoinDateSectionProps {
  isJoinDateEnabled: boolean;
  setIsJoinDateEnabled: (v: boolean) => void;
  joinDateFormat: string;
  setJoinDateFormat: (v: string) => void;
  isJoinDateFormatDropdownOpen: boolean;
  setIsJoinDateFormatDropdownOpen: (v: boolean) => void;
  joinDateFormatOptions: string[];
}

export default function JoinDateSection({
  isJoinDateEnabled,
  setIsJoinDateEnabled,
  joinDateFormat,
  setJoinDateFormat,
  isJoinDateFormatDropdownOpen,
  setIsJoinDateFormatDropdownOpen,
  joinDateFormatOptions,
}: JoinDateSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium text-[16px] tracking-tight">
            Join date
          </h2>
          <button
            onClick={() => setIsJoinDateEnabled(!isJoinDateEnabled)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer focus:outline-none border ${
              isJoinDateEnabled
                ? "bg-[#111326] border-[#202442] hover:bg-[#161933] text-[#5b6cf5]"
                : "bg-[#161616] border-white/5 hover:bg-white/[0.03] text-white/40"
            }`}
          >
            <div className={`w-8 h-5 rounded-full relative flex items-center transition-colors ${isJoinDateEnabled ? "bg-[#5b6cf5]" : "bg-white/10"}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute shadow-sm transition-all ${isJoinDateEnabled ? "right-[3px]" : "left-[3px]"}`}></div>
            </div>
            <span className={`text-[13px] font-medium pr-1 ${isJoinDateEnabled ? "text-[#5b6cf5]" : ""}`}>
              {isJoinDateEnabled ? "Enabled" : "Disabled"}
            </span>
          </button>
        </div>
        <p className="text-[13px] text-white/50">
          Show when you joined and pick how the date is formatted.
        </p>
      </div>

      <div className={`flex flex-col gap-3 mt-2 relative transition-opacity duration-200 ${isJoinDateEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <label className="text-[13px] font-medium text-white/90">
          Format
        </label>
        <div className="relative">
          <button
            onClick={() => setIsJoinDateFormatDropdownOpen(!isJoinDateFormatDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 h-[42px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none hover:bg-white/[0.02]"
          >
            <span className="text-[13px] text-white/90">{joinDateFormat}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
              <path d="m7 15 5 5 5-5" />
              <path d="m7 9 5-5 5 5" />
            </svg>
          </button>

          {isJoinDateFormatDropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#111111] border border-white/10 rounded-2xl p-2 z-50 shadow-xl overflow-hidden flex flex-col gap-0.5">
              {joinDateFormatOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setJoinDateFormat(option);
                    setIsJoinDateFormatDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-[12px] text-left transition-colors text-[13px] hover:bg-white/5 ${
                    joinDateFormat === option ? "bg-white/5 text-white" : "text-white/80"
                  }`}
                >
                  <span>{option}</span>
                  {joinDateFormat === option && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
