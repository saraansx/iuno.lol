"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ViewsDemo } from "./ViewsShowcase";
import {
  SpotifyLogoIcon,
  DiscordLogoIcon,
  TikTokLogoIcon,
} from "@/components/profile/widgets/WidgetIcons";

const EASE = [0.22, 1, 0.36, 1] as const;

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="#E1306C" stroke="none" />
    </svg>
  );
}

function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/70">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19" />
      <path d="M12 2.5c2.8 2.6 4.2 5.8 4.2 9.5s-1.4 6.9-4.2 9.5c-2.8-2.6-4.2-5.8-4.2-9.5S9.2 5.1 12 2.5z" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white/25">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function CursorArrow({ color = "#5b6cf5" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
      <path d="M5.5 3.5 19.5 11.5l-7.8 1.3-3.4 7.2L5.5 3.5z" fill="#fff" stroke="#0a0a0c" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="18.5" cy="18.5" r="4" fill={color} stroke="#0a0a0c" strokeWidth="1.4" />
    </svg>
  );
}

interface LinkRow {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
}

const ROWS: LinkRow[] = [
  { id: "instagram", name: "Instagram", url: "instagram.com/saraansx", icon: <InstagramIcon /> },
  { id: "spotify", name: "Spotify", url: "open.spotify.com/saraansx", icon: <SpotifyLogoIcon size={20} className="w-5 h-5" /> },
  { id: "merch", name: "Merch store", url: "shop.saraansx.co", icon: <GlobeIcon /> },
  { id: "discord", name: "Discord server", url: "discord.gg/saraansx", icon: <DiscordLogoIcon size={20} className="w-5 h-5" /> },
];

const HOME_ORDER = ROWS.map((r) => r.id);
const ROW_H = 72;
const HANDLE_X = 46;
const rowY = (i: number) => i * ROW_H + ROW_H / 2;

function useDragDemo() {
  const [order, setOrder] = useState<string[]>(HOME_ORDER);
  const [dragId, setDragId] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ x: 300, y: 260, pressed: false });

  useEffect(() => {
    let stop = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    (async () => {
      await wait(1200);
      let up = true;
      while (!stop) {
        const from = up ? 1 : 0;
        const to = up ? 0 : 1;
        setCursor({ x: HANDLE_X, y: rowY(from), pressed: false });
        await wait(1100);
        if (stop) return;
        setCursor((c) => ({ ...c, pressed: true }));
        setDragId("spotify");
        await wait(550);
        if (stop) return;
        setCursor({ x: HANDLE_X, y: rowY(to), pressed: true });
        setOrder(up ? ["spotify", "instagram", "merch", "discord"] : HOME_ORDER);
        await wait(1050);
        if (stop) return;
        setCursor((c) => ({ ...c, pressed: false }));
        setDragId(null);
        await wait(1500);
        if (stop) return;
        up = !up;
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  return { order, dragId, cursor };
}

function useCopyDemo() {
  const [pos, setPos] = useState({ left: "70%", top: "62%" });
  const [down, setDown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    let stop = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    (async () => {
      await wait(2000);
      while (!stop) {
        setPos({ left: "84%", top: "48%" });
        await wait(850);
        if (stop) return;
        setDown(true);
        setClicks((c) => c + 1);
        setCopied(true);
        await wait(450);
        if (stop) return;
        setDown(false);
        await wait(1900);
        if (stop) return;
        setCopied(false);
        setPos({ left: "62%", top: "62%" });
        await wait(1400);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  return { pos, down, copied, clicks };
}

function ManagerCard() {
  const { order, dragId, cursor } = useDragDemo();
  const byId = new Map(ROWS.map((r) => [r.id, r]));

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-normal text-white/90 tracking-tight">Your links</h3>
        <span className="text-[11px] font-mono text-white/35">4 links</span>
      </div>

      <div className="relative">
        <div className="flex flex-col gap-2">
          {order.map((id, i) => {
            const row = byId.get(id)!;
            const dragging = dragId === id;
            return (
              <motion.div
                key={id}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
                className={`h-16 flex items-center gap-3 px-3 rounded-2xl border transition-colors duration-200 ${
                  dragging
                    ? "border-[#5b6cf5]/40 bg-[#141419] shadow-[0_12px_32px_rgba(0,0,0,0.5)] z-10"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <span className="text-[11px] font-mono text-white/25 w-3 shrink-0">{i + 1}</span>
                <GripIcon />
                <span className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0">
                  {row.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-normal text-white/90 tracking-tight truncate">{row.name}</span>
                  <span className="block text-[11px] font-mono text-white/35 truncate">{row.url}</span>
                </span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white/35 shrink-0">
                  <PencilIcon />
                </span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white/35 shrink-0">
                  <TrashIcon />
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          animate={{ left: cursor.x, top: cursor.y, scale: cursor.pressed ? 0.82 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute z-20 pointer-events-none"
          style={{ x: "-4px", y: "-4px" }}
        >
          <CursorArrow />
          <span className="absolute left-5 top-5 px-1.5 py-0.5 rounded-md bg-[#5b6cf5] text-white text-[10px] font-medium leading-none whitespace-nowrap">
            rio
          </span>
        </motion.div>
      </div>

      <p className="text-[12.5px] font-light text-white/40">Drag to reorder. Changes save instantly.</p>
    </div>
  );
}

function ShareCard() {
  const { pos, down, copied, clicks } = useCopyDemo();

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
      <h3 className="text-[14px] font-normal text-white/90 tracking-tight">Share it once</h3>

      <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] pl-3 pr-1.5 py-1.5 flex items-center gap-2.5 overflow-visible">
        <span className="w-8 h-8 rounded-xl bg-[#5b6cf5]/20 flex items-center justify-center shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b93e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </span>
        <span className="flex-1 min-w-0 text-[13px] font-mono text-white/80 truncate">iuno.lol/saraansx</span>
        <span className="relative w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
          {copied ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2.5" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {clicks > 0 && (
            <motion.span
              key={clicks}
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-0 rounded-xl border-2 border-[#8b93e8] pointer-events-none"
            />
          )}
        </span>

        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: -6 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.2 }}
              className="absolute right-1 -top-2 px-2 py-1 rounded-lg bg-[#4ade80]/15 border border-[#4ade80]/25 text-[#4ade80] text-[11px] font-medium whitespace-nowrap"
            >
              Copied
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ left: pos.left, top: pos.top, scale: down ? 0.82 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="absolute z-20 pointer-events-none"
          style={{ x: "-4px", y: "-4px" }}
        >
          <CursorArrow color="#e879a0" />
          <span className="absolute left-5 top-5 px-1.5 py-0.5 rounded-md bg-[#e879a0] text-white text-[10px] font-medium leading-none whitespace-nowrap">
            rex
          </span>
        </motion.div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-light text-white/35">Paste it anywhere.</span>
        {[
          { icon: <InstagramIcon size={16} />, label: "Instagram bio" },
          { icon: <TikTokLogoIcon size={16} className="w-4 h-4 text-white/70" />, label: "TikTok bio" },
          { icon: <DiscordLogoIcon size={16} className="w-4 h-4" />, label: "Discord bio" },
        ].map((bio, i) => (
          <motion.div
            key={bio.label}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: EASE }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex items-center gap-2.5"
          >
            <span className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
              {bio.icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[12.5px] font-normal text-white/85 leading-tight">{bio.label}</span>
              <span className="block text-[11px] font-mono text-white/40 truncate">iuno.lol/saraansx</span>
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </motion.div>
        ))}
      </div>

      <p className="text-[12.5px] font-light text-white/40">One link for every bio.</p>
    </div>
  );
}

export default function LinksShowcase() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 38% at 50% 32%, rgba(91,108,245,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[11px] font-medium tracking-[0.32em] text-[#8b93e8] uppercase mb-5"
        >
          Dashboard
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6"
        >
          One dashboard{" "}
          <span className="bg-gradient-to-r from-[#8b93e8] to-[#cdd2ff] bg-clip-text text-transparent">
            for it all
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
          className="max-w-xl text-white/50 text-base md:text-lg font-light leading-relaxed"
        >
          Your links and your views in one place.
          Edit in seconds and watch everything update live.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="w-full max-w-5xl mt-16 grid lg:grid-cols-[1.25fr_1fr] gap-4 text-left pointer-events-none"
        >
          <ManagerCard />
          <ShareCard />
        </motion.div>

        <div className="w-full max-w-5xl mt-4 flex justify-center">
          <ViewsDemo />
        </div>
      </div>
    </section>
  );
}
