"use client";

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
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12.5px] font-medium text-white/90">{label}</label>

      <div
        onClick={onPick}
        className="relative h-32 rounded-[14px] border border-white/5 overflow-hidden cursor-pointer group"
      >
        {url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-red-500/80 text-red-500 bg-black/40 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-all"
            title={`Remove ${label.toLowerCase()}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        )}

        {url ? (
          <Image src={url} alt="" fill unoptimized className="object-contain p-8" />
        ) : (
          <div className="absolute inset-0 bg-[#161616]" />
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 group-hover:opacity-80 transition-opacity">
          {!url && (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" className="opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span className="text-[13px] font-medium text-white/90">Upload {label}</span>
            </>
          )}
        </div>
      </div>

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
