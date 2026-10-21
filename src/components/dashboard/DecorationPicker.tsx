"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDecorationsCatalog } from "@/lib/collectibles-client";

export type Decoration = {
  id: string;
  name: string;
  url: string;
};

interface DecorationPickerProps {
  open: boolean;
  avatarUrl?: string | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle";
  selectedDecoration?: Decoration | null;
  decorationHue: number;
  onClose: () => void;
  onSelectDecoration: (decoration: Decoration | null) => void;
  onDecorationHueChange: (value: number) => void;
}

const itemsPerPage = 8;

export default function DecorationPicker({
  open,
  avatarUrl,
  avatarShape = "circle",
  selectedDecoration,
  decorationHue,
  onClose,
  onSelectDecoration,
  onDecorationHueChange,
}: DecorationPickerProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const catalog = useDecorationsCatalog(open);
  const loading = catalog === null;

  const filteredItems = useMemo(() => {
    const all = catalog ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((decoration) =>
      decoration.name.toLowerCase().includes(query) || decoration.id.toLowerCase().includes(query)
    );
  }, [search, catalog]);

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
          <h2 className="text-[16px] font-semibold tracking-tight text-white/90">Choose Avatar Decoration</h2>
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

                <div className="relative h-28 w-28">
                  <div className={`absolute inset-0 overflow-hidden border border-white/10 bg-[#1b1b1b] shadow-inner ${avatarShapeClass}`}>
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar preview" fill sizes="48px" unoptimized className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {selectedDecoration && (
                    <div className="pointer-events-none absolute -inset-2">
                      <Image
                        src={selectedDecoration.url}
                        alt={selectedDecoration.name}
                        fill
                        sizes="72px"
                        unoptimized
                        className="object-contain"
                        style={{ filter: `hue-rotate(${decorationHue}deg)` }}
                      />
                    </div>
                  )}
                </div>
            </div>

            <div className="mt-7 flex items-center justify-between">
              <p className="text-[12px] font-semibold text-white/80">Hue rotation</p>
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[11px] font-semibold text-white/65">
                {decorationHue}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={decorationHue}
              onChange={(event) => onDecorationHueChange(Number(event.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] outline-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#5b6cf5]/50 [&::-webkit-slider-thumb]:bg-[#5b6cf5] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(91,108,245,0.12)]"
            />

            <p className="mt-4 text-[13px] text-white/45 text-center">
              {selectedDecoration ? selectedDecoration.name : "No decoration selected"}
            </p>

            {selectedDecoration && (
              <button
                type="button"
                onClick={() => onSelectDecoration(null)}
                className="mt-4 h-9 rounded-xl border border-white/[0.07] text-[13px] font-medium text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/75"
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
                  placeholder="Search decorations..."
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#151515] pl-11 pr-4 text-[13px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#5b6cf5]/35"
                />
              </div>
              <p className="w-20 text-right text-[13px] text-white/45">{loading ? "Loading…" : `${filteredItems.length} results`}</p>
            </div>

            <div className="mt-4 grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-3 overflow-hidden">
              {visibleItems.map((item: Decoration) => {
                const isSelected = selectedDecoration?.url === item.url;
                  
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onSelectDecoration({
                        id: item.id,
                        name: item.name,
                        url: item.url
                      });
                    }}
                    className={`group flex flex-col rounded-[14px] border bg-[#050505] p-2.5 text-left transition-colors ${
                      isSelected
                        ? "border-[#5b6cf5]/50 bg-[#5b6cf5]/8"
                        : "border-white/[0.07] hover:border-white/15 hover:bg-white/[0.025]"
                    }`}
                  >
                    <div className="relative min-h-0 flex-1 w-full flex items-center justify-center">
                      <div className="relative h-16 w-16 transition-transform duration-200 group-hover:scale-105">
                        <Image src={item.url} alt={item.name} fill sizes="64px" unoptimized className="object-contain" style={{ filter: isSelected ? `hue-rotate(${decorationHue}deg)` : "none" }} />
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/60 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/60 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
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
