"use client";

import Image from "next/image";
import { useState, useRef, useEffect, type DragEvent } from "react";
import PremiumLogo from "@/components/ui/premium-logo";
import { toast } from "@/components/ui/toast";
import type { Decoration } from "@/components/dashboard/DecorationPicker";
import { ANIMATED_BACKGROUNDS, animatedBackgroundId, animatedBackgroundUrl } from "@/lib/animated-background";
import AnimatedBackground from "@/components/profile/layouts/AnimatedBackground";
import ColorPickerInput from "@/components/ui/color-picker";

interface AssetsSectionProps {
  isPremium: boolean;
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
  bannerBackgroundShuffle: boolean;
  setBannerBackgroundShuffle: (val: boolean) => void;
  bannerBackgroundAutoplay: boolean;
  setBannerBackgroundAutoplay: (val: boolean) => void;
  bgUrls: string[];
  setBgUrls: (urls: string[]) => void;
  bgSelected: number;
  setBgSelected: (index: number) => void;
  onAddBackground: (index?: number) => void;
  bannerBackgroundSound: boolean;
  setBannerBackgroundSound: (sound: boolean) => void;
  auroraColor1: string;
  setAuroraColor1: (val: string) => void;
  auroraColor2: string;
  setAuroraColor2: (val: string) => void;
  auroraColor3: string;
  setAuroraColor3: (val: string) => void;
  auroraSpeed: number;
  setAuroraSpeed: (val: number) => void;
  auroraBlend: number;
  setAuroraBlend: (val: number) => void;
  darkveilSpeed: number;
  setDarkveilSpeed: (val: number) => void;
  darkveilHueShift: number;
  setDarkveilHueShift: (val: number) => void;
  darkveilNoise: number;
  setDarkveilNoise: (val: number) => void;
  darkveilScanFreq: number;
  setDarkveilScanFreq: (val: number) => void;
  darkveilScan: number;
  setDarkveilScan: (val: number) => void;
  darkveilWarp: number;
  setDarkveilWarp: (val: number) => void;
  pixelblastColor: string;
  setPixelblastColor: (val: string) => void;
  pixelblastVariant: string;
  setPixelblastVariant: (val: string) => void;
  pixelblastPixelSize: number;
  setPixelblastPixelSize: (val: number) => void;
  pixelblastPatternScale: number;
  setPixelblastPatternScale: (val: number) => void;
  pixelblastPatternDensity: number;
  setPixelblastPatternDensity: (val: number) => void;
  pixelblastPixelJitter: number;
  setPixelblastPixelJitter: (val: number) => void;
  pixelblastSpeed: number;
  setPixelblastSpeed: (val: number) => void;
  pixelblastEdgeFade: number;
  setPixelblastEdgeFade: (val: number) => void;
  pixelblastRipples: boolean;
  setPixelblastRipples: (val: boolean) => void;
  pixelblastLiquid: boolean;
  setPixelblastLiquid: (val: boolean) => void;
  colorbendsColor: string;
  setColorbendsColor: (val: string) => void;
  colorbendsRotation: number;
  setColorbendsRotation: (val: number) => void;
  colorbendsAutoRotate: number;
  setColorbendsAutoRotate: (val: number) => void;
  colorbendsSpeed: number;
  setColorbendsSpeed: (val: number) => void;
  colorbendsScale: number;
  setColorbendsScale: (val: number) => void;
  colorbendsFrequency: number;
  setColorbendsFrequency: (val: number) => void;
  colorbendsWarp: number;
  setColorbendsWarp: (val: number) => void;
  colorbendsMouse: number;
  setColorbendsMouse: (val: number) => void;
  colorbendsParallax: number;
  setColorbendsParallax: (val: number) => void;
  colorbendsNoise: number;
  setColorbendsNoise: (val: number) => void;
  colorbendsIterations: number;
  setColorbendsIterations: (val: number) => void;
  colorbendsIntensity: number;
  setColorbendsIntensity: (val: number) => void;
  colorbendsBandWidth: number;
  setColorbendsBandWidth: (val: number) => void;
  liquidchromeColor: string;
  setLiquidchromeColor: (val: string) => void;
  liquidchromeSpeed: number;
  setLiquidchromeSpeed: (val: number) => void;
  liquidchromeAmplitude: number;
  setLiquidchromeAmplitude: (val: number) => void;
  liquidchromeInteractive: boolean;
  setLiquidchromeInteractive: (val: boolean) => void;
  crtwarpColor: string;
  setCrtwarpColor: (val: string) => void;
  crtwarpBackground: string;
  setCrtwarpBackground: (val: string) => void;
  crtwarpSpeed: number;
  setCrtwarpSpeed: (val: number) => void;
  crtwarpCurvature: number;
  setCrtwarpCurvature: (val: number) => void;
  crtwarpWaveAmount: number;
  setCrtwarpWaveAmount: (val: number) => void;
  crtwarpWaveDensity: number;
  setCrtwarpWaveDensity: (val: number) => void;
  crtwarpScanStrength: number;
  setCrtwarpScanStrength: (val: number) => void;
  crtwarpScanDensity: number;
  setCrtwarpScanDensity: (val: number) => void;
  crtwarpBloom: number;
  setCrtwarpBloom: (val: number) => void;
  crtwarpBloomRadius: number;
  setCrtwarpBloomRadius: (val: number) => void;
  crtwarpNoise: number;
  setCrtwarpNoise: (val: number) => void;
  crtwarpVignette: number;
  setCrtwarpVignette: (val: number) => void;
  crtwarpBrightness: number;
  setCrtwarpBrightness: (val: number) => void;
  crtwarpRgbShift: number;
  setCrtwarpRgbShift: (val: number) => void;
  crtwarpPixelSize: number;
  setCrtwarpPixelSize: (val: number) => void;
  crtwarpRenderQuality: number;
  setCrtwarpRenderQuality: (val: number) => void;
  crtwarpFrameRate: number;
  setCrtwarpFrameRate: (val: number) => void;
  crtwarpPointerWarp: boolean;
  setCrtwarpPointerWarp: (val: boolean) => void;
  crtwarpPointerStrength: number;
  setCrtwarpPointerStrength: (val: number) => void;
  crtwarpPaused: boolean;
  setCrtwarpPaused: (val: boolean) => void;
  setAvatarModalOpen: (open: boolean) => void;
  setDecorationPickerOpen: (open: boolean) => void;
  setEffectsPickerOpen?: (open: boolean) => void;
  setBannerImageModalOpen: (open: boolean) => void;
  isVideoUrl: (url: string) => boolean;
}

function SettingSelect<T extends string | number>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const active = options.find((o) => o.value === value);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] text-white/50">{label}</label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3.5 h-10 rounded-xl border bg-[#161616] border-white/5 transition-all duration-200 focus:outline-none cursor-pointer"
        >
          <span className="text-[13px] text-white font-normal">
            {active?.label ?? String(value)}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            <div className="flex flex-col">
              {options.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${opt.value === value
                    ? "bg-white/10 text-white font-medium"
                    : "bg-transparent hover:bg-white/5 text-white/60"
                    }`}
                >
                  <span className="text-[13px]">{opt.label}</span>
                  {opt.value === value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function fileNameOf(url: string): string {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    return name || url;
  } catch {
    return url;
  }
}

function SettingSlider({ label, value, min, max, step, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[12px] text-white/50">{label}</label>
        <span className="text-[12px] text-white/40 font-mono">{value}</span>
      </div>
      <div className="relative flex items-center h-5 group w-full">
        <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-[#5b6cf5]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div
          className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform shadow-lg"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}

export default function AssetsSection({
  isPremium,
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
  bannerBackgroundShuffle,
  setBannerBackgroundShuffle,
  bannerBackgroundAutoplay,
  setBannerBackgroundAutoplay,
  bgUrls,
  setBgUrls,
  bgSelected,
  setBgSelected,
  onAddBackground,
  bannerBackgroundSound,
  setBannerBackgroundSound,
  auroraColor1,
  setAuroraColor1,
  auroraColor2,
  setAuroraColor2,
  auroraColor3,
  setAuroraColor3,
  auroraSpeed,
  setAuroraSpeed,
  auroraBlend,
  setAuroraBlend,
  darkveilSpeed,
  setDarkveilSpeed,
  darkveilHueShift,
  setDarkveilHueShift,
  darkveilNoise,
  setDarkveilNoise,
  darkveilScanFreq,
  setDarkveilScanFreq,
  darkveilScan,
  setDarkveilScan,
  darkveilWarp,
  setDarkveilWarp,
  pixelblastColor,
  setPixelblastColor,
  pixelblastVariant,
  setPixelblastVariant,
  pixelblastPixelSize,
  setPixelblastPixelSize,
  pixelblastPatternScale,
  setPixelblastPatternScale,
  pixelblastPatternDensity,
  setPixelblastPatternDensity,
  pixelblastPixelJitter,
  setPixelblastPixelJitter,
  pixelblastSpeed,
  setPixelblastSpeed,
  pixelblastEdgeFade,
  setPixelblastEdgeFade,
  pixelblastRipples,
  setPixelblastRipples,
  pixelblastLiquid,
  setPixelblastLiquid,
  colorbendsColor,
  setColorbendsColor,
  colorbendsRotation,
  setColorbendsRotation,
  colorbendsAutoRotate,
  setColorbendsAutoRotate,
  colorbendsSpeed,
  setColorbendsSpeed,
  colorbendsScale,
  setColorbendsScale,
  colorbendsFrequency,
  setColorbendsFrequency,
  colorbendsWarp,
  setColorbendsWarp,
  colorbendsMouse,
  setColorbendsMouse,
  colorbendsParallax,
  setColorbendsParallax,
  colorbendsNoise,
  setColorbendsNoise,
  colorbendsIterations,
  setColorbendsIterations,
  colorbendsIntensity,
  setColorbendsIntensity,
  colorbendsBandWidth,
  setColorbendsBandWidth,
  liquidchromeColor,
  setLiquidchromeColor,
  liquidchromeSpeed,
  setLiquidchromeSpeed,
  liquidchromeAmplitude,
  setLiquidchromeAmplitude,
  liquidchromeInteractive,
  setLiquidchromeInteractive,
  crtwarpColor,
  setCrtwarpColor,
  crtwarpBackground,
  setCrtwarpBackground,
  crtwarpSpeed,
  setCrtwarpSpeed,
  crtwarpCurvature,
  setCrtwarpCurvature,
  crtwarpWaveAmount,
  setCrtwarpWaveAmount,
  crtwarpWaveDensity,
  setCrtwarpWaveDensity,
  crtwarpScanStrength,
  setCrtwarpScanStrength,
  crtwarpScanDensity,
  setCrtwarpScanDensity,
  crtwarpBloom,
  setCrtwarpBloom,
  crtwarpBloomRadius,
  setCrtwarpBloomRadius,
  crtwarpNoise,
  setCrtwarpNoise,
  crtwarpVignette,
  setCrtwarpVignette,
  crtwarpBrightness,
  setCrtwarpBrightness,
  crtwarpRgbShift,
  setCrtwarpRgbShift,
  crtwarpPixelSize,
  setCrtwarpPixelSize,
  crtwarpRenderQuality,
  setCrtwarpRenderQuality,
  crtwarpFrameRate,
  setCrtwarpFrameRate,
  crtwarpPointerWarp,
  setCrtwarpPointerWarp,
  crtwarpPointerStrength,
  setCrtwarpPointerStrength,
  crtwarpPaused,
  setCrtwarpPaused,
  setAvatarModalOpen,
  setDecorationPickerOpen,
  setEffectsPickerOpen,
  setBannerImageModalOpen,
  isVideoUrl,
}: AssetsSectionProps) {
  const MAX_BACKGROUNDS = isPremium ? 5 : 1;
  const selectedUrl = bgUrls[bgSelected] ?? "";
  const activeAnimatedId = animatedBackgroundId(selectedUrl);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [bgHeaderMenu, setBgHeaderMenu] = useState(false);

  const setUrlAt = (index: number, url: string) => {
    setBgUrls(bgUrls.map((u, i) => (i === index ? url : u)).filter(Boolean));
  };

  // Preset grid pick: select existing, append (<5), or replace selected.
  const applyPreset = (url: string) => {
    const existing = bgUrls.indexOf(url);
    if (existing >= 0) {
      setBgSelected(existing);
      return;
    }
    if (bgUrls.length >= MAX_BACKGROUNDS) {
      setUrlAt(bgSelected, url);
      return;
    }
    setBgUrls([...bgUrls, url]);
    setBgSelected(bgUrls.length);
  };

  const bgSettingsFor = (id: string | null) => ({
    aurora: id === "aurora" ? { colors: [auroraColor1, auroraColor2, auroraColor3] as [string, string, string], speed: auroraSpeed, blend: auroraBlend } : undefined,
    darkveil: id === "darkveil" ? { speed: darkveilSpeed, hueShift: darkveilHueShift, noiseIntensity: darkveilNoise, scanlineFrequency: darkveilScanFreq, scanlineIntensity: darkveilScan, warpAmount: darkveilWarp } : undefined,
    pixelblast: id === "pixelblast" ? { variant: pixelblastVariant, pixelSize: pixelblastPixelSize, color: pixelblastColor, patternScale: pixelblastPatternScale, patternDensity: pixelblastPatternDensity, pixelJitter: pixelblastPixelJitter, speed: pixelblastSpeed, edgeFade: pixelblastEdgeFade, ripples: pixelblastRipples, liquid: pixelblastLiquid } : undefined,
    colorbends: id === "colorbends" ? { color: colorbendsColor, rotation: colorbendsRotation, autoRotate: colorbendsAutoRotate, speed: colorbendsSpeed, scale: colorbendsScale, frequency: colorbendsFrequency, warpStrength: colorbendsWarp, mouseInfluence: colorbendsMouse, parallax: colorbendsParallax, noise: colorbendsNoise, iterations: colorbendsIterations, intensity: colorbendsIntensity, bandWidth: colorbendsBandWidth } : undefined,
    liquidchrome: id === "liquidchrome" ? { color: liquidchromeColor, speed: liquidchromeSpeed, amplitude: liquidchromeAmplitude, interactive: liquidchromeInteractive } : undefined,
    crtwarp: id === "crtwarp" ? { color: crtwarpColor, background: crtwarpBackground, speed: crtwarpSpeed, curvature: crtwarpCurvature, waveAmount: crtwarpWaveAmount, waveDensity: crtwarpWaveDensity, scanStrength: crtwarpScanStrength, scanDensity: crtwarpScanDensity, bloom: crtwarpBloom, bloomRadius: crtwarpBloomRadius, noise: crtwarpNoise, vignette: crtwarpVignette, brightness: crtwarpBrightness, rgbShift: crtwarpRgbShift, pixelSize: crtwarpPixelSize, renderQuality: crtwarpRenderQuality, frameRate: crtwarpFrameRate, pointerWarp: crtwarpPointerWarp, pointerStrength: crtwarpPointerStrength, paused: crtwarpPaused } : undefined,
  });

  const deleteAt = (index: number) => {
    const next = bgUrls.filter((_, i) => i !== index);
    setBgUrls(next);
    setBgSelected(Math.min(bgSelected, Math.max(0, next.length - 1)));
    setOpenMenu(null);
  };

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent, i: number) => {
    setDraggedIdx(i);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === i) return;
    setDragOverIdx(i);
  };

  const handleDrop = (e: DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === i) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...bgUrls];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(i, 0, moved);
    setBgUrls(next);
    setBgSelected(i);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prevAnimatedId, setPrevAnimatedId] = useState<string | null>(null);

  // Collapse settings whenever a different preset is picked.
  if (prevAnimatedId !== activeAnimatedId) {
    setPrevAnimatedId(activeAnimatedId);
    setShowAdvanced(false);
  }

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
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <h3 className="text-white font-normal text-[16px] tracking-tight">Backgrounds</h3>
                <p className="text-white/40 text-[13px] mt-0.5">Images or videos that play behind your page.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setBgHeaderMenu(!bgHeaderMenu)}
                    title="Backgrounds settings"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </button>
                  {bgHeaderMenu && (
                    <>
                      <button type="button" aria-label="Close menu" onClick={() => setBgHeaderMenu(false)} className="fixed inset-0 z-30 cursor-default" />
                      <div className="absolute right-0 top-full mt-1.5 z-40 w-56 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-3 py-2 rounded-md">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-white/90">Shuffle</span>
                            <span className="text-[11px] text-white/35">Random background on load</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBannerBackgroundShuffle(!bannerBackgroundShuffle)}
                            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                              bannerBackgroundShuffle ? "bg-[#5b6cf5]" : "bg-white/10"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${bannerBackgroundShuffle ? "right-[4px]" : "left-[4px]"}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-md">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-white/90">Autoplay</span>
                            <span className="text-[11px] text-white/35">Play next video automatically</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBannerBackgroundAutoplay(!bannerBackgroundAutoplay)}
                            className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                              bannerBackgroundAutoplay ? "bg-[#5b6cf5]" : "bg-white/10"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${bannerBackgroundAutoplay ? "right-[4px]" : "left-[4px]"}`} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {bgUrls.length < MAX_BACKGROUNDS && (
                  <button
                    type="button"
                    onClick={() => onAddBackground()}
                    className="shrink-0 flex items-center gap-1.5 bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 border border-[#5b6cf5]/30 text-white text-[13px] font-normal py-2 px-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Add background
                  </button>
                )}
                {!isPremium && bgUrls.length >= MAX_BACKGROUNDS && (
                  <button
                    type="button"
                    onClick={() => toast.error("Backgrounds 2–5 need Premium.")}
                    title="Premium feature"
                    className="shrink-0 flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-dashed border-white/15 text-white/70 text-[13px] font-normal py-2 px-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    <PremiumLogo size={13} />
                    More backgrounds
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 h-full">
              {bgUrls.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/10 py-8 px-4 text-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <p className="text-[13px] font-medium text-white/90 mt-1">No backgrounds yet.</p>
                  <p className="text-[12px] text-white/35">Add an image or video to bring your page to life.</p>
                </div>
              ) : (
                <div className={`flex-1 rounded-[14px] border border-white/5 p-2 flex flex-col gap-2 ${bgUrls.length > 2 ? "max-h-[172px] overflow-y-auto custom-scrollbar" : ""}`}>
                {bgUrls.map((url, i) => {
                  const pid = animatedBackgroundId(url);
                  const preset = pid ? ANIMATED_BACKGROUNDS.find((p) => p.id === pid) : null;
                  const title = preset ? preset.name : fileNameOf(url);
                  const sub = preset ? `animated:${pid}` : (isVideoUrl(url) ? "Video" : "Image");
                  return (
                    <div
                      key={`${i}-${url}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDrop={(e) => handleDrop(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors select-none ${draggedIdx === i
                        ? "opacity-35 border-[#5b6cf5]/40 scale-[0.99]"
                        : dragOverIdx === i
                        ? "border-[#5b6cf5] bg-[#161616] shadow-lg shadow-[#5b6cf5]/10"
                        : bgSelected === i
                        ? "bg-white/[0.04] border-[#5b6cf5]/60"
                        : "bg-[#161616] border-white/5"
                      }`}
                    >
                      <span
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, i);
                        }}
                        onDragEnd={handleDragEnd}
                        title="Drag to reorder"
                        className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                      </span>
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black">
                        {pid ? (
                          <AnimatedBackground id={pid} {...bgSettingsFor(pid)} />
                        ) : isVideoUrl(url) ? (
                          <video src={url} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline />
                        ) : (
                          <Image src={url} alt="" fill unoptimized className="absolute inset-0 w-full h-full object-cover" />
                        )}
                      </div>
                      <button type="button" onClick={() => setBgSelected(i)} className="flex-1 min-w-0 text-left cursor-pointer">
                        <p className="text-[13px] text-white truncate">{title}</p>
                        <p className="text-[11px] text-white/35 truncate">{sub}</p>
                      </button>
                      {isVideoUrl(url) && (
                        <button
                          type="button"
                          onClick={() => setBannerBackgroundSound(!bannerBackgroundSound)}
                          title={bannerBackgroundSound ? "Mute background video" : "Play background video with sound"}
                          className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                            bannerBackgroundSound ? "bg-[#5b6cf5]" : "bg-white/10"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${bannerBackgroundSound ? "right-[4px]" : "left-[4px]"}`} />
                        </button>
                      )}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setOpenMenu(openMenu === i ? null : i)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          title="Background options"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
                        </button>
                        {openMenu === i && (
                          <>
                            <button type="button" aria-label="Close menu" onClick={() => setOpenMenu(null)} className="fixed inset-0 z-30 cursor-default" />
                            <div className="absolute right-0 top-full mt-1.5 z-40 w-44 p-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl flex flex-col">
                              <button
                                type="button"
                                onClick={() => deleteAt(i)}
                                className="flex items-center px-3 py-2 rounded-md text-[13px] text-red-400 hover:bg-red-400/10 transition-all text-left cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
            <p className="text-[11px] text-white/30 leading-[1.6]">Supports images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, MOV, max 50MB). Recommended size: 1920x1080.</p>
          </div>

          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <h3 className="text-white font-normal text-[16px] tracking-tight">Banner</h3>
                <p className="text-white/40 text-[13px] mt-0.5">Wide image shown at the top of your page.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-1">
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
            {bannerImageUrl ? (
              <div
                onClick={() => setBannerImageModalOpen(true)}
                className="relative rounded-[14px] border border-white/5 overflow-hidden cursor-pointer group"
              >
                {isVideoUrl(bannerImageUrl) ? (
                  <video
                    src={bannerImageUrl}
                    className="w-full h-28 object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={bannerImageUrl}
                    alt="Banner"
                    width={1200}
                    height={180}
                    unoptimized
                    loading="eager"
                    className="w-full h-28 object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[13px] font-medium text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Change banner</span>
                </div>
                <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                  <span className="h-7 px-2 flex items-center rounded-md bg-black/60 text-[10px] font-medium text-white/80 tracking-wide">
                    {(() => {
                      try {
                        const n = fileNameOf(bannerImageUrl);
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
                      setBannerImageUrl("");
                    }}
                    title="Remove banner"
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-black/60 text-red-400 hover:text-red-300 hover:bg-black/80 transition-all cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setBannerImageModalOpen(true)}
                className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/10 py-8 px-4 text-center cursor-pointer hover:border-white/20 transition-colors"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <p className="text-[13px] font-medium text-white/90 mt-1">No banner yet.</p>
                <p className="text-[12px] text-white/35">Add an image to top your page off.</p>
              </div>
            )}
            <p className="text-[11px] text-white/30 leading-[1.6]">Recommended size: 1920x1080.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-white/90">Animated backgrounds</span>
            <span className="text-[11px] text-white/30">Loop forever, no upload needed</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {ANIMATED_BACKGROUNDS.map((preset) => {
              const presetUrl = animatedBackgroundUrl(preset.id);
              const active = selectedUrl === presetUrl;
              const locked = preset.premium && !isPremium;
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.premium && !isPremium ? `${preset.name} · Premium` : preset.name}
                  onClick={() => {
                    if (locked) {
                      toast.error(`${preset.name} needs Premium.`);
                      return;
                    }
                    if (active) {
                      deleteAt(bgSelected);
                    } else {
                      applyPreset(presetUrl);
                    }
                  }}
                    className={`relative h-20 rounded-xl overflow-hidden border transition-colors cursor-pointer focus:outline-none ${
                      active
                        ? "border-[#5b6cf5] ring-1 ring-[#5b6cf5]/60"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <AnimatedBackground id={preset.id} />
                    {preset.premium && (
                      <span className="absolute top-1.5 left-1.5 flex items-center justify-center rounded-full bg-black/60 border border-white/10 p-[3px]">
                        <PremiumLogo size={11} />
                      </span>
                    )}
                    <span className={`absolute bottom-1.5 left-2 text-[10.5px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${active ? "text-white" : "text-white/65"}`}>
                      {preset.name}
                    </span>
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-[#5b6cf5] flex items-center justify-center shadow-[0_0_8px_rgba(91,108,245,0.8)]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeAnimatedId && (
          <div className="flex flex-col pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between bg-[#161616] border border-white/5 hover:border-white/10 rounded-xl h-11 px-3.5 transition-all cursor-pointer"
            >
              <span className="text-[13px] text-white/90">Advanced settings</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}

        {activeAnimatedId === "aurora" && showAdvanced && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white/90">Aurora settings</span>
              <span className="text-[11px] text-white/30">Only for Aurora</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Color 1</label>
                <ColorPickerInput value={auroraColor1} onChange={setAuroraColor1} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Color 2</label>
                <ColorPickerInput value={auroraColor2} onChange={setAuroraColor2} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Color 3</label>
                <ColorPickerInput value={auroraColor3} onChange={setAuroraColor3} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] text-white/50">Speed</label>
                  <span className="text-[12px] text-white/40 font-mono">{auroraSpeed}</span>
                </div>
                <div className="relative flex items-center h-5 group w-full">
                  <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-[#5b6cf5]"
                      style={{ width: `${(auroraSpeed / 3) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={auroraSpeed}
                    onChange={(e) => setAuroraSpeed(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div
                    className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform shadow-lg"
                    style={{ left: `calc(${(auroraSpeed / 3) * 100}% - 8px)` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] text-white/50">Blend</label>
                  <span className="text-[12px] text-white/40 font-mono">{auroraBlend}</span>
                </div>
                <div className="relative flex items-center h-5 group w-full">
                  <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-[#5b6cf5]"
                      style={{ width: `${auroraBlend * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={auroraBlend}
                    onChange={(e) => setAuroraBlend(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div
                    className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform shadow-lg"
                    style={{ left: `calc(${auroraBlend * 100}% - 8px)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeAnimatedId === "darkveil" && showAdvanced && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white/90">Dark Veil settings</span>
              <span className="text-[11px] text-white/30">Only for Dark Veil</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
              <SettingSlider label="Speed" value={darkveilSpeed} min={0} max={2} step={0.1} onChange={setDarkveilSpeed} />
              <SettingSlider label="Hue Shift" value={darkveilHueShift} min={0} max={360} step={1} onChange={setDarkveilHueShift} />
              <SettingSlider label="Noise Intensity" value={darkveilNoise} min={0} max={1} step={0.05} onChange={setDarkveilNoise} />
              <SettingSlider label="Scanline Frequency" value={darkveilScanFreq} min={0} max={100} step={1} onChange={setDarkveilScanFreq} />
              <SettingSlider label="Scanline Intensity" value={darkveilScan} min={0} max={1} step={0.05} onChange={setDarkveilScan} />
              <SettingSlider label="Warp Amount" value={darkveilWarp} min={0} max={10} step={0.1} onChange={setDarkveilWarp} />
            </div>
          </div>
        )}

        {activeAnimatedId === "colorbends" && showAdvanced && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white/90">Color Bends settings</span>
              <span className="text-[11px] text-white/30">Only for Color Bends</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Color</label>
                <ColorPickerInput value={colorbendsColor} onChange={setColorbendsColor} />
              </div>
              <SettingSlider label="Rotation (deg)" value={colorbendsRotation} min={0} max={360} step={1} onChange={setColorbendsRotation} />
              <SettingSlider label="Auto Rotate (deg/s)" value={colorbendsAutoRotate} min={0} max={360} step={1} onChange={setColorbendsAutoRotate} />
              <SettingSlider label="Speed" value={colorbendsSpeed} min={0} max={2} step={0.05} onChange={setColorbendsSpeed} />
              <SettingSlider label="Scale" value={colorbendsScale} min={0.1} max={5} step={0.1} onChange={setColorbendsScale} />
              <SettingSlider label="Frequency" value={colorbendsFrequency} min={0} max={5} step={0.1} onChange={setColorbendsFrequency} />
              <SettingSlider label="Warp Strength" value={colorbendsWarp} min={0} max={5} step={0.1} onChange={setColorbendsWarp} />
              <SettingSlider label="Mouse Influence" value={colorbendsMouse} min={0} max={3} step={0.1} onChange={setColorbendsMouse} />
              <SettingSlider label="Parallax" value={colorbendsParallax} min={0} max={2} step={0.05} onChange={setColorbendsParallax} />
              <SettingSlider label="Noise" value={colorbendsNoise} min={0} max={1} step={0.01} onChange={setColorbendsNoise} />
              <SettingSlider label="Iterations" value={colorbendsIterations} min={1} max={5} step={1} onChange={setColorbendsIterations} />
              <SettingSlider label="Intensity" value={colorbendsIntensity} min={0} max={3} step={0.1} onChange={setColorbendsIntensity} />
              <SettingSlider label="Band Width" value={colorbendsBandWidth} min={0} max={20} step={0.5} onChange={setColorbendsBandWidth} />
            </div>
          </div>
        )}

        {activeAnimatedId === "crtwarp" && showAdvanced && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white/90">CRT Warp settings</span>
              <span className="text-[11px] text-white/30">Only for CRT Warp</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Phosphor Color</label>
                <ColorPickerInput value={crtwarpColor} onChange={setCrtwarpColor} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Background</label>
                <ColorPickerInput value={crtwarpBackground} onChange={setCrtwarpBackground} />
              </div>
              <SettingSlider label="Speed" value={crtwarpSpeed} min={0} max={2} step={0.05} onChange={setCrtwarpSpeed} />
              <SettingSlider label="Curvature" value={crtwarpCurvature} min={0} max={1} step={0.01} onChange={setCrtwarpCurvature} />
              <SettingSlider label="Wave Amount" value={crtwarpWaveAmount} min={0} max={1} step={0.01} onChange={setCrtwarpWaveAmount} />
              <SettingSlider label="Wave Density" value={crtwarpWaveDensity} min={0} max={5} step={0.1} onChange={setCrtwarpWaveDensity} />
              <SettingSlider label="Scanline Strength" value={crtwarpScanStrength} min={0} max={1} step={0.01} onChange={setCrtwarpScanStrength} />
              <SettingSlider label="Scanline Density" value={crtwarpScanDensity} min={0} max={400} step={1} onChange={setCrtwarpScanDensity} />
              <SettingSlider label="Bloom" value={crtwarpBloom} min={0} max={3} step={0.1} onChange={setCrtwarpBloom} />
              <SettingSlider label="Bloom Radius" value={crtwarpBloomRadius} min={0} max={3} step={0.1} onChange={setCrtwarpBloomRadius} />
              <SettingSlider label="Noise" value={crtwarpNoise} min={0} max={1} step={0.01} onChange={setCrtwarpNoise} />
              <SettingSlider label="Vignette" value={crtwarpVignette} min={0} max={1} step={0.05} onChange={setCrtwarpVignette} />
              <SettingSlider label="Brightness" value={crtwarpBrightness} min={0} max={2.5} step={0.05} onChange={setCrtwarpBrightness} />
              <SettingSlider label="RGB Shift" value={crtwarpRgbShift} min={0} max={0.1} step={0.001} onChange={setCrtwarpRgbShift} />
              <SettingSelect
                label="Pixel Size"
                value={crtwarpPixelSize}
                onChange={setCrtwarpPixelSize}
                options={[
                  { value: 1, label: "Smooth" },
                  { value: 2, label: "Pixel 2" },
                  { value: 3, label: "Pixel 3" },
                  { value: 4, label: "Pixel 4" },
                ]}
              />
              <SettingSelect
                label="Render Quality"
                value={crtwarpRenderQuality}
                onChange={setCrtwarpRenderQuality}
                options={[
                  { value: 1, label: "Performance" },
                  { value: 1.5, label: "Balanced" },
                  { value: 2, label: "Ultra" },
                ]}
              />
              <SettingSelect
                label="Frame Rate"
                value={crtwarpFrameRate}
                onChange={setCrtwarpFrameRate}
                options={[
                  { value: 15, label: "15 FPS" },
                  { value: 30, label: "30 FPS" },
                  { value: 60, label: "60 FPS" },
                ]}
              />
              <div className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5">
                <span className="text-[13px] text-white/90">Pointer Warp</span>
                <button
                  type="button"
                  onClick={() => setCrtwarpPointerWarp(!crtwarpPointerWarp)}
                  className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                    crtwarpPointerWarp ? "bg-[#5b6cf5]" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${crtwarpPointerWarp ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
              <SettingSlider label="Pointer Strength" value={crtwarpPointerStrength} min={0} max={2} step={0.05} onChange={setCrtwarpPointerStrength} />
              <div className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5">
                <span className="text-[13px] text-white/90">Pause</span>
                <button
                  type="button"
                  onClick={() => setCrtwarpPaused(!crtwarpPaused)}
                  className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                    crtwarpPaused ? "bg-[#5b6cf5]" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${crtwarpPaused ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeAnimatedId === "liquidchrome" && showAdvanced && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white/90">Liquid Chrome settings</span>
              <span className="text-[11px] text-white/30">Only for Liquid Chrome</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Base Color</label>
                <ColorPickerInput value={liquidchromeColor} onChange={setLiquidchromeColor} />
              </div>
              <SettingSlider label="Speed" value={liquidchromeSpeed} min={0} max={2} step={0.05} onChange={setLiquidchromeSpeed} />
              <SettingSlider label="Amplitude" value={liquidchromeAmplitude} min={0} max={2} step={0.05} onChange={setLiquidchromeAmplitude} />
              <div className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5">
                <span className="text-[13px] text-white/90">Enable Interaction</span>
                <button
                  type="button"
                  onClick={() => setLiquidchromeInteractive(!liquidchromeInteractive)}
                  className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                    liquidchromeInteractive ? "bg-[#5b6cf5]" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${liquidchromeInteractive ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeAnimatedId === "pixelblast" && showAdvanced && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-white/90">Pixel Blast settings</span>
              <span className="text-[11px] text-white/30">Only for Pixel Blast</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50">Color</label>
                <ColorPickerInput value={pixelblastColor} onChange={setPixelblastColor} />
              </div>
              <SettingSelect
                label="Variant"
                value={pixelblastVariant}
                onChange={setPixelblastVariant}
                options={[
                  { value: "square", label: "Square" },
                  { value: "circle", label: "Circle" },
                  { value: "triangle", label: "Triangle" },
                  { value: "diamond", label: "Diamond" },
                ]}
              />
              <SettingSlider label="Pixel Size" value={pixelblastPixelSize} min={1} max={20} step={1} onChange={setPixelblastPixelSize} />
              <SettingSlider label="Pattern Scale" value={pixelblastPatternScale} min={0.5} max={10} step={0.5} onChange={setPixelblastPatternScale} />
              <SettingSlider label="Pattern Density" value={pixelblastPatternDensity} min={0} max={3} step={0.1} onChange={setPixelblastPatternDensity} />
              <SettingSlider label="Pixel Jitter" value={pixelblastPixelJitter} min={0} max={2} step={0.1} onChange={setPixelblastPixelJitter} />
              <SettingSlider label="Speed" value={pixelblastSpeed} min={0} max={2} step={0.1} onChange={setPixelblastSpeed} />
              <SettingSlider label="Edge Fade" value={pixelblastEdgeFade} min={0} max={1} step={0.05} onChange={setPixelblastEdgeFade} />
              <div className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5">
                <span className="text-[13px] text-white/90">Ripples</span>
                <button
                  type="button"
                  onClick={() => setPixelblastRipples(!pixelblastRipples)}
                  className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                    pixelblastRipples ? "bg-[#5b6cf5]" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${pixelblastRipples ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5">
                <span className="text-[13px] text-white/90">Liquid</span>
                <button
                  type="button"
                  onClick={() => setPixelblastLiquid(!pixelblastLiquid)}
                  className={`w-10 h-6 rounded-full relative flex items-center transition-colors shrink-0 focus:outline-none cursor-pointer ${
                    pixelblastLiquid ? "bg-[#5b6cf5]" : "bg-white/10"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full absolute shadow-sm transition-all bg-white ${pixelblastLiquid ? "right-[4px]" : "left-[4px]"}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
