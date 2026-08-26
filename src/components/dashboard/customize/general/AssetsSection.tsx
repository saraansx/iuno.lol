"use client";

import Image from "next/image";
import type { Decoration } from "@/components/dashboard/DecorationPicker";

interface AssetsSectionProps {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  avatarShape: "square" | "soft" | "rounded" | "circle";
  setAvatarShape: (shape: "square" | "soft" | "rounded" | "circle") => void;
  selectedDecoration: Decoration | null;
  decorationHue: number;
  selectedEffect?: Decoration | null;
  bannerImageUrl: string;
  setBannerImageUrl: (url: string) => void;
  bannerBlend: boolean;
  setBannerBlend: (blend: boolean) => void;
  bannerBackgroundUrl: string;
  setBannerBackgroundUrl: (url: string) => void;
  setAvatarModalOpen: (open: boolean) => void;
  setDecorationPickerOpen: (open: boolean) => void;
  setEffectsPickerOpen?: (open: boolean) => void;
  setBannerImageModalOpen: (open: boolean) => void;
  setBannerBackgroundModalOpen: (open: boolean) => void;
  isVideoUrl: (url: string) => boolean;
}

export default function AssetsSection({
  avatarUrl,
  setAvatarUrl,
  avatarShape,
  setAvatarShape,
  selectedDecoration,
  decorationHue,
  selectedEffect,
  bannerImageUrl,
  setBannerImageUrl,
  bannerBlend,
  setBannerBlend,
  bannerBackgroundUrl,
  setBannerBackgroundUrl,
  setAvatarModalOpen,
  setDecorationPickerOpen,
  setEffectsPickerOpen,
  setBannerImageModalOpen,
  setBannerBackgroundModalOpen,
  isVideoUrl,
}: AssetsSectionProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="absolute">
            <rect width="18" height="18" x="3" y="3" rx="2" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="9" r="2" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <h2 className="text-white font-normal text-[16px] tracking-tight">Assets</h2>
          <p className="text-white/40 text-[13px] mt-0.5">Upload your profile visuals</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex gap-10 items-start">
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative shrink-0">
              <div className={`w-[88px] h-[88px] bg-[#161616] border border-white/10 flex items-center justify-center overflow-hidden transition-all relative ${
                avatarShape === "square" ? "rounded-lg" :
                avatarShape === "soft" ? "rounded-[14px]" :
                avatarShape === "circle" ? "rounded-full" :
                "rounded-[20px]"
              }`}>
                {avatarUrl ? (
                  isVideoUrl(avatarUrl) ? (
                    <video
                      src={avatarUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
                  )
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              {selectedDecoration && (
                <div className="pointer-events-none absolute -inset-2 z-10">
                  <Image
                    src={selectedDecoration.url}
                    alt={selectedDecoration.name}
                    fill
                    unoptimized
                    className="object-contain"
                    style={{ filter: `hue-rotate(${decorationHue}deg)` }}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2.5 w-80">
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setAvatarModalOpen(true)}
                  className="flex-1 bg-[#5b6cf5] hover:bg-[#4b5ce5] text-white text-[13px] font-normal py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(91,108,245,0.25)] border border-[#5b6cf5]/50 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Change Image
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => setAvatarUrl("")}
                    className="w-10 h-10 bg-black/40 border border-dashed border-red-400/60 text-red-400 rounded-xl hover:bg-red-400/20 hover:border-red-400 hover:text-red-300 transition-all flex items-center justify-center cursor-pointer shrink-0"
                    title="Remove avatar"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => setDecorationPickerOpen(true)}
                  className="bg-[#161616] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-white/90 py-2.5 px-3 rounded-xl transition-all flex flex-col gap-1 items-start cursor-pointer min-w-0 overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 text-white/90 w-full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7284f6] shrink-0"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    <span className="text-[12.5px] font-normal truncate">Deco</span>
                  </div>
                  <span className="text-white/35 text-[11px] font-normal truncate w-full text-left">
                    {selectedDecoration ? selectedDecoration.name : "None"}
                  </span>
                </button>
                {setEffectsPickerOpen && (
                  <button
                    onClick={() => setEffectsPickerOpen(true)}
                    className="bg-[#161616] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-white/90 py-2.5 px-3 rounded-xl transition-all flex flex-col gap-1 items-start cursor-pointer min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 text-white/90 w-full">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7284f6] shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                      <span className="text-[12.5px] font-normal truncate">Effect</span>
                    </div>
                    <span className="text-white/35 text-[11px] font-normal truncate w-full text-left">
                      {selectedEffect ? selectedEffect.name : "None"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[12.5px] font-medium text-white/90">Profile Picture Shape</label>
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setAvatarShape("square")}>
                <div className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-colors ${avatarShape === "square" ? "border-[1.5px] border-[#5b6cf5] bg-[#5b6cf5]/5 shadow-[0_0_10px_rgba(91,108,245,0.15)]" : "border-white/10 border-dashed hover:border-white/20"}`}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={avatarShape === "square" ? "#5b6cf5" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className={`text-[11px] ${avatarShape === "square" ? "text-white" : "text-white/40"}`}>Square</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setAvatarShape("soft")}>
                <div className={`w-14 h-14 rounded-[14px] border flex items-center justify-center transition-colors ${avatarShape === "soft" ? "border-[1.5px] border-[#5b6cf5] bg-[#5b6cf5]/5 shadow-[0_0_10px_rgba(91,108,245,0.15)]" : "border-white/10 border-dashed hover:border-white/20"}`}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={avatarShape === "soft" ? "#5b6cf5" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className={`text-[11px] ${avatarShape === "soft" ? "text-white" : "text-white/40"}`}>Soft</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setAvatarShape("rounded")}>
                <div className={`w-14 h-14 rounded-[18px] border flex items-center justify-center transition-colors ${avatarShape === "rounded" ? "border-[1.5px] border-[#5b6cf5] bg-[#5b6cf5]/5 shadow-[0_0_10px_rgba(91,108,245,0.15)]" : "border-white/10 border-dashed hover:border-white/20"}`}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={avatarShape === "rounded" ? "#5b6cf5" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className={`text-[11px] ${avatarShape === "rounded" ? "text-white" : "text-white/40"}`}>Rounded</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setAvatarShape("circle")}>
                <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors ${avatarShape === "circle" ? "border-[1.5px] border-[#5b6cf5] bg-[#5b6cf5]/5 shadow-[0_0_10px_rgba(91,108,245,0.15)]" : "border-white/10 border-dashed hover:border-white/20"}`}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={avatarShape === "circle" ? "#5b6cf5" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className={`text-[11px] ${avatarShape === "circle" ? "text-white" : "text-white/40"}`}>Circle</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12.5px] font-medium text-white/90">Background</label>
            <div
              onClick={() => setBannerBackgroundModalOpen(true)}
              className="relative h-32 rounded-[14px] border border-white/5 overflow-hidden cursor-pointer group"
            >
              {bannerBackgroundUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerBackgroundUrl("");
                  }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-red-400/80 text-red-400 bg-black/40 hover:bg-red-400/20 hover:border-red-400 hover:text-red-300 transition-all"
                  title="Remove background"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              )}
              {bannerBackgroundUrl ? (
                isVideoUrl(bannerBackgroundUrl) ? (
                  <>
                    <video
                      src={bannerBackgroundUrl}
                      className="absolute inset-0 w-full h-full object-cover scale-105"
                      style={{ filter: "blur(4px)" }}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                  </>
                ) : (
                  <>
                    <Image
                      src={bannerBackgroundUrl}
                      alt="Background preview"
                      fill
                      unoptimized
                      className="object-cover scale-105"
                      style={{ filter: "blur(4px)" }}
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                  </>
                )
              ) : (
                <div className="absolute inset-0 bg-[#161616]" />
              )}
              <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 group-hover:opacity-80 transition-opacity">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" className="opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span className="text-[13px] font-medium text-white/90">{bannerBackgroundUrl ? "Change" : "Upload"} Background</span>
              </div>
            </div>
            <p className="text-[11px] text-white/30 leading-[1.6]">Supports images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, MOV, max 50MB).<br/>Recommended size: 1920x1080.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-medium text-white/90">Banner</label>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-white/50">Blend</span>
                <button
                  type="button"
                  onClick={() => setBannerBlend(!bannerBlend)}
                  className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                    bannerBlend ? "bg-[#5b6cf5]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${
                      bannerBlend ? "right-[4px]" : "left-[4px]"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div
              onClick={() => setBannerImageModalOpen(true)}
              className="relative h-32 rounded-[14px] border border-white/5 overflow-hidden cursor-pointer group"
            >
              {bannerImageUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerImageUrl("");
                  }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-red-500/80 text-red-500 bg-black/40 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-all"
                  title="Remove banner"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              )}
              {bannerImageUrl ? (
                isVideoUrl(bannerImageUrl) ? (
                  <>
                    <video
                      src={bannerImageUrl}
                      className="absolute inset-0 w-full h-full object-cover scale-105"
                      style={{ filter: "blur(4px)" }}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                  </>
                ) : (
                  <>
                    <Image
                      src={bannerImageUrl}
                      alt="Banner preview"
                      fill
                      unoptimized
                      className="object-cover scale-105"
                      style={{ filter: "blur(4px)" }}
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                  </>
                )
              ) : (
                <div className="absolute inset-0 bg-[#161616]" />
              )}
              <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 group-hover:opacity-80 transition-opacity">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" className="opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span className="text-[13px] font-medium text-white/90">{bannerImageUrl ? "Change" : "Upload"} Banner</span>
              </div>
            </div>
            <p className="text-[11px] text-white/30 leading-[1.6]">Recommended size: 1920x1080.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
