"use client";

import { useSteamUser } from "@/lib/hooks/useSteamUser";
import { steamAssetUrl } from "@/lib/steam-asset-url";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import { WidgetRedirectIcon } from "./WidgetIcons";

export default function SteamWidget({ widget }: { widget: WidgetItem }) {
  const cleanId = (widget.targetId || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
    .replace(/\/$/, "");

  const { data: steamData, loading } = useSteamUser(cleanId);

  const imageShape = widget.imageShape || "rounded";
  const showLevel = widget.steamShowLevel !== undefined ? widget.steamShowLevel : true;
  const showGames = widget.steamShowGames !== undefined ? widget.steamShowGames : true;
  const showMemberSince = widget.steamShowMemberSince !== undefined ? widget.steamShowMemberSince : true;
  const showAvatarFrame = widget.steamShowAvatarFrame !== undefined ? widget.steamShowAvatarFrame : true;
  const showAnimatedAvatar = widget.steamShowAnimatedAvatar !== undefined ? widget.steamShowAnimatedAvatar : true;
  const background = widget.steamBackground || "large";
  const showBackgroundImage = widget.steamShowBackgroundImage !== undefined ? widget.steamShowBackgroundImage : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (loading || !steamData) {
    return (
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div
            className={`w-[74px] h-[74px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const rawAvatarSrc = (showAnimatedAvatar && steamData.animated_avatar) || steamData.avatarfull;
  const avatarSrc = rawAvatarSrc ? steamAssetUrl(rawAvatarSrc) : null;

  const rawBgSrc =
    background === "large"
      ? steamData.profile_background || steamData.avatarfull
      : background === "small"
      ? steamData.mini_profile_background || steamData.profile_background || steamData.avatarfull
      : null;
  const bgImageSrc = rawBgSrc ? steamAssetUrl(rawBgSrc) : null;

  const rawBgWebm =
    background === "large"
      ? steamData.profile_background_webm
      : background === "small"
      ? steamData.mini_profile_background_webm || steamData.profile_background_webm
      : null;
  const bgWebmSrc = rawBgWebm ? steamAssetUrl(rawBgWebm) : null;

  const rawBgMp4 =
    background === "large"
      ? steamData.profile_background_mp4
      : background === "small"
      ? steamData.mini_profile_background_mp4 || steamData.profile_background_mp4
      : null;
  const bgMp4Src = rawBgMp4 ? steamAssetUrl(rawBgMp4) : null;

  const frameSrc = steamData.avatarframe ? steamAssetUrl(steamData.avatarframe) : null;

  // Blurred avatar backdrop — mutually exclusive with the Steam background assets.
  const rawAvatarBg = showBackgroundImage ? steamData.avatarfull : null;
  const avatarBgSrc = rawAvatarBg ? steamAssetUrl(rawAvatarBg) : null;

  return (
    <a
      href={steamData.profileurl || `https://steamcommunity.com/id/${encodeURIComponent(cleanId)}/`}
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

      {/* Background Layer (Video or Static Image) */}
      {background !== "none" && (bgWebmSrc || bgMp4Src || bgImageSrc) && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {bgWebmSrc || bgMp4Src ? (
            <video
              key={bgWebmSrc || bgMp4Src || "steam-bg-video"}
              autoPlay
              loop
              muted
              playsInline
              poster={bgImageSrc || undefined}
              className="w-full h-full object-cover opacity-85 scale-105"
              ref={(el) => {
                if (el && el.paused) {
                  el.play().catch(() => {});
                }
              }}
            >
              {bgWebmSrc && <source src={bgWebmSrc} type="video/webm" />}
              {bgMp4Src && <source src={bgMp4Src} type="video/mp4" />}
            </video>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={bgImageSrc!}
              alt=""
              className="w-full h-full object-cover opacity-85 scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25 backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* Background Image (blurred avatar) */}
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
        {/* Avatar with Optional Frame */}
        <div className="relative w-[74px] h-[74px] shrink-0 flex items-center justify-center">
          <div
            className={`relative w-full h-full overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          >
            {avatarSrc && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarSrc}
                alt={steamData.personaname}
                className="w-full h-full object-cover block"
              />
            )}
          </div>

          {/* Steam Avatar Frame */}
          {showAvatarFrame && frameSrc && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-visible">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frameSrc}
                alt=""
                className="w-[114%] h-[114%] max-w-none max-h-none object-contain"
              />
            </div>
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Persona Name */}
          <OverflowPingPong deps={[steamData, steamData?.personaname]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
              {steamData.personaname}
            </span>
          </OverflowPingPong>

          {/* Stats Row */}
          {steamData.is_private ? (
            <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight text-white/50">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white/50">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H6A3.75 3.75 0 002.25 13.5v6.75A3.75 3.75 0 006 24h12a3.75 3.75 0 003.75-3.75V13.5A3.75 3.75 0 0018 9.75h-.75v-3A5.25 5.25 0 0012 1.5zm3.25 8.25v-3a3.25 3.25 0 10-6.5 0v3h6.5zM12 14.25a1.5 1.5 0 00-.75 2.8v2.2a.75.75 0 001.5 0v-2.2a1.5 1.5 0 00-.75-2.8z" />
              </svg>
              <span>This profile is private</span>
            </div>
          ) : (showLevel || showGames || showMemberSince) && (
            <OverflowPingPong deps={[steamData, showLevel, showGames, showMemberSince]}>
              <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                {/* Level */}
                {showLevel && typeof steamData.level === "number" && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-white/40">Level</span>
                    <span className="text-white/85">{steamData.level}</span>
                  </div>
                )}

                {/* Games Count — or a lock when the library alone is hidden */}
                {showGames && (typeof steamData.game_count === "number" ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.65 4.74C19.82 5.37 21.6 7.21 21.92 9.87l.95 7.82a3.75 3.75 0 01-3.66 4.2c-1.46 0-2.8-.75-3.56-1.99l-1.35-2.2c-.32-.52-.89-.85-1.5-.85H11.2c-.61 0-1.18.33-1.5.85l-1.35 2.2a4.17 4.17 0 01-3.56 1.99 3.75 3.75 0 01-3.66-4.2l.95-7.82c.32-2.66 2.1-4.5 4.27-5.13 1.84-.53 3.82-.04 5.65.61.64.23 1.36.23 2 0 1.83-.65 3.81-1.14 5.65-.61zM7 9a1 1 0 011 1v1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h1v-1a1 1 0 011-1zm10 1a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm-2 2.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
                    </svg>
                    <span className="text-white/85">{steamData.game_count.toLocaleString()}</span>
                    <span className="text-white/40">Games</span>
                  </div>
                ) : steamData.library_private ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3H6A3.75 3.75 0 002.25 13.5v6.75A3.75 3.75 0 006 24h12a3.75 3.75 0 003.75-3.75V13.5A3.75 3.75 0 0018 9.75h-.75v-3A5.25 5.25 0 0012 1.5zm3.25 8.25v-3a3.25 3.25 0 10-6.5 0v3h6.5zM12 14.25a1.5 1.5 0 00-.75 2.8v2.2a.75.75 0 001.5 0v-2.2a1.5 1.5 0 00-.75-2.8z" />
                    </svg>
                    <span className="text-white/40">Library private</span>
                  </div>
                ) : null)}

                {/* Member Since */}
                {showMemberSince && steamData.member_since && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 shrink-0">
                      <path fillRule="evenodd" clipRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a3 3 0 00-3 3v13a3 3 0 003 3h16a3 3 0 003-3V7a3 3 0 00-3-3h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm15 7H3v10a1 1 0 001 1h16a1 1 0 001-1V9zm-14 3a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm5-4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm5-4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                    <span className="text-white/40">Since</span>
                    <span className="text-white/85">{steamData.member_since}</span>
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
