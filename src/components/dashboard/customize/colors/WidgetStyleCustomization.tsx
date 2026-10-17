"use client";

import { useState } from "react";
import ColorPickerInput from "@/components/ui/color-picker";
import ResetButton from "@/components/ui/reset-button";

interface WidgetStyleCustomizationProps {
  primaryTextColor: string;
  setPrimaryTextColor: (val: string) => void;
  secondaryTextColor: string;
  setSecondaryTextColor: (val: string) => void;
  onReset?: () => void;
}

export default function WidgetStyleCustomization({
  primaryTextColor,
  setPrimaryTextColor,
  secondaryTextColor,
  setSecondaryTextColor,
  onReset,
}: WidgetStyleCustomizationProps) {
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
    setPrimaryTextColor(getRandomHex());
    setSecondaryTextColor(getRandomHex());
  };

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
                <rect x="3" y="4" width="18" height="7" rx="2" />
                <rect x="3" y="14" width="18" height="6" rx="2" />
                <circle cx="7" cy="7.5" r="1.2" fill="#5b6cf5" stroke="none" opacity="0.5" />
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">Widget Styling</h2>
            </div>
            <p className="text-white/40 text-[13px] mt-0.5">Customize the colors for your widget cards</p>
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
          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'primary' ? null : 'primary')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Primary Text</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{primaryTextColor || "#ffffff"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: primaryTextColor || "#ffffff" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'primary' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'primary' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <ColorPickerInput
                    value={primaryTextColor}
                    onChange={setPrimaryTextColor}
                  />
                  <p className="text-[11px] text-white/40 mt-1">The main title on each widget card, such as a username or channel name.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'secondary' ? null : 'secondary')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Secondary Text</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{secondaryTextColor || "#ffffff"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: secondaryTextColor || "#ffffff" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'secondary' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'secondary' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <ColorPickerInput
                    value={secondaryTextColor}
                    onChange={setSecondaryTextColor}
                  />
                  <p className="text-[11px] text-white/40 mt-1">Stats, labels and icons — the supporting line under each title.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
