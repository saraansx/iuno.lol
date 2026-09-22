"use client";

import { useState } from "react";
import Link from "next/link";
import ColorPickerInput from "@/components/ui/color-picker";
import ResetButton from "@/components/ui/reset-button";

interface BadgeStyleCustomizationProps {
  monochromeColor: string;
  setMonochromeColor: (val: string) => void;
  monochromeEnabled: boolean;
  onReset?: () => void;
}

export default function BadgeStyleCustomization({
  monochromeColor,
  setMonochromeColor,
  monochromeEnabled,
  onReset,
}: BadgeStyleCustomizationProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const getRandomHex = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-8 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
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
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">Badge Styling</h2>
            </div>
            <p className="text-white/40 text-[13px] mt-0.5">Single color for all your profile badges</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReset && <ResetButton onClick={onReset} disabled={!monochromeEnabled} />}
            <button
              type="button"
              onClick={() => setMonochromeColor(getRandomHex())}
              disabled={!monochromeEnabled}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 shrink-0 ${
                !monochromeEnabled
                  ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#5b6cf5]/10 hover:bg-[#5b6cf5]/20 border border-[#5b6cf5]/25 hover:border-[#5b6cf5]/45 text-[#5b6cf5] hover:text-white cursor-pointer shadow-sm active:scale-95"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Randomize Colors</span>
            </button>
          </div>
        </div>

        {!monochromeEnabled ? (
          <div className="bg-[#111111] border border-white/5 rounded-xl px-4 py-3.5 flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-white/70">Monochrome is off</span>
            <span className="text-[11px] text-white/40 leading-tight">
              First turn on Monochrome in the badge settings, then pick its color here.{" "}
              <Link href="/dashboard/customize/badges" className="text-[#5b6cf5] hover:text-[#5b6cf5]/80 font-medium transition-colors">
                Go to Badge settings →
              </Link>
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
              <button
                onClick={() => setOpenSection(openSection === 'monochrome' ? null : 'monochrome')}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-white/90 flex-1">Monochrome Color</span>
                <div className="flex items-center gap-2 mr-1">
                  <span className="text-[11px] font-mono text-white/40 uppercase">{monochromeColor || "#ffffff"}</span>
                  <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: monochromeColor || "#ffffff" }} />
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'monochrome' ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openSection === 'monochrome' && (
                <div className="px-4 pb-4 pt-0.5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                    <ColorPickerInput
                      value={monochromeColor}
                      onChange={setMonochromeColor}
                    />
                    <p className="text-[11px] text-white/40 mt-1">Every badge on your profile renders in this color while Monochrome is on.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
