"use client";

import { useState } from "react";
import Image from "next/image";

import { formatTabTitle } from "@/lib/og";

export const TAB_TITLE_MAX = 60;

interface BrowserTabSectionProps {
  username: string;
  faviconUrl: string;
  cursorUrl: string;
  tabTitle: string;
  setTabTitle: (val: string) => void;
  tabTitleAnimated: boolean;
  setTabTitleAnimated: (val: boolean) => void;
  setFaviconModalOpen: (open: boolean) => void;
  setCursorModalOpen: (open: boolean) => void;
  clearFavicon: () => void;
  clearCursor: () => void;
}

function fileNameOf(url: string): string {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    return name || url;
  } catch {
    return url;
  }
}

function AssetTile({
  label,
  hint,
  url,
  onPick,
  onClear,
}: {
  label: string;
  hint: string;
  url: string;
  onPick: () => void;
  onClear: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12.5px] font-medium text-white/90">{label}</label>

      {url ? (
        <div className="rounded-[14px] border border-white/5 p-2 flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#161616] px-3 py-2.5 transition-colors">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black">
              <Image src={url} alt="" fill unoptimized className="object-contain p-1.5" />
            </div>
            <button type="button" onClick={onPick} title={`Change ${label.toLowerCase()}`} className="flex-1 min-w-0 text-left cursor-pointer">
              <p className="text-[13px] text-white truncate">{fileNameOf(url)}</p>
              <p className="text-[11px] text-white/35 truncate">{label}</p>
            </button>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title={`${label} options`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
              </button>
              {menuOpen && (
                <>
                  <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 cursor-default" />
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-44 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onPick();
                      }}
                      className="flex items-center px-3 py-2 rounded-md text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClear();
                        setMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 rounded-md text-[13px] text-red-400 hover:bg-red-400/10 transition-all text-left cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/10 py-8 px-4 text-center cursor-pointer hover:border-white/20 transition-colors"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          <span className="text-[13px] font-medium text-white/90">Upload {label}</span>
        </button>
      )}

      <p className="text-[11px] text-white/30 leading-[1.6]">{hint}</p>
    </div>
  );
}

export default function BrowserTabSection({
  username,
  faviconUrl,
  cursorUrl,
  tabTitle,
  setTabTitle,
  tabTitleAnimated,
  setTabTitleAnimated,
  setFaviconModalOpen,
  setCursorModalOpen,
  clearFavicon,
  clearCursor,
}: BrowserTabSectionProps) {
  const previewTitle = formatTabTitle(tabTitle, username);

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 6h.01" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[14px] font-normal text-white/90 tracking-tight">Browser tab</span>
          <p className="text-[12.5px] text-white/40">How your page looks in the browser itself</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AssetTile
          label="Custom favicon"
          hint="Square PNG, 32x32 or larger. Max 1MB."
          url={faviconUrl}
          onPick={() => setFaviconModalOpen(true)}
          onClear={clearFavicon}
        />
        <AssetTile
          label="Custom cursor"
          hint="Small PNG. Scaled to 32x32. Max 1MB."
          url={cursorUrl}
          onPick={() => setCursorModalOpen(true)}
          onClear={clearCursor}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-[12.5px] font-medium text-white/90">Tab title</label>
          <span className="text-[11.5px] text-white/30 font-mono">
            {tabTitle.length} / {TAB_TITLE_MAX}
          </span>
        </div>
        <input
          type="text"
          value={tabTitle}
          maxLength={TAB_TITLE_MAX}
          onChange={(e) => setTabTitle(e.target.value)}
          placeholder={username || "Your tab title"}
          className="bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/10 transition-colors"
        />
        <p className="text-[12px] text-white/35">
          Shown as <span className="text-white/55">{previewTitle}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[12.5px] font-medium text-white/90">Typewriter animation</span>
          <p className="text-[12px] text-white/35 mt-0.5">
            Types the tab title out one letter at a time, then repeats.
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          <button
            type="button"
            onClick={() => setTabTitleAnimated(!tabTitleAnimated)}
            aria-pressed={tabTitleAnimated}
            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 cursor-pointer focus:outline-none ${
              tabTitleAnimated ? "bg-[#5b6cf5]" : "bg-white/10"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${
                tabTitleAnimated ? "right-[4px]" : "left-[4px]"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
