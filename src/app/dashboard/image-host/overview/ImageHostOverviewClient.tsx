"use client";

import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { startOfDay, subDays, format, isSameDay } from "date-fns";

interface ActivityEntry {
  action: "upload" | "delete";
  url: string | null;
  name: string;
  size: number;
  kind: string;
  createdAt: number;
}

interface ImageHostStats {
  totalUploads: number;
  storageUsedBytes: number;
  favorites: number;
  byKind: { kind: string; count: number }[];
  recent: number[];
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

function buildSeries(timestamps: number[], range: RangeKey) {
  const now = new Date();
  const dates = timestamps.map((t) => new Date(t));
  const points: { label: string; count: number }[] = [];
  if (range === "24h") {
    for (let i = 23; i >= 0; i--) {
      const start = new Date(now.getTime() - i * 60 * 60 * 1000);
      start.setMinutes(0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      points.push({ label: format(start, "ha"), count: dates.filter((d) => d >= start && d < end).length });
    }
  } else {
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

function ActivityActionIcon({ action }: { action: "upload" | "delete" }) {
  if (action === "delete") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ActivityRow({ item }: { item: ActivityEntry }) {
  const meta = fileTypeMeta(item.kind);
  const isDelete = item.action === "delete";
  const rowClass = "flex items-center gap-3 px-3 h-11 border-t border-white/[0.04] first:border-t-0 transition-colors";
  const content = (
    <>
      <span className="flex items-center gap-2 w-[104px] shrink-0">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={isDelete ? { color: "#f87171", backgroundColor: "rgba(248,113,113,0.1)" } : { color: "#5b6cf5", backgroundColor: "rgba(91,108,245,0.12)" }}
        >
          <ActivityActionIcon action={item.action} />
        </span>
        <span className={`text-[12px] font-normal ${isDelete ? "text-white/45" : "text-white/70"}`}>
          {isDelete ? "Deleted" : "Uploaded"}
        </span>
      </span>
      <span className={`flex-1 min-w-0 truncate text-[13px] ${isDelete ? "text-white/40" : "text-white/90"}`}>{item.name}</span>
      <span className="w-[64px] shrink-0 hidden sm:block">
        <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md" style={{ color: meta.color, backgroundColor: `${meta.color}18` }}>
          {item.kind}
        </span>
      </span>
      <span className="w-16 shrink-0 text-right tabular-nums text-white/50 text-xs">{formatBytes(item.size)}</span>
      <span className="w-28 shrink-0 text-right text-white/40 text-xs tabular-nums hidden sm:block">{format(new Date(item.createdAt), "MMM d, h:mm a")}</span>
    </>
  );

  if (!isDelete && item.url) {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className={`${rowClass} hover:bg-white/[0.02]`}>
        {content}
      </a>
    );
  }
  return <div className={rowClass}>{content}</div>;
}

function RecentActivity() {
  const PAGE_SIZE = 5;
  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/image-host/activity?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.items)) return;
        setItems(data.items);
        setTotal(typeof data.total === "number" ? data.total : 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstLoad = loading && items.length === 0;
  const start = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE + items.length, total);

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), pageCount - 1);
    if (clamped === page) return;
    setLoading(true);
    setPage(clamped);
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Recent activity</h2>
        <p className="text-white/30 text-[12px] mt-1">Your latest uploads and deletions.</p>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3 px-3 pb-2 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30 font-medium">
          <span className="w-[104px] shrink-0">Action</span>
          <span className="flex-1 min-w-0">Name</span>
          <span className="w-[64px] shrink-0 hidden sm:block">Type</span>
          <span className="w-16 shrink-0 text-right">Size</span>
          <span className="w-28 shrink-0 text-right hidden sm:block">When</span>
        </div>

        <div className={`flex flex-col transition-opacity ${loading && !firstLoad ? "opacity-50" : ""}`}>
          {firstLoad ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 h-11 border-t border-white/[0.04] first:border-t-0">
                <div className="w-[104px] h-3 rounded bg-white/5 animate-pulse shrink-0" />
                <div className="flex-1 h-3 rounded bg-white/5 animate-pulse" />
                <div className="w-16 h-3 rounded bg-white/5 animate-pulse shrink-0" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-white/30 text-[13px]">No activity yet.</div>
          ) : (
            items.map((item, i) => <ActivityRow key={`${item.action}-${item.createdAt}-${i}`} item={item} />)
          )}
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-[11px] text-white/30 tabular-nums">
              {start}–{end} of {total}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 0 || loading}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <span className="text-[11px] text-white/40 tabular-nums px-1 min-w-[48px] text-center">
                {page + 1} / {pageCount}
              </span>
              <button
                onClick={() => goTo(page + 1)}
                disabled={page >= pageCount - 1 || loading}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
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

      <RecentActivity />
    </div>
  );
}
