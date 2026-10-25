"use client";

import { type SoundcloudTrackData, formatSoundcloudDuration, formatSoundcloudNumber } from "@/lib/soundcloud";
import OverflowPingPong from "./OverflowPingPong";
import {
  SoundcloudDurationIcon,
  SoundcloudLikeIcon,
  SoundcloudLogoIcon,
  SoundcloudPlayIcon,
  SoundcloudVerifiedIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";

export interface SoundcloudTrackCardOptions {
  imageShape: "circle" | "rounded" | "square";
  showPlays: boolean;
  showLikes: boolean;
  showDuration: boolean;
  showVerifiedBadge: boolean;
  showBackground: boolean;
  showViewButton: boolean;
}

function proxied(url: string): string {
  return url ? `/api/widgets/soundcloud/image?url=${encodeURIComponent(url)}` : "";
}

export default function SoundcloudTrackCard({
  track,
  options,
  interactive = true,
}: {
  track: SoundcloudTrackData;
  options: SoundcloudTrackCardOptions;
  interactive?: boolean;
}) {
  const { imageShape, showPlays, showLikes, showDuration, showVerifiedBadge, showBackground, showViewButton } =
    options;
  const artworkSrc = proxied(track.artworkUrl);
  const bgSrc = showBackground ? artworkSrc : "";
  const hasStats = showPlays || showLikes || showDuration;

  const content = (
    <>
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {bgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            loading="lazy"
            src={bgSrc}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        <div
          className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          {artworkSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" src={artworkSrc} alt="" className="w-full h-full object-cover block" />
          ) : (
            <SoundcloudLogoIcon size={32} className="text-white/30" />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <OverflowPingPong deps={[track.title]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0 whitespace-nowrap">
              {track.title}
            </span>
          </OverflowPingPong>

          <OverflowPingPong deps={[track.artistName, showVerifiedBadge]}>
            <div className="flex items-center gap-1 shrink-0 text-[12.5px] text-white/50 whitespace-nowrap">
              <span>{track.artistName || track.artistHandle}</span>
              {showVerifiedBadge && track.artistVerified && (
                <SoundcloudVerifiedIcon size={13} className="w-[13px] h-[13px] shrink-0" />
              )}
            </div>
          </OverflowPingPong>

          {hasStats && (
            <OverflowPingPong deps={[track.plays, track.likes, showPlays, showLikes, showDuration]}>
              <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                {showPlays && (
                  <div className="flex items-center gap-1 shrink-0">
                    <SoundcloudPlayIcon size={12} className="w-3 h-3 text-white/70" />
                    <span className="text-white/85">{formatSoundcloudNumber(track.plays)}</span>
                  </div>
                )}
                {showLikes && (
                  <div className="flex items-center gap-1 shrink-0">
                    <SoundcloudLikeIcon size={12} className="w-3 h-3 text-white/70" />
                    <span className="text-white/85">{formatSoundcloudNumber(track.likes)}</span>
                  </div>
                )}
                {showDuration && (
                  <div className="flex items-center gap-1 shrink-0">
                    <SoundcloudDurationIcon size={12} className="w-3 h-3 text-white/70" />
                    <span className="text-white/85">{formatSoundcloudDuration(track.durationMs)}</span>
                  </div>
                )}
              </div>
            </OverflowPingPong>
          )}
        </div>
      </div>
    </>
  );

  const baseClass =
    "group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden flex items-center justify-between relative box-border";

  if (!interactive) {
    return <div className={baseClass}>{content}</div>;
  }

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${track.title} by ${track.artistName || track.artistHandle} on SoundCloud`}
      className={`${baseClass} transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 cursor-pointer`}
    >
      {content}
    </a>
  );
}
