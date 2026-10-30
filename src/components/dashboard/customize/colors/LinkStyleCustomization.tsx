"use client";

import { useState } from "react";
import ColorPickerInput from "@/components/ui/color-picker";
import ResetButton from "@/components/ui/reset-button";

interface LinkStyleCustomizationProps {
  iconColor: string | null;
  setIconColor: (val: string | null) => void;
  textColor: string | null;
  setTextColor: (val: string | null) => void;
  onReset?: () => void;
}

export default function LinkStyleCustomization({ iconColor, setIconColor, textColor, setTextColor, onReset }: LinkStyleCustomizationProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const rows = [
    {
      key: "icon",
      label: "Icon",
      hint: "Icons in your big links. A link with its own icon color keeps it.",
      value: iconColor,
      setValue: setIconColor,
      icon: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
    },
    {
      key: "text",
      label: "Text",
      hint: "Titles of your big links.",
      value: textColor,
      setValue: setTextColor,
      icon: <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
    },
  ];

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 flex flex-col gap-8 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <div className="flex items-center gap-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">Link Styling</h2>
            </div>
            <p className="text-white/40 text-[13px] mt-0.5">Icon and text colors for your big links</p>
          </div>
          {onReset && <ResetButton onClick={onReset} />}
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.key} className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === row.key ? null : row.key)}
                aria-expanded={openSection === row.key}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="text-white/50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {row.icon}
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-white/90 flex-1">{row.label}</span>
                <div className="flex items-center gap-2 mr-1">
                  <span className="text-[11px] font-mono text-white/40 uppercase">{row.value ?? "Default"}</span>
                  <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: row.value ?? "#ffffff" }} />
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === row.key ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openSection === row.key && (
                <div className="px-4 pb-4 pt-0.5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                    <ColorPickerInput value={row.value ?? "#ffffff"} onChange={(v) => row.setValue(v.toLowerCase())} />
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
