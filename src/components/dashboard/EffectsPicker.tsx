"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import effects from "@/effects.json";
import type { Decoration } from "@/components/dashboard/DecorationPicker";

type ProfileEffectItem = {
  src: string;
  loop: boolean;
  height?: number | null;
  width?: number | null;
  duration: number;
  start: number;
  loop_delay?: number;
  z_index?: number;
  position?: {
    x: number;
    y: number;
  };
};

export type ProfileEffect = {
  id: string;
  name: string;
  sku_id: string;
  thumbnail_preview?: string;
  reduced_motion?: string;
  static_frame?: string;
  effects: ProfileEffectItem[];
};

interface EffectsPickerProps {
  open: boolean;
  avatarUrl?: string | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle";
  selectedEffect?: Decoration | null;
  effectHue: number;
  onClose: () => void;
  onSelectEffect: (effect: Decoration | null) => void;
  onEffectHueChange: (value: number) => void;
}

const typedEffects = effects as ProfileEffect[];
const itemsPerPage = 8;

export default function EffectsPicker({
  open,
  avatarUrl,
  avatarShape = "circle",
  selectedEffect,
  effectHue,
  onClose,
  onSelectEffect,
  onEffectHueChange,
}: EffectsPickerProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const selectedEffectData = selectedEffect
    ? typedEffects.find((e) => e.sku_id === selectedEffect.url.split("effect:")[1])
    : null;

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return typedEffects;
    return typedEffects.filter((effect) =>
      effect.name.toLowerCase().includes(query) || effect.id.toLowerCase().includes(query)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const avatarShapeClass = {
    square: "rounded-lg",
    soft: "rounded-[14px]",
    rounded: "rounded-[22px]",
    circle: "rounded-full",
  }[avatarShape];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-[2px] cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[91] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-[min(650px,calc(100vh-32px))] w-[min(900px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080808] shadow-[0_24px_80px_rgba(0,0,0,0.75)] cursor-default"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-[16px] font-semibold tracking-tight text-white/90">Choose Profile Effect</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/75"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[250px_1fr] gap-5 px-5 py-5">
              <aside className="flex h-fit self-center flex-col rounded-2xl border border-white/[0.07] bg-[#060606] p-4">
                <p className="text-[14px] font-semibold text-white/90">Preview</p>
                <div className="mt-5 flex items-center justify-center">
                  <div className="relative w-full max-w-[160px] aspect-[4/5] bg-[#111] rounded-[14px] border border-white/5 flex flex-col items-center pt-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[60px] bg-[#1a1a1a] rounded-t-[14px] z-1">
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent pointer-events-none" />
                    </div>

                    {selectedEffectData && selectedEffectData.effects && selectedEffectData.effects.length > 0 && (
                      <div
                        className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                        style={{ filter: `hue-rotate(${effectHue}deg)` }}
                      >
                        {selectedEffectData.effects.map((fx, idx) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={idx}
                            src={fx.src}
                            alt="Effect layer"
                            className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
                            style={{ zIndex: fx.z_index ?? 20 }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="relative w-12 h-12 z-10 mb-3">
                      <div className={`absolute inset-0 overflow-hidden border-2 border-[#111] bg-[#1b1b1b] ${avatarShapeClass}`}>
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt="Avatar preview" fill unoptimized className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-24 h-2.5 bg-white/10 rounded-full mb-2 z-10" />
                    <div className="w-16 h-2 bg-white/5 rounded-full z-10" />
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-white/80">Hue rotation</p>
                  <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[11px] font-semibold text-white/65">
                    {effectHue}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={effectHue}
                  onChange={(event) => onEffectHueChange(Number(event.target.value))}
                  className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] outline-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#5b6cf5]/50 [&::-webkit-slider-thumb]:bg-[#5b6cf5] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(91,108,245,0.12)]"
                />

                <p className="mt-4 text-[13px] text-white/45 text-center truncate">
                  {selectedEffectData ? selectedEffectData.name : "No effect selected"}
                </p>

                {selectedEffect && (
                  <button
                    type="button"
                    onClick={() => onSelectEffect(null)}
                    className="mt-4 h-9 rounded-xl border border-white/[0.07] text-[13px] font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/75 cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      value={search}
                      onChange={(event) => handleSearchChange(event.target.value)}
                      placeholder="Search profile effects..."
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#151515] pl-11 pr-4 text-[13px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#5b6cf5]/35"
                    />
                  </div>
                  <p className="w-20 text-right text-[13px] text-white/45">{filteredItems.length} results</p>
                </div>

                <div className="mt-4 grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-3 overflow-hidden">
                  {visibleItems.map((item: ProfileEffect) => {
                    const isSelected = selectedEffect?.url === `effect:${item.sku_id}`;
                    const previewImage = item.thumbnail_preview || item.static_frame || item.reduced_motion || item.effects?.[0]?.src;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          onSelectEffect({
                            id: item.id,
                            name: item.name,
                            url: `effect:${item.sku_id}`
                          });
                        }}
                        className={`group flex flex-col rounded-[14px] border bg-[#050505] p-2.5 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "border-[#5b6cf5]/50 bg-[#5b6cf5]/8"
                            : "border-white/[0.07] hover:border-white/15 hover:bg-white/[0.025]"
                        }`}
                      >
                        <div className="relative min-h-0 flex-1 w-full flex items-center justify-center overflow-hidden rounded-lg bg-white/[0.02]">
                          <div className="relative w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{ filter: isSelected ? `hue-rotate(${effectHue}deg)` : "none" }}>
                            {previewImage ? (
                              <Image
                                src={previewImage}
                                alt={item.name}
                                fill
                                unoptimized
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs">FX</div>
                            )}
                          </div>
                        </div>
                        <p className="mt-1.5 truncate text-[12px] font-semibold text-white/90 w-full text-center">{item.name}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#050505] px-4 py-3">
                  <p className="text-[13px] text-white/85">Page {currentPage} / {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 items-center justify-center rounded-xl border border-white/[0.07] px-3.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      disabled={currentPage >= totalPages}
                      className="flex h-9 items-center justify-center rounded-xl border border-white/[0.07] px-3.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
