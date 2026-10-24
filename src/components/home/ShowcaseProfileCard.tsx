"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import ProfileBadges, { type CustomBadge } from "@/components/profile/layouts/ProfileBadges";

// Static copies of real profile cards for the homepage hero. No DB or API calls.
const FONT = "var(--font-comfortaa)";
const MUTED = "#878a93";
const ROTATE_MS = 4000;

const Emoji = ({ src, alt }: { src: string; alt: string }) => (
  <Image
    src={src}
    alt={alt}
    width={18}
    height={18}
    unoptimized
    draggable={false}
    className="inline-block w-[18px] h-[18px] align-[-4px] mr-1 select-none"
  />
);

type Showcase = {
  uid: number;
  name: string;
  dir: string; // folder under /public/showcase holding avatar.png + the banner
  banner: string; // filename inside dir; .mp4 renders as a muted looping video
  badges: string[];
  customBadges?: CustomBadge[];
  location: string;
  job?: string;
  joined: string;
  bio: ReactNode;
};

const PROFILES: Showcase[] = [
  {
    uid: 1,
    name: "rio .",
    dir: "rio",
    banner: "banner.png",
    badges: ["owner", "developer", "early", "premium", "image-host", "verified", "guild-tag"],
    location: "cat :3",
    job: "idk .",
    joined: "Oct 15, '26",
    bio: (
      <>
        <p>
          <Emoji src="/showcase/rio/emoji-code.gif" alt="code" />
          <em>
            Writing <u>code</u>{" nobody understand's"}
          </em>
        </p>
        <p>
          <Emoji src="/showcase/rio/emoji-coffee.gif" alt="coffee" />
          Coffee ohh yeahh
        </p>
        <p className="mt-5 pl-[45%]">
          <Emoji src="/showcase/rio/emoji-iuno.png" alt="iuno" />
          <em>
            {"discord.gg/"}
            <u>iuno</u>
          </em>
        </p>
      </>
    ),
  },
  {
    uid: 2,
    name: "rex.",
    dir: "rex",
    banner: "banner.mp4",
    badges: ["custom-aa196642e9fd", "owner", "developer"],
    customBadges: [{ id: "custom-aa196642e9fd", name: "< 3", iconUrl: "/showcase/rex/badge-heart.gif" }],
    location: "cat :3",
    joined: "Oct 15, '26",
    bio: (
      <p>
        <strong>
          Hi. I own iuno.lol <Emoji src="/showcase/rex/emoji-iuno.png" alt="iuno" />
        </strong>
      </p>
    ),
  },
];

function Card({ p }: { p: Showcase }) {
  return (
    <div
      className="relative w-full max-w-[700px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/10 backdrop-blur-[5px] shadow-[0_40px_120px_rgba(0,0,0,0.7)] select-none"
      style={{ fontFamily: FONT }}
    >
      <div
        className="relative h-[160px] w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.6) 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 45%, rgba(0,0,0,0.6) 75%, transparent 100%)",
        }}
      >
        {p.banner.endsWith(".mp4") ? (
          <video
            src={`/showcase/${p.dir}/${p.banner}`}
            autoPlay
            muted
            loop
            playsInline
            aria-label={`${p.name}'s banner`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={`/showcase/${p.dir}/${p.banner}`}
            alt={`${p.name}'s banner`}
            fill
            sizes="700px"
            priority
            draggable={false}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="flex items-start gap-5 px-6 mt-2.5">
        <div className="relative w-[88px] h-[88px] shrink-0 overflow-hidden rounded-full border border-white/5 bg-[#0a0a0a] shadow-xl">
          <Image
            src={`/showcase/${p.dir}/avatar.png`}
            alt={`${p.name}'s avatar`}
            fill
            sizes="88px"
            priority
            draggable={false}
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-start text-left -mt-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[20px] text-white tracking-tight mb-2 truncate">{p.name}</h3>
            <div className="mb-2">
              <ProfileBadges
                badgeIds={p.badges}
                customBadges={p.customBadges}
                glowEnabled
                glowStrength={30}
                badgeSize={19}
                monoEnabled
                monoColor="#393636"
                containerStyle="none"
                badgeSpacing={4}
                shimmerEnabled
              />
            </div>
          </div>

          <div className="mt-1 flex items-center gap-3 text-[12px]" style={{ color: MUTED }}>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {p.location}
            </span>
            {p.job && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80" aria-hidden>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {p.job}
              </span>
            )}
          </div>

          <div className="mt-1.5 w-full text-[13px] leading-relaxed text-white">{p.bio}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 pt-6 pb-4 text-[12px]" style={{ color: MUTED }}>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80" aria-hidden>
            <path d="M4 9h16" />
            <path d="M4 15h16" />
            <path d="M10 3 8 21" />
            <path d="M16 3l-2 18" />
          </svg>
          {p.uid}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" className="shrink-0 opacity-80" aria-hidden>
            <path d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4zM32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V180a4 4 0 0 0-4-4H36a4 4 0 0 0-4 4z" />
          </svg>
          {p.joined}
        </span>
      </div>
    </div>
  );
}

// All cards share one grid cell and crossfade, so there's no layout jump and every image is preloaded.
// Hover/focus pauses the loop (WCAG 2.2.2).
export default function ShowcaseProfileCard() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % PROFILES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="grid w-full max-w-[700px] place-items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {PROFILES.map((p, i) => (
        <div
          key={p.uid}
          aria-hidden={i !== active}
          className={`col-start-1 row-start-1 w-full flex justify-center transition-opacity duration-700 motion-reduce:transition-none ${
            i === active ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Card p={p} />
        </div>
      ))}
    </div>
  );
}
