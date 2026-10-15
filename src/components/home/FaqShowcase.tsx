"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const FAQS = [
  {
    q: "Is iuno.lol really free?",
    a: "Yes. The free plan covers your username, page, background, music, widgets and effects, forever. Premium is a one time payment for people who want more.",
  },
  {
    q: "What does Premium unlock?",
    a: "More of everything. 5 backgrounds, 10 tracks, 10 widgets, every effect, aliases, tab customization and the Premium badge. Pay once, keep it for life.",
  },
  {
    q: "How do widgets stay updated?",
    a: "Connect an account once and the widget pulls fresh data on its own. Discord presence, Spotify, GitHub, YouTube, Pinterest and more.",
  },
  {
    q: "Can I upload my own music?",
    a: "Yes. Upload MP3 or M4A files and paste synced lyrics to get the karaoke view on your profile.",
  },
  {
    q: "Do profiles track views?",
    a: "Every profile counts views and likes. The leaderboard ranks the top 100 creators so good pages get seen.",
  },
];

function FaqRow({
  q,
  a,
  open,
  onToggle,
  index,
  last,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
  index: number;
  last: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: EASE }}
      className={last ? "" : "border-b border-white/[0.07]"}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-6 py-5 text-left cursor-pointer group"
      >
        <span
          className={`text-[15px] font-normal tracking-tight transition-colors ${
            open ? "text-white" : "text-white/75 group-hover:text-white"
          }`}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
            open ? "border-[#5b6cf5]/40 bg-[#5b6cf5]/15 text-white" : "border-white/10 bg-white/[0.03] text-white/50 group-hover:text-white"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-6 sm:pr-10 text-[13.5px] font-light leading-relaxed text-white/45">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqShowcase() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 35% at 50% 30%, rgba(91,108,245,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[11px] font-medium tracking-[0.32em] text-[#8b93e8] uppercase mb-5"
        >
          FAQ
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6 text-center"
        >
          Questions?{" "}
          <span className="bg-gradient-to-r from-[#8b93e8] to-[#cdd2ff] bg-clip-text text-transparent">
            Answers
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
          className="max-w-xl text-white/50 text-base md:text-lg font-light leading-relaxed text-center"
        >
          Everything people usually ask before claiming a link.
        </motion.p>

        <div className="w-full max-w-2xl mt-12 rounded-[20px] border border-white/5 bg-[#0c0c0c] px-4 sm:px-6 shadow-sm">
          {FAQS.map((f, i) => (
            <FaqRow
              key={f.q}
              q={f.q}
              a={f.a}
              index={i}
              last={i === FAQS.length - 1}
              open={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
