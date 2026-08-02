"use client";

import React, { useState } from "react";

interface ColorCustomizationProps {
  usernameColor: string;
  setUsernameColor: (val: string) => void;
  bioColor: string;
  setBioColor: (val: string) => void;
  otherColor: string;
  setOtherColor: (val: string) => void;
  highlightColor: string;
  setHighlightColor: (val: string) => void;
  pageBgColor: string;
  setPageBgColor: (val: string) => void;
}

export default function ColorCustomization({
  usernameColor,
  setUsernameColor,
  bioColor,
  setBioColor,
  otherColor,
  setOtherColor,
  highlightColor,
  setHighlightColor,
  pageBgColor,
  setPageBgColor,
}: ColorCustomizationProps) {
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
    setUsernameColor(getRandomHex());
    setBioColor(getRandomHex());
    setOtherColor(getRandomHex());
    setHighlightColor(getRandomHex());
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
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                <circle cx="12" cy="12" r="2" fill="#5b6cf5" stroke="none" opacity="0.3"/>
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">Profile Color</h2>
            </div>
            <p className="text-white/40 text-[13px] mt-0.5">Customize the colors for your profile text</p>
          </div>

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

        <div className="flex flex-col gap-2">
          {/* Username Color */}
          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'username' ? null : 'username')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Username Color</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{usernameColor || "#ffffff"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: usernameColor || "#ffffff" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'username' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'username' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                    <span className="text-[13px] text-white/30 mr-2">#</span>
                    <input
                      type="text"
                      value={usernameColor.replace('#', '')}
                      onChange={(e) => {
                        setUsernameColor('#' + e.target.value);
                      }}
                      className="w-full bg-transparent text-[13px] text-white focus:outline-none"
                    />
                    <div className="relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={usernameColor}
                        onChange={(e) => {
                          setUsernameColor(e.target.value);
                        }}
                        className="absolute -inset-4 w-12 h-12 cursor-pointer opacity-0 outline-none focus:outline-none focus:ring-0"
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: usernameColor }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description Color */}
          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'bio' ? null : 'bio')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Description Color</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{bioColor || "#ffffff"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: bioColor || "#ffffff" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'bio' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'bio' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                    <span className="text-[13px] text-white/30 mr-2">#</span>
                    <input
                      type="text"
                      value={bioColor.replace('#', '')}
                      onChange={(e) => {
                        setBioColor('#' + e.target.value);
                      }}
                      className="w-full bg-transparent text-[13px] text-white focus:outline-none"
                    />
                    <div className="relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={bioColor}
                        onChange={(e) => {
                          setBioColor(e.target.value);
                        }}
                        className="absolute -inset-4 w-12 h-12 cursor-pointer opacity-0 outline-none focus:outline-none focus:ring-0"
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: bioColor }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Color */}
          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'other' ? null : 'other')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Other Color</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{otherColor || "#ffffff"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: otherColor || "#ffffff" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'other' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'other' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                    <span className="text-[13px] text-white/30 mr-2">#</span>
                    <input
                      type="text"
                      value={otherColor.replace('#', '')}
                      onChange={(e) => {
                        setOtherColor('#' + e.target.value);
                      }}
                      className="w-full bg-transparent text-[13px] text-white focus:outline-none"
                    />
                    <div className="relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={otherColor}
                        onChange={(e) => {
                          setOtherColor(e.target.value);
                        }}
                        className="absolute -inset-4 w-12 h-12 cursor-pointer opacity-0 outline-none focus:outline-none focus:ring-0"
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: otherColor }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'highlight' ? null : 'highlight')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <div className="w-4 h-4 rounded-[4px] border-2 border-current" />
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Highlight color</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{highlightColor || "#ffffff"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: highlightColor || "#ffffff" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'highlight' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'highlight' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                    <span className="text-[13px] text-white/30 mr-2">#</span>
                    <input
                      type="text"
                      value={highlightColor.replace('#', '')}
                      onChange={(e) => {
                        setHighlightColor('#' + e.target.value);
                      }}
                      className="w-full bg-transparent text-[13px] text-white focus:outline-none"
                    />
                    <div className="relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => {
                          setHighlightColor(e.target.value);
                        }}
                        className="absolute -inset-4 w-12 h-12 cursor-pointer opacity-0 outline-none focus:outline-none focus:ring-0"
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: highlightColor }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Page Background Color */}
          <div className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
            <button
              onClick={() => setOpenSection(openSection === 'pagebg' ? null : 'pagebg')}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
            >
              <div className="text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-white/90 flex-1">Page Background Color</span>
              <div className="flex items-center gap-2 mr-1">
                <span className="text-[11px] font-mono text-white/40 uppercase">{pageBgColor || "#000000"}</span>
                <div className="w-4 h-4 rounded-md border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: pageBgColor || "#000000" }} />
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${openSection === 'pagebg' ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {openSection === 'pagebg' && (
              <div className="px-4 pb-4 pt-0.5">
                <div className="flex flex-col gap-2">
                  <label className="text-[12.5px] font-medium text-white/90">Color Hex</label>
                  <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                    <span className="text-[13px] text-white/30 mr-2">#</span>
                    <input
                      type="text"
                      value={pageBgColor.replace('#', '')}
                      onChange={(e) => {
                        setPageBgColor('#' + e.target.value);
                      }}
                      className="w-full bg-transparent text-[13px] text-white focus:outline-none"
                    />
                    <div className="relative w-5 h-5 rounded-md ml-2 border border-white/10 overflow-hidden shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={pageBgColor}
                        onChange={(e) => {
                          setPageBgColor(e.target.value);
                        }}
                        className="absolute -inset-4 w-12 h-12 cursor-pointer opacity-0 outline-none focus:outline-none focus:ring-0"
                      />
                      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: pageBgColor }} />
                    </div>
                  </div>
                  <p className="text-[11px] text-white/40 mt-1">This applies behind the profile card if no background image is set.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
