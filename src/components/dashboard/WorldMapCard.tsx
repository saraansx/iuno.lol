"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mercator } from "@visx/geo";
import { ParentSize } from "@visx/responsive";
import { feature as topoFeature } from "topojson-client";
import worldTopology from "world-atlas/countries-110m.json";
import { alpha2ToNumeric, countryName, flagEmoji } from "@/lib/geo/countries";
import type { CountryViewStat } from "@/lib/features/users/db";
import type { Feature, Geometry } from "geojson";

type WorldFeature = Feature<Geometry, { name?: string }>;

const geo = topoFeature(
  worldTopology as unknown as Parameters<typeof topoFeature>[0],
  (worldTopology as unknown as { objects: Record<string, unknown> }).objects.countries as never,
) as unknown as { features: WorldFeature[] };

const WORLD_FEATURES = geo.features;

const ACCENT = "91, 108, 245";

type HoverState = { name: string; count: number; x: number; y: number } | null;

export default function WorldMapCard({ data }: { data: CountryViewStat[] }) {
  const [hover, setHover] = useState<HoverState>(null);
  const [allOpen, setAllOpen] = useState(false);

  const { numericCounts, max, ranked, total } = useMemo(() => {
    const numericCounts = new Map<string, number>();
    let max = 0;
    let total = 0;
    for (const row of data) {
      const num = alpha2ToNumeric(row.country);
      if (num) numericCounts.set(num, (numericCounts.get(num) ?? 0) + row.count);
      max = Math.max(max, row.count);
      total += row.count;
    }
    const ranked = [...data].sort((a, b) => b.count - a.count);
    return { numericCounts, max, ranked, total };
  }, [data]);

  const topFive = ranked.slice(0, 5);

  const fillFor = (count: number) =>
    count > 0 ? `rgba(${ACCENT}, ${0.18 + 0.62 * (max > 0 ? count / max : 0)})` : "rgba(255,255,255,0.035)";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-4">
      {}
      <div className="relative bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm overflow-hidden">
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">World map</h2>
        <p className="text-white/40 text-[13px] mt-0.5">A visual spread of where your profile traffic is coming from.</p>

        <div className="mt-4 w-full aspect-[16/9] relative">
          <ParentSize>
            {({ width, height }) => {
              if (width < 10) return null;
              const scale = (width / 630) * 100;
              return (
                <svg
                  width={width}
                  height={height}
                  onMouseLeave={() => setHover(null)}
                  className="overflow-visible"
                >
                  <Mercator<WorldFeature>
                    data={WORLD_FEATURES}
                    scale={scale}
                    translate={[width / 2, height / 1.55]}
                    center={[0, 20]}
                  >
                    {(mercator) => (
                      <g>
                        {mercator.features.map(({ feature, path }, i) => {
                          const id = feature.id != null ? String(feature.id).padStart(3, "0") : "";
                          const count = numericCounts.get(id) ?? 0;
                          if (!path) return null;
                          return (
                            <path
                              key={i}
                              d={path}
                              fill={fillFor(count)}
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth={0.5}
                              className="transition-[fill] duration-150 hover:[fill:rgba(91,108,245,0.9)]"
                              onMouseMove={(e) => {
                                const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                                setHover({
                                  name: feature.properties?.name ?? "Unknown",
                                  count,
                                  x: e.clientX - box.left,
                                  y: e.clientY - box.top,
                                });
                              }}
                            />
                          );
                        })}
                      </g>
                    )}
                  </Mercator>
                </svg>
              );
            }}
          </ParentSize>

          {hover && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-[#161616] border border-white/10 px-2.5 py-1.5 shadow-lg"
              style={{ left: hover.x, top: hover.y }}
            >
              <p className="text-[12px] text-white/90 whitespace-nowrap">{hover.name}</p>
              <p className="text-[11px] text-white/45 whitespace-nowrap">{hover.count.toLocaleString()} {hover.count === 1 ? "view" : "views"}</p>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-5 shadow-sm flex flex-col">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <h3 className="text-[13.5px] font-normal text-white/90 tracking-tight">Top countries</h3>
        </div>

        {topFive.length === 0 ? (
          <p className="mt-4 text-[12.5px] text-white/35 leading-relaxed">No country data yet. Once visitors land on your profile, you&apos;ll see them here.</p>
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-0.5">
              {topFive.map((c, i) => (
                <li key={c.country} className="flex items-center gap-2.5 py-1.5">
                  <span className="text-[12px] text-white/30 tabular-nums w-3">{i + 1}</span>
                  <span className="text-[16px] leading-none">{flagEmoji(c.country)}</span>
                  <span className="text-[12.5px] text-white/80 truncate flex-1 min-w-0">{countryName(c.country)}</span>
                  <span className="text-[12px] text-white/40 tabular-nums">{c.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {ranked.length > 5 && (
              <button
                type="button"
                onClick={() => setAllOpen(true)}
                className="mt-3 text-[12.5px] text-[#8b93f0] hover:text-white transition-colors self-start cursor-pointer"
              >
                View all countries →
              </button>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {allOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setAllOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-[min(440px,92vw)] max-h-[80vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[20px] p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-normal text-white/90 tracking-tight">All countries</h2>
                <button
                  type="button"
                  onClick={() => setAllOpen(false)}
                  aria-label="Close"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[12px] text-white/35 mt-0.5">{ranked.length} countries · {total.toLocaleString()} views</p>

              <ul className="mt-4 flex flex-col gap-0.5 overflow-y-auto pr-1">
                {ranked.map((c, i) => (
                  <li key={c.country} className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-[12px] text-white/30 tabular-nums w-6">{i + 1}</span>
                    <span className="text-[16px] leading-none">{flagEmoji(c.country)}</span>
                    <span className="text-[12.5px] text-white/80 truncate flex-1 min-w-0">{countryName(c.country)}</span>
                    <span className="text-[12px] text-white/40 tabular-nums">{c.count.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
