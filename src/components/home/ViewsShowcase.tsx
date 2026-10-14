"use client";

import { useEffect, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RangeData {
  id: string;
  label: string;
  long: string;
  points: number[];
  xLabels: string[];
  total: number;
  avg: number;
  peak: number;
  peakDay: string;
}

const RANGES: RangeData[] = [
  {
    id: "24h",
    label: "24h",
    long: "last 24 hours",
    points: [2, 1, 0, 1, 0, 2, 1, 3, 5, 8, 6, 9, 11, 8, 7, 9, 6, 5, 4, 6, 3, 2, 1, 2],
    xLabels: ["12a", "6a", "12p", "6p"],
    total: 92,
    avg: 4,
    peak: 11,
    peakDay: "2pm",
  },
  {
    id: "7d",
    label: "7d",
    long: "last 7 days",
    points: [40, 55, 48, 62, 78, 70, 88, 102, 95, 110, 125, 118, 132, 150, 142, 158, 168, 155, 140, 132, 145, 128, 115, 100],
    xLabels: ["M", "T", "W", "T", "F", "S", "S"],
    total: 842,
    avg: 120,
    peak: 168,
    peakDay: "Sat",
  },
  {
    id: "14d",
    label: "14d",
    long: "last 14 days",
    points: [60, 80, 72, 95, 110, 102, 125, 140, 132, 155, 170, 162, 180, 195, 188, 201, 190, 175, 168, 182, 170, 158, 145, 130],
    xLabels: ["W1", "W2", "W3", "W4"],
    total: 1930,
    avg: 138,
    peak: 201,
    peakDay: "Fri",
  },
  {
    id: "30d",
    label: "30d",
    long: "last 30 days",
    points: [90, 110, 102, 125, 140, 132, 155, 170, 162, 180, 195, 188, 201, 215, 208, 222, 232, 218, 205, 198, 212, 200, 188, 175],
    xLabels: ["W1", "W2", "W3", "W4", "W5"],
    total: 4223,
    avg: 141,
    peak: 232,
    peakDay: "Sat",
  },
];

const W = 960;
const H = 200;
const PAD_X = 6;
const PAD_TOP = 12;
const PAD_BOTTOM = 10;

function toXY(points: number[]) {
  const max = Math.max(...points, 1);
  return points.map((v, i) => ({
    x: PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1),
    y: H - PAD_BOTTOM - (v / max) * (H - PAD_TOP - PAD_BOTTOM),
  }));
}

function smoothLine(pts: { x: number; y: number }[]) {
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = `M ${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return d;
}

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, mv]);
  return <>{display.toLocaleString()}</>;
}

function CursorArrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
      <path d="M5.5 3.5 19.5 11.5l-7.8 1.3-3.4 7.2L5.5 3.5z" fill="#fff" stroke="#0a0a0c" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="18.5" cy="18.5" r="4" fill="#8b93e8" stroke="#0a0a0c" strokeWidth="1.4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12C4.8 8.3 8 6.3 12 6.3s7.2 2 9.5 5.7c-2.3 3.7-5.5 5.7-9.5 5.7S4.8 15.7 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function BarsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 20v-6" />
      <path d="M12 20V8" />
      <path d="M18 20v-11" />
    </svg>
  );
}

function PeakIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

interface Floater {
  id: number;
  n: number;
}

export function ViewsDemo() {
  const [rangeIdx, setRangeIdx] = useState(0);
  const [cursor, setCursor] = useState({ x: 26, y: 18, pressed: false });
  const [liveExtra, setLiveExtra] = useState(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);

  const range = RANGES[rangeIdx];
  const pts = toXY(range.points);
  const line = smoothLine(pts);
  const area = `${line} L ${W - PAD_X},${H - PAD_BOTTOM} L ${PAD_X},${H - PAD_BOTTOM} Z`;
  const peakIdx = range.points.indexOf(Math.max(...range.points));
  const peak = pts[peakIdx];

  useEffect(() => {
    let stop = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    (async () => {
      await wait(1500);
      let i = 0;
      while (!stop) {
        i = (i + 1) % RANGES.length;
        setCursor({ x: 26 + i * 44, y: 18, pressed: false });
        await wait(750);
        if (stop) return;
        setCursor((c) => ({ ...c, pressed: true }));
        setRangeIdx(i);
        await wait(450);
        if (stop) return;
        setCursor((c) => ({ ...c, pressed: false }));
        await wait(3600);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  useEffect(() => {
    let stop = false;
    let id = 0;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    (async () => {
      while (!stop) {
        await wait(2800);
        if (stop) return;
        const n = 1 + Math.floor(Math.random() * 3);
        id += 1;
        const fid = id;
        setLiveExtra((v) => v + n);
        setFloaters((f) => [...f.slice(-3), { id: fid, n }]);
        setTimeout(() => {
          setFloaters((f) => f.filter((x) => x.id !== fid));
        }, 1400);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      className="w-full max-w-5xl text-left pointer-events-none"
    >
          <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                <h3 className="text-white font-medium text-lg tracking-wide" style={{ fontFamily: "var(--font-comfortaa)" }}>Views</h3>
                <span className="flex items-center gap-1.5 bg-[#5b6cf5]/10 border border-[#5b6cf5]/20 px-2.5 py-1 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5b6cf5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span className="text-[#5b6cf5] text-xs font-bold leading-none">
                    <AnimatedNumber value={range.total + liveExtra} />
                  </span>
                </span>
                <span className="text-xs text-white/35">
                  <AnimatedNumber value={range.total + liveExtra} /> in {range.long}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4ade80]" />
                  </span>
                  <span className="text-[10.5px] font-medium text-[#4ade80] leading-none">live</span>
                </span>
              </div>

              <div className="relative shrink-0">
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                  {RANGES.map((r, i) => (
                    <span
                      key={r.id}
                      className={`w-11 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                        i === rangeIdx ? "bg-[#5b6cf5]/20 text-white" : "text-white/50"
                      }`}
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
                <motion.div
                  animate={{ left: cursor.x, top: cursor.y, scale: cursor.pressed ? 0.82 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="absolute z-20 pointer-events-none"
                  style={{ x: "-4px", y: "-4px" }}
                >
                  <CursorArrow />
                </motion.div>
              </div>
            </div>

            <div className="relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="none" style={{ height: 190 }}>
                <defs>
                  <linearGradient id="views-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b6cf5" stopOpacity="0.3" />
                    <stop offset="95%" stopColor="#5b6cf5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line
                    key={f}
                    x1={PAD_X}
                    x2={W - PAD_X}
                    y1={PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)}
                    y2={PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                ))}
                <motion.path
                  d={area}
                  animate={{ d: area }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  fill="url(#views-area)"
                />
                <motion.path
                  d={line}
                  animate={{ d: line }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  fill="none"
                  stroke="#5b6cf5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <motion.circle
                  cx={peak.x}
                  cy={peak.y}
                  r="4"
                  fill="#0f0f0f"
                  stroke="#5b6cf5"
                  strokeWidth="2.5"
                  animate={{ cx: peak.x, cy: peak.y }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
                <motion.circle
                  cx={peak.x}
                  cy={peak.y}
                  fill="none"
                  stroke="#5b6cf5"
                  strokeWidth="1.5"
                  initial={{ r: 4, opacity: 0.8 }}
                  animate={{ cx: peak.x, cy: peak.y, r: [4, 14], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/30 px-1">
              {range.xLabels.map((l, i) => (
                <span key={`${range.id}-${i}`}>{l}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-1 overflow-visible">
                <span className="flex items-center gap-1.5 text-[11.5px] font-light text-white/40">
                  <EyeIcon /> Total
                </span>
                <span className="text-[22px] font-normal text-white tracking-tight">
                  <AnimatedNumber value={range.total + liveExtra} />
                </span>
                {floaters.map((f) => (
                  <motion.span
                    key={f.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -22 }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    className="absolute right-3 top-3 text-[12px] font-medium text-[#4ade80] pointer-events-none"
                  >
                    +{f.n}
                  </motion.span>
                ))}
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[11.5px] font-light text-white/40">
                  <BarsIcon /> Avg / day
                </span>
                <span className="text-[22px] font-normal text-white tracking-tight">
                  <AnimatedNumber value={range.avg} />
                </span>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[11.5px] font-light text-white/40">
                  <PeakIcon /> Peak
                </span>
                <span className="text-[22px] font-normal text-white tracking-tight">
                  <AnimatedNumber value={range.peak} />
                </span>
                <span className="text-[11px] font-mono text-white/30">{range.peakDay}</span>
              </div>
            </div>
          </div>
    </motion.div>
  );
}
