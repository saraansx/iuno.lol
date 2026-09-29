"use client";

import Image from "next/image";
import PremiumLock from "@/components/ui/premium-lock";

import { formatTabTitle } from "@/lib/og";

const TAB_TITLE_MAX = 60;

interface BrowserTabSectionProps {
  isPremium: boolean;
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
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12.5px] font-medium text-white/90">{label}</label>

      {url ? (
        <div
          onClick={onPick}
          className="relative rounded-[14px] border border-white/5 overflow-hidden cursor-pointer group bg-[#161616]"
        >
          <div className="h-24 flex items-center justify-center">
            <Image src={url} alt="" width={64} height={64} unoptimized className="w-16 h-16 object-contain" />
          </div>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[13px] font-medium text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Change {label.toLowerCase()}</span>
          </div>
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
            <span className="h-7 px-2 flex items-center rounded-md bg-black/60 text-[10px] font-medium text-white/80 tracking-wide">
              {(() => {
                try {
                  const n = fileNameOf(url);
                  const i = n.lastIndexOf(".");
                  return (i >= 0 ? n.slice(i + 1) : "IMG").toUpperCase().slice(0, 4);
                } catch {
                  return "IMG";
                }
              })()}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              title={`Remove ${label.toLowerCase()}`}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-black/60 text-red-400 hover:text-red-300 hover:bg-black/80 transition-all cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
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
  isPremium,
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
  const locked = !isPremium;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 6h.01" />
        </svg>
        <div className="flex flex-col">
          <span className="text-[14px] font-normal text-white/90 tracking-tight flex items-center gap-2">
            Browser tab
            {locked && <PremiumLock size={15} />}
          </span>
          <p className="text-[12.5px] text-white/40">How your page looks in the browser itself</p>
        </div>
      </div>

      <div className={`flex flex-col gap-5 transition-opacity duration-200 ${locked ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
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
    </div>
  );
}
