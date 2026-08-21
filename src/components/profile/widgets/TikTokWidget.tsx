"use client";

import { useTikTokUser } from "@/lib/hooks/useTikTokUser";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { cleanTikTokUsername, formatTikTokNumber } from "@/lib/tiktok";
import OverflowPingPong from "./OverflowPingPong";
import {
  TikTokLogoIcon,
  TikTokFollowersIcon,
  TikTokFollowingIcon,
  TikTokHeartIcon,
  TikTokVideoIcon,
  TikTokVerifiedIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";

export default function TikTokWidget({ widget }: { widget: WidgetItem }) {
  const cleanUsername = cleanTikTokUsername(widget.targetId);
  const { data: tiktokData, loading } = useTikTokUser(cleanUsername);

  const imageShape = widget.imageShape || "rounded";
  const showFollowers = widget.tiktokShowFollowers !== undefined ? widget.tiktokShowFollowers : true;
  const showFollowing = widget.tiktokShowFollowing !== undefined ? widget.tiktokShowFollowing : true;
  const showLikes = widget.tiktokShowLikes !== undefined ? widget.tiktokShowLikes : true;
  const showVideos = widget.tiktokShowVideos !== undefined ? widget.tiktokShowVideos : true;
  const showVerifiedBadge = widget.tiktokShowVerifiedBadge !== undefined ? widget.tiktokShowVerifiedBadge : true;
  const showBackground = widget.tiktokShowBackground !== undefined ? widget.tiktokShowBackground : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const avatarUrl = tiktokData?.avatarUrl
    ? `/api/widgets/tiktok/image?url=${encodeURIComponent(tiktokData.avatarUrl)}`
    : "";

  const bgSrc = showBackground ? avatarUrl : null;

  if (loading || !tiktokData) {
    return (
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div
            className={`w-[74px] h-[74px] shrink-0 bg-white/[0.05] flex items-center justify-center ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          >
            <TikTokLogoIcon size={30} className="text-white/20" />
          </div>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const profileUrl = `https://www.tiktok.com/@${encodeURIComponent(cleanUsername)}`;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {/* Top-Right Redirect Badge */}
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {/* Blurred Avatar Backdrop */}
      {bgSrc && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgSrc}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
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
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover block"
            />
          ) : (
            <TikTokLogoIcon size={32} className="text-white/30" />
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Title row with ping-pong overflow scroll */}
          <OverflowPingPong deps={[tiktokData, tiktokData?.nickname, tiktokData?.username, showVerifiedBadge]}>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                {tiktokData.nickname || cleanUsername}
              </span>
              {showVerifiedBadge && tiktokData.isVerified && (
                <TikTokVerifiedIcon size={15} className="shrink-0" />
              )}
              {tiktokData.nickname && (
                <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                  @{tiktokData.username || cleanUsername}
                </span>
              )}
            </div>
          </OverflowPingPong>

          {/* Stats row with ping-pong overflow scroll */}
          <OverflowPingPong
            deps={[
              tiktokData,
              showFollowers,
              showFollowing,
              showLikes,
              showVideos,
            ]}
          >
            <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
              {showFollowers && (
                <div className="flex items-center gap-1 shrink-0">
                  <TikTokFollowersIcon size={13} className="text-white/70" />
                  <span className="text-white/85">
                    {formatTikTokNumber(tiktokData.followerCount)}
                  </span>
                  <span className="text-white/40">followers</span>
                </div>
              )}
              {showFollowing && (
                <div className="flex items-center gap-1 shrink-0">
                  <TikTokFollowingIcon size={13} className="text-white/70" />
                  <span className="text-white/85">
                    {formatTikTokNumber(tiktokData.followingCount)}
                  </span>
                  <span className="text-white/40">following</span>
                </div>
              )}
              {showLikes && (
                <div className="flex items-center gap-1 shrink-0">
                  <TikTokHeartIcon size={13} className="text-[#FE2C55]" />
                  <span className="text-white/85">
                    {formatTikTokNumber(tiktokData.heartCount)}
                  </span>
                  <span className="text-white/40">likes</span>
                </div>
              )}
              {showVideos && (
                <div className="flex items-center gap-1 shrink-0">
                  <TikTokVideoIcon size={13} className="text-white/70" />
                  <span className="text-white/85">
                    {formatTikTokNumber(tiktokData.videoCount)}
                  </span>
                  <span className="text-white/40">videos</span>
                </div>
              )}
            </div>
          </OverflowPingPong>
        </div>
      </div>
    </a>
  );
}
