"use client";

import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { startOfDay, subDays, format, isSameDay } from "date-fns";

// ---------------------------------------------------------------------------
// Real per-user data from /api/image-host/stats — every stat and chart below
// is derived from the fetched payload. byKind currently only ever contains
// "image" and "video" (the kinds the upload route records); the extra
// FILE_TYPE_META entries are kept so new kinds render without a code change.
// ---------------------------------------------------------------------------
interface RecentFile {
  url: string;
  name: string;
  size: number;
  kind: string;
  createdAt: number; // epoch ms
}

interface ImageHostStats {
  totalUploads: number;
  storageUsedBytes: number;
  favorites: number;
  byKind: { kind: string; count: number }[];
  recent: number[]; // upload timestamps (epoch ms) within the last 30 days
  recentFiles: RecentFile[];
  quotaBytes: number;
}

const FILE_TYPE_META: Record<string, { label: string; color: string }> = {
  image: { label: "Images", color: "#5b6cf5" },
  video: { label: "Videos", color: "#a855f7" },
  archive: { label: "Archives", color: "#ec4899" },
  audio: { label: "Audio", color: "#38bdf8" },
  other: { label: "Other", color: "#64748b" },
};

function fileTypeMeta(kind: string) {
  return FILE_TYPE_META[kind] ?? FILE_TYPE_META.other;
}

// Uploads chart range options. Totals/stats stay all-time; only this chart
// window is adjustable. The widest window (30d) matches the `recent` payload.
type RangeKey = "24h" | "7d" | "14d" | "30d";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "14d", label: "14d" },
  { key: "30d", label: "30d" },
];

const RANGE_SUBTITLE: Record<RangeKey, string> = {
  "24h": "Uploads over the last 24 hours.",
  "7d": "Uploads over the last 7 days.",
  "14d": "Uploads over the last 14 days.",
  "30d": "Uploads over the last 30 days.",
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const rounded = value >= 100 || i === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[i]}`;
}

// Compact relative time ("2h ago") for the recent-uploads list.
function timeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${Math.max(s, 0)}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function buildSeries(timestamps: number[], range: RangeKey) {
  const now = new Date();
  const dates = timestamps.map((t) => new Date(t));
  const points: { label: string; count: number }[] = [];
  if (range === "24h") {
    // Hourly buckets across the last 24 hours.
    for (let i = 23; i >= 0; i--) {
      const start = new Date(now.getTime() - i * 60 * 60 * 1000);
      start.setMinutes(0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      points.push({ label: format(start, "ha"), count: dates.filter((d) => d >= start && d < end).length });
    }
  } else {
    // Daily buckets across the selected number of days.
    const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const bucket = startOfDay(subDays(now, i));
      points.push({ label: format(bucket, "MMM d"), count: dates.filter((d) => isSameDay(d, bucket)).length });
    }
  }
  return points;
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  const accent = "#5b6cf5";
  return (
    <div className="bg-white/2 border border-white/4 rounded-[20px] p-4 flex items-center gap-4 hover:border-white/8 transition-colors">
      <div
        className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        <span className="text-[11px] uppercase tracking-wider text-white/50 font-normal">{label}</span>
        <span className="text-white text-base font-normal leading-none truncate" style={{ fontFamily: "var(--font-comfortaa)" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function UploadsChart({ timestamps }: { timestamps: number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [range, setRange] = useState<RangeKey>("7d");

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => buildSeries(timestamps, range), [timestamps, range]);
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);
  // Thin the x-axis labels so wide ranges (14d/30d/24h) don't overcrowd.
  const tickInterval = data.length > 10 ? Math.floor(data.length / 6) : 0;
  const yTicks = useMemo(() => {
    if (maxCount <= 4) return Array.from({ length: maxCount + 1 }, (_, i) => i);
    const step = Math.ceil(maxCount / 4);
    const ticks: number[] = [];
    for (let i = 0; i <= maxCount; i += step) ticks.push(i);
    if (ticks[ticks.length - 1] < maxCount) ticks.push(maxCount);
    return ticks;
  }, [maxCount]);

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Uploads</h2>
          <p className="text-white/30 text-[12px] mt-1">{RANGE_SUBTITLE[range]}</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                range === r.key ? "bg-[#5b6cf5]/20 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="h-72 w-full relative">
        {dimensions.width === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" />
          </div>
        ) : (
          <AreaChart key={range} width={dimensions.width} height={dimensions.height} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5b6cf5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5b6cf5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
              dy={10}
              interval={tickInterval}
              minTickGap={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
              domain={[0, maxCount]}
              ticks={yTicks}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const v = payload[0].value as number;
                  return (
                    <div className="bg-[#111] border border-white/10 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-0.5">{label}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5b6cf5]" />
                        <p className="text-white text-xs font-semibold">
                          {v} <span className="text-white/40 font-normal">upload{v === 1 ? "" : "s"}</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="count" name="Uploads" stroke="#5b6cf5" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
          </AreaChart>
        )}
      </div>
    </div>
  );
}

function FileTypesChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const displayData = data.length > 0 ? data : [{ name: "No uploads", value: 1, color: "#333333" }];

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 flex flex-col h-full">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">File types</h2>
        <p className="text-white/30 text-[12px] mt-1">How your uploads break down by type.</p>
      </div>

      <div ref={containerRef} className="h-52 w-full relative mt-4 flex-1">
        {dimensions.width === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" />
          </div>
        ) : (
          <PieChart width={dimensions.width} height={dimensions.height}>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length && data.length > 0) {
                  const value = payload[0].value as number;
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div className="bg-[#0f0f0f] border border-white/10 px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                        <p className="text-white/50 text-xs font-normal tracking-wide">
                          {payload[0].name} <span className="text-white font-normal ml-1.5">{value} ({pct}%)</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie data={displayData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive>
              {displayData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
            </Pie>
          </PieChart>
        )}
      </div>

      {dimensions.width > 0 && data.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white/60 text-xs font-normal">
                {entry.name} <span className="text-white font-medium ml-1">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentUploads({ files, loading }: { files: RecentFile[]; loading: boolean }) {
  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Recent uploads</h2>
        <p className="text-white/30 text-[12px] mt-1">Your latest files.</p>
      </div>
      <div className="mt-4 flex flex-col">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-t-0">
              <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 h-3 rounded bg-white/5 animate-pulse" />
              <div className="w-12 h-3 rounded bg-white/5 animate-pulse shrink-0" />
            </div>
          ))
        ) : files.length === 0 ? (
          <div className="py-10 text-center text-white/30 text-[13px]">No uploads yet.</div>
        ) : (
          files.map((f) => (
            <a key={f.url} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-t-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0 relative">
                {f.kind === "video" ? (
                  <>
                    <video src={f.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
              <span className="flex-1 min-w-0 truncate text-white/90 text-[13px]">{f.name}</span>
              <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md shrink-0" style={{ color: fileTypeMeta(f.kind).color, backgroundColor: `${fileTypeMeta(f.kind).color}18` }}>{f.kind}</span>
              <span className="text-white/50 text-xs shrink-0 w-16 text-right tabular-nums">{formatBytes(f.size)}</span>
              <span className="text-white/40 text-xs shrink-0 w-16 text-right hidden sm:block">{timeAgo(f.createdAt)}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

export default function ImageHostOverviewClient() {
  const [stats, setStats] = useState<ImageHostStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/image-host/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.totalUploads === "number") setStats(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const typeData = useMemo(() => {
    if (!stats) return [];
    return stats.byKind
      .filter((b) => b.count > 0)
      .map((b) => ({ name: fileTypeMeta(b.kind).label, value: b.count, color: fileTypeMeta(b.kind).color }));
  }, [stats]);

  const timestamps = stats?.recent ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total uploads" value={loading ? "—" : String(stats?.totalUploads ?? 0)} icon={<ImageIcon />} />
        <StatCard label="Storage used" value={loading ? "—" : formatBytes(stats?.storageUsedBytes ?? 0)} icon={<StorageIcon />} />
        <StatCard label="Favorites" value={loading ? "—" : String(stats?.favorites ?? 0)} icon={<HeartIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <UploadsChart timestamps={timestamps} />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <FileTypesChart data={typeData} />
        </div>
      </div>

      <RecentUploads files={stats?.recentFiles ?? []} loading={loading} />
    </div>
  );
}
