"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CURATED_ICONIFY_ICONS,
  ICON_COLOR_VERSION,
  iconifySvgUrl,
} from "@/lib/links";

interface IconifyPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  selectedUrl: string;
}

export default function IconifyPickerModal({
  open,
  onClose,
  onSelect,
  selectedUrl,
}: IconifyPickerModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setError(null);
  }, [open ]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/icons/search?query=${encodeURIComponent(q)}&limit=48`
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setResults(Array.isArray(data.icons) ? data.icons.slice(0, 48) : []);
        setError(null);
      } catch {
        setError("Couldn't search icons. Try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const displayNames = useMemo(
    () => (query.trim() ? results : CURATED_ICONIFY_ICONS),
    [query, results]
  );
  const [batchSvgs, setBatchSvgs] = useState<Record<string, string>>({});
  const batchPrevRef = useRef<Record<string, string>>({});

  // Batch-load grid SVGs (one upstream call per icon set) and render via
  // blob URLs — avoids the request burst that gets throttled upstream.
  useEffect(() => {
    let cancelled = false;
    Object.values(batchPrevRef.current).forEach((u) => URL.revokeObjectURL(u));
    batchPrevRef.current = {};
    setBatchSvgs({});
    if (!open || displayNames.length === 0) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/icons/batch?icons=${encodeURIComponent(displayNames.join(","))}&v=${ICON_COLOR_VERSION}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data || typeof data.icons !== "object") return;
        const map: Record<string, string> = {};
        for (const [iconName, svg] of Object.entries(data.icons)) {
          if (typeof svg === "string" && svg.includes("<svg")) {
            map[iconName] = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          }
        }
        if (cancelled) {
          Object.values(map).forEach((u) => URL.revokeObjectURL(u));
          return;
        }
        batchPrevRef.current = map;
        setBatchSvgs(map);
      } catch {
        // Grid cells keep their skeleton placeholders.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, displayNames]);

  useEffect(
    () => () => {
      Object.values(batchPrevRef.current).forEach((u) => URL.revokeObjectURL(u));
    },
    []
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[121] top-1/2 left-1/2 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0c] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[14px] font-medium text-white/90">Choose icon</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.04] hover:text-white/75"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 200,000+ icons…"
                  className="bg-[#161616] border border-white/5 rounded-xl h-10 pl-10 pr-3.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors w-full"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-white/10 border-t-[#609fda] rounded-full animate-spin" />
                </div>
              ) : error ? (
                <p className="text-[12px] text-red-400/80 text-center py-4">{error}</p>
              ) : (
                <>
                  <div className="grid grid-cols-8 gap-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-0.5">
                    {displayNames.map((name) => {
                      const svgUrl = iconifySvgUrl(name);
                      const selected = selectedUrl === svgUrl;
                      const blobSrc = batchSvgs[name];
                      return (
                        <button
                          key={name}
                          type="button"
                          title={name}
                          onClick={() => onSelect(svgUrl)}
                          className={`flex h-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                            selected
                              ? "bg-[#609fda]/20 border-[#609fda]/50 text-white shadow-[0_0_15px_rgba(96,159,218,0.1)]"
                              : "bg-white/[0.03] border-white/5 text-white/60 hover:text-white hover:border-white/15"
                          }`}
                        >
                          {blobSrc ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={blobSrc} alt={name} width={18} height={18} draggable={false} className="w-[18px] h-[18px]" />
                          ) : (
                            <span className="w-[18px] h-[18px] rounded-full bg-white/10 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {query.trim() !== "" && results.length === 0 && (
                    <p className="text-[12px] text-white/30 text-center">No icons found.</p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
