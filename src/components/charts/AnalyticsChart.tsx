"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import type { RawViewBin } from '@/lib/features/users/db';

interface DailyView {
  name: string;
  views: number;
}

interface AnalyticsChartProps {
  totalViews: number;
  initialData: RawViewBin[];
  hourlyData?: RawViewBin[];
}

const RANGES = [
  { id: "24h", label: "24h", long: "Last 24 hours", days: 0 },
  { id: "7d", label: "7d", long: "Last 7 days", days: 7 },
  { id: "14d", label: "14d", long: "Last 14 days", days: 14 },
  { id: "30d", label: "30d", long: "Last 30 days", days: 30 },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

const pad = (n: number) => String(n).padStart(2, "0");

export default function AnalyticsChart({ totalViews, initialData, hourlyData = [] }: AnalyticsChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [range, setRange] = useState<RangeId>("7d");
  const rangeInfo = RANGES.find((r) => r.id === range)!;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  const data = useMemo(() => {
    if (!isMounted) return [];

    const now = new Date();
    const viewMap = new Map<string, number>();

    if (range === "24h") {
      for (const row of hourlyData) viewMap.set(row.d, (viewMap.get(row.d) || 0) + row.c);
      const hours: DailyView[] = [];
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3_600_000);
        const key = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}`;
        hours.push({ name: `${pad(d.getHours())}:00`, views: viewMap.get(key) || 0 });
      }
      return hours;
    }

    const daysBack = rangeInfo.days - 1;
    for (const row of initialData) {
      viewMap.set(row.d, (viewMap.get(row.d) || 0) + row.c);
    }

    const result: DailyView[] = [];
    for (let i = daysBack; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));

      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');

      const key = `${yyyy}-${mm}-${dd}`;
      const label = `${mm}-${dd}`;

      result.push({ name: label, views: viewMap.get(key) || 0 });
    }
    return result;
  }, [initialData, hourlyData, range, rangeInfo.days, isMounted]);

  const rangeTotal = useMemo(() => data.reduce((sum, d) => sum + d.views, 0), [data]);

  const maxViews = useMemo(() => {
    return Math.max(...data.map(d => d.views), 1);
  }, [data]);

  const yTicks = useMemo(() => {
    if (maxViews <= 4) return Array.from({ length: maxViews + 1 }, (_, i) => i);
    const step = Math.ceil(maxViews / 4);
    const ticks = [];
    for (let i = 0; i <= maxViews; i += step) ticks.push(i);
    if (ticks[ticks.length - 1] < maxViews) ticks.push(maxViews);
    return ticks;
  }, [maxViews]);

  return (
    <div className={`bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full relative transition-opacity duration-300 opacity-100`}>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-medium text-lg tracking-wide" style={{ fontFamily: "var(--font-comfortaa)" }}>Views</h2>
          <div className="flex items-center gap-1.5 bg-[#5b6cf5]/10 border border-[#5b6cf5]/20 px-2.5 py-1 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span className="text-[#5b6cf5] text-xs font-bold leading-none" title="All-time views">{totalViews}</span>
          </div>
          <span className="text-xs text-white/35">
            {rangeTotal} in {rangeInfo.long.toLowerCase()}
          </span>
        </div>

        <div role="group" aria-label="Chart range" className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              title={r.long}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                range === r.id ? "bg-[#5b6cf5]/20 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="h-80 w-full relative">
        {!isMounted || dimensions.width === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" />
          </div>
        ) : (
          <AreaChart
            width={dimensions.width}
            height={dimensions.height}
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b6cf5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5b6cf5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                dy={10}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                domain={[0, maxViews]}
                ticks={yTicks}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#111] border border-white/10 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-0.5">{label}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5b6cf5]" />
                          <p className="text-white text-xs font-semibold">
                            {payload[0].value} <span className="text-white/40 font-normal">views</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#5b6cf5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />

            </AreaChart>
        )}
      </div>
    </div>
  );
}
