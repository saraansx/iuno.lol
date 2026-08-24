"use client";

import { useGenshinPlayer } from "@/lib/hooks/useGenshinPlayer";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import { GenshinLogoIcon, WidgetRedirectIcon } from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function GenshinWidget({ widget }: { widget: WidgetItem }) {
  const cleanUid = (widget.targetId || "").trim();
  const { data: genshinData, loading } = useGenshinPlayer(cleanUid);

  const imageShape = widget.imageShape || "rounded";
  const showAr = widget.genshinShowAr !== undefined ? widget.genshinShowAr : true;
  const showWorldLevel = widget.genshinShowWorldLevel !== undefined ? widget.genshinShowWorldLevel : true;
  const showAchievements = widget.genshinShowAchievements !== undefined ? widget.genshinShowAchievements : true;
  const showRegion = widget.genshinShowRegion !== undefined ? widget.genshinShowRegion : true;
  const showBackground = widget.genshinShowBackground !== undefined ? widget.genshinShowBackground : true;
  const showBackgroundImage = widget.genshinShowBackgroundImage !== undefined ? widget.genshinShowBackgroundImage : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!genshinData) {
    return <WidgetUnavailable imageShape={imageShape} label="Genshin profile" />;
  }

  const avatarSrc = genshinData.avatar_url
    ? `/api/widgets/genshin/image?url=${encodeURIComponent(genshinData.avatar_url)}`
    : null;

  const namecardBgSrc =
    showBackground && (genshinData.namecard_bg_url || genshinData.namecard_url)
      ? `/api/widgets/genshin/image?url=${encodeURIComponent((genshinData.namecard_bg_url || genshinData.namecard_url)!)}`
      : null;

  // Blurred character avatar backdrop — mutually exclusive with the namecard artwork.
  const avatarBgSrc = showBackgroundImage ? avatarSrc : null;

  return (
    <a
      href={`https://enka.network/u/${encodeURIComponent(cleanUid)}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {/* Top-Right Redirect Badge */}
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {/* Namecard Background Layer */}
      {namecardBgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={namecardBgSrc}
            alt=""
            className="w-full h-full object-cover opacity-85 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35 backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* Background Image (blurred character avatar) */}
      {avatarBgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarBgSrc}
            alt=""
            className="w-full h-full object-cover opacity-45 filter blur-[10px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        {/* Avatar */}
        <div
          className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          {avatarSrc && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarSrc}
              alt={genshinData.nickname}
              className="w-full h-full object-cover block"
            />
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Nickname & Region Header */}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <OverflowPingPong deps={[genshinData, genshinData.nickname]}>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Genshin Impact Primogem Logo */}
                <GenshinLogoIcon size={14} className="w-3.5 h-3.5 text-[#609fda] shrink-0" />
                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {genshinData.nickname}
                </span>
              </div>
            </OverflowPingPong>

            {showRegion && genshinData.region && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 shrink-0 font-medium">
                {genshinData.region}
              </span>
            )}
          </div>

          {/* Stats Row */}
          {(showAr || showWorldLevel || showAchievements) && (
            <OverflowPingPong deps={[genshinData, showAr, showWorldLevel, showAchievements]}>
              <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                {/* Adventure Rank */}
                {showAr && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-white/40">AR</span>
                    <span className="text-white/85">{genshinData.level}</span>
                  </div>
                )}

                {/* World Level */}
                {showWorldLevel && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-white/40">WL</span>
                    <span className="text-white/85">{genshinData.world_level}</span>
                  </div>
                )}

                {/* Achievements */}
                {showAchievements && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5.166 2.25c-.414 0-.75.336-.75.75v1.5a3 3 0 00-3 3v1.5a4.5 4.5 0 004.14 4.484A6.745 6.745 0 009 16.592V18H7.5a.75.75 0 000 1.5h9a.75.75 0 000-1.5H15v-1.408a6.745 6.745 0 003.444-3.108A4.5 4.5 0 0022.584 9V7.5a3 3 0 00-3-3V3a.75.75 0 00-.75-.75h-13.668zM3.666 7.5a1.5 1.5 0 011.5-1.5v4.354a3.003 3.003 0 01-1.5-2.854V7.5zm16.668 0v-.5a1.5 1.5 0 00-1.5-1.5v4.354c.915-.224 1.5-1.026 1.5-1.854z" />
                    </svg>
                    <span className="text-white/85">{genshinData.achievements.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </OverflowPingPong>
          )}
        </div>
      </div>
    </a>
  );
}
