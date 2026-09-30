"use client";

import { useTwitchChannel } from "@/lib/hooks/useTwitchChannel";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { formatNumber } from "@/lib/twitch";
import OverflowPingPong from "./OverflowPingPong";
import {
  TwitchLogoIcon,
  TwitchPartnerBadgeIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function TwitchWidget({ widget }: { widget: WidgetItem }) {
  const cleanLogin = (widget.targetId || "").trim();
  const { channel, isLoading } = useTwitchChannel(cleanLogin, {
    refetchInterval: 60000,
  });

  const imageShape = widget.imageShape || "rounded";
  const showLiveStatus =
    widget.twitchShowLiveStatus !== undefined ? widget.twitchShowLiveStatus : true;
  const showFollowers =
    widget.twitchShowFollowers !== undefined ? widget.twitchShowFollowers : true;
  const showPartnerBadge =
    widget.twitchShowPartnerBadge !== undefined ? widget.twitchShowPartnerBadge : true;
  const showBackground =
    widget.twitchShowBackground !== undefined ? widget.twitchShowBackground : false;
  const showViewButton =
    widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (isLoading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!channel) {
    return <WidgetUnavailable imageShape={imageShape} label="Twitch channel" />;
  }

  const avatarSrc = channel.profileImageUrl
    ? `/api/widgets/twitch/image?url=${encodeURIComponent(channel.profileImageUrl)}`
    : null;

  const bgSrc = showBackground ? avatarSrc : null;
  const isCurrentlyLive = channel.isLive && showLiveStatus;

  return (
    <a
      href={`https://twitch.tv/${encodeURIComponent(channel.login)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {bgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy"
            src={bgSrc}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        <div className="relative shrink-0">
          <div
            className={`relative w-[74px] h-[74px] overflow-hidden bg-[#181818] border ${
              isCurrentlyLive ? "border-[#eb0400]" : "border-white/10"
            } shadow-sm flex items-center justify-center ${
              imageShape === "square"
                ? "rounded-none"
                : imageShape === "circle"
                ? "rounded-full"
                : "rounded-2xl"
            }`}
          >
            {avatarSrc && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img loading="lazy"
                src={avatarSrc}
                alt={channel.displayName}
                className="w-full h-full object-cover block"
              />
            )}
          </div>

          {isCurrentlyLive && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-[#eb0400] text-white text-[9px] font-bold uppercase rounded-[4px] tracking-wider shadow-sm z-20">
              LIVE
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <OverflowPingPong deps={[channel, channel.displayName, isCurrentlyLive]}>
              <div className="flex items-center gap-1.5 shrink-0">
                <TwitchLogoIcon size={14} className="w-3.5 h-3.5 shrink-0" />

                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {channel.displayName}
                </span>

                {showPartnerBadge && channel.isPartner && (
                  <TwitchPartnerBadgeIcon size={14} className="w-3.5 h-3.5 shrink-0" />
                )}

                {isCurrentlyLive && channel.viewersCount !== null && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 shrink-0 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-400 font-medium">
                      {formatNumber(channel.viewersCount)}
                    </span>
                  </div>
                )}
              </div>
            </OverflowPingPong>
          </div>

          <div className="min-w-0 overflow-hidden">
            {isCurrentlyLive ? (
              <OverflowPingPong
                deps={[channel.streamTitle, channel.gameName, isCurrentlyLive]}
              >
                <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                  {channel.gameName && (
                    <span className="text-white/85 shrink-0">
                      {channel.gameName}
                    </span>
                  )}
                  {channel.gameName && channel.streamTitle && (
                    <span className="text-white/35">•</span>
                  )}
                  {channel.streamTitle && (
                    <span className="text-[12px] text-white/50 shrink-0">
                      {channel.streamTitle}
                    </span>
                  )}
                </div>
              </OverflowPingPong>
            ) : (
              <OverflowPingPong deps={[channel.followersCount, showFollowers]}>
                <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                  {showFollowers && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-white/85">
                        {formatNumber(channel.followersCount)}
                      </span>
                      <span className="text-white/40">
                        {channel.followersCount === 1 ? "follower" : "followers"}
                      </span>
                    </div>
                  )}
                  {!showFollowers && (
                    <span className="text-white/40">Twitch Channel</span>
                  )}
                </div>
              </OverflowPingPong>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
