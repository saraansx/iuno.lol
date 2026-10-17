"use client";

import { useState } from "react";
import ColorPickerInput from "@/components/ui/color-picker";
import ResetButton from "@/components/ui/reset-button";

interface MusicStyleCustomizationProps {
  primaryColor: string;
  setPrimaryColor: (val: string) => void;
  secondaryColor: string;
  setSecondaryColor: (val: string) => void;
  lyricsColor: string;
  setLyricsColor: (val: string) => void;
  onReset?: () => void;
}

export default function MusicStyleCustomization({
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  lyricsColor,
  setLyricsColor,
  onReset,
}: MusicStyleCustomizationProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const getRandomHex = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleRandomize = () => {
    setPrimaryColor(getRandomHex());
    setSecondaryColor(getRandomHex());
    setLyricsColor(getRandomHex());
  };

  const rows = [
    {
      key: "primary",
      label: "Primary",
      hint: "Song titles in your music players.",
      value: primaryColor,
      setValue: setPrimaryColor,
      icon: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
    },
    {
      key: "secondary",
      label: "Secondary",
      hint: "Artist names in your music players.",
      value: secondaryColor,
      setValue: setSecondaryColor,
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    },
    {
      key: "lyrics",
      label: "Lyrics",
      hint: "Active synced lyric line in the lyrics player.",
      value: lyricsColor,
      setValue: setLyricsColor,
      icon: <path d="M4 6h16M4 12h16M4 18h10" />,
    },
  ];

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 flex flex-col gap-8 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
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
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">Music Styling</h2>
            </div>
            <p className="text-white/40 text-[13px] mt-0.5">Colors for song titles, artists and lyrics</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReset && <ResetButton onClick={onReset} />}
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5b6cf5]/10 hover:bg-[#5b6cf5]/20 border border-[#5b6cf5]/25 hover:border-[#5b6cf5]/45 text-[#5b6cf5] hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Randomize Colors</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.key} className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
              <button
                onClick={() => setOpenSection(openSection === row.key ? null : row.key)}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {row.icon}
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-white/90 flex-1">{row.label}</span>
                <div className="flex items-center gap-2 mr-1">
                  <span className="text-[11px] font-mono text-white/40 uppercase">{row.value || "#ffffff"}</span>
                  <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: row.value || "#ffffff" }} />
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === row.key ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openSection === row.key && (
                <div className="px-4 pb-4 pt-0.5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                    <ColorPickerInput
                      value={row.value}
                      onChange={row.setValue}
                    />
                    <p className="text-[11px] text-white/40 mt-1">{row.hint}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
