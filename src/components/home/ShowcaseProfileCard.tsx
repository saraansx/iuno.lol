"use client";

import Image from "next/image";
import ProfileBadges from "@/components/profile/layouts/ProfileBadges";

// Static copy of rio's (UID 1) profile card for the homepage hero. No DB or API calls.
const FONT = "var(--font-comfortaa)";
const MUTED = "#878a93";
const BADGES = ["owner", "developer", "early", "premium", "image-host", "verified", "guild-tag"];

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

export default function ShowcaseProfileCard() {
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
        <Image
          src="/showcase/rio/banner.png"
          alt="rio's banner"
          fill
          sizes="700px"
          priority
          draggable={false}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="flex items-start gap-5 px-6 mt-2.5">
        <div className="relative w-[88px] h-[88px] shrink-0 overflow-hidden rounded-full border border-white/5 bg-[#0a0a0a] shadow-xl">
          <Image
            src="/showcase/rio/avatar.png"
            alt="rio's avatar"
            fill
            sizes="88px"
            priority
            draggable={false}
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col items-start text-left -mt-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[20px] text-white tracking-tight mb-2 truncate">rio .</h3>
            <div className="mb-2">
              <ProfileBadges
                badgeIds={BADGES}
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
              cat :3
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80" aria-hidden>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              idk .
            </span>
          </div>

          <div className="mt-1.5 w-full text-[13px] leading-relaxed text-white">
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
          </div>
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
          1
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" className="shrink-0 opacity-80" aria-hidden>
            <path d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4zM32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V180a4 4 0 0 0-4-4H36a4 4 0 0 0-4 4z" />
          </svg>
          Oct 15, &apos;26
        </span>
      </div>
    </div>
  );
}
