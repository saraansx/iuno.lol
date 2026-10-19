"use client";

import { useInstagramUser } from "@/lib/hooks/useInstagramUser";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { cleanInstagramUsername, formatInstagramNumber } from "@/lib/instagram";
import OverflowPingPong from "./OverflowPingPong";
import PrivateAccountNote from "./PrivateAccountNote";
import {
  InstagramFollowersIcon,
  InstagramFollowingIcon,
  InstagramLogoIcon,
  InstagramPostIcon,
  InstagramVerifiedIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

export default function InstagramWidget({ widget }: { widget: WidgetItem }) {
  const cleanUsername = cleanInstagramUsername(widget.targetId);
  const { data: instagramData, loading } = useInstagramUser(cleanUsername);

  const imageShape = widget.imageShape || "rounded";
  const showFollowers =
    widget.instagramShowFollowers !== undefined ? widget.instagramShowFollowers : true;
  const showFollowing =
    widget.instagramShowFollowing !== undefined ? widget.instagramShowFollowing : true;
  const showPosts = widget.instagramShowPosts !== undefined ? widget.instagramShowPosts : true;
  const showVerifiedBadge =
    widget.instagramShowVerifiedBadge !== undefined ? widget.instagramShowVerifiedBadge : true;
  const showBackground =
    widget.instagramShowBackground !== undefined ? widget.instagramShowBackground : false;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const avatarUrl = instagramData?.avatarUrl
    ? `/api/widgets/instagram/image?url=${encodeURIComponent(instagramData.avatarUrl)}`
    : "";

  const bgSrc = showBackground ? avatarUrl : null;

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!instagramData) {
    return (
      <WidgetUnavailable
        imageShape={imageShape}
        label="Instagram account"
        description="This account may be private or unavailable"
      />
    );
  }

  const profileUrl = `https://www.instagram.com/${encodeURIComponent(cleanUsername)}/`;
  const displayName = instagramData.fullName || instagramData.username || cleanUsername;

  return (
    <a
      href={profileUrl}
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
            imageShape === "square"
              ? "rounded-none"
              : imageShape === "circle"
                ? "rounded-full"
                : "rounded-2xl"
          }`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" src={avatarUrl} alt="" className="w-full h-full object-cover block" />
          ) : (
            <InstagramLogoIcon size={32} className="text-white/30" />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <OverflowPingPong
            deps={[instagramData, displayName, instagramData.username, showVerifiedBadge]}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                {displayName}
              </span>
              {showVerifiedBadge && instagramData.isVerified && (
                <InstagramVerifiedIcon size={15} className="shrink-0" />
              )}
              {instagramData.fullName && (
                <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-0.5">
                  @{instagramData.username || cleanUsername}
                </span>
              )}
            </div>
          </OverflowPingPong>

          <OverflowPingPong deps={[instagramData, showFollowers, showFollowing, showPosts]}>
            {instagramData.isPrivate ? (
              <PrivateAccountNote />
            ) : (
              <div className="flex items-center gap-3 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                {showFollowers && (
                  <div className="flex items-center gap-1 shrink-0">
                    <InstagramFollowersIcon size={13} className="text-white/70" />
                    <span className="text-white/85">
                      {formatInstagramNumber(instagramData.followerCount)}
                    </span>
                    <span className="text-white/40">followers</span>
                  </div>
                )}
                {showFollowing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <InstagramFollowingIcon size={13} className="text-white/70" />
                    <span className="text-white/85">
                      {formatInstagramNumber(instagramData.followingCount)}
                    </span>
                    <span className="text-white/40">following</span>
                  </div>
                )}
                {showPosts && (
                  <div className="flex items-center gap-1 shrink-0">
                    <InstagramPostIcon size={13} className="text-white/70" />
                    <span className="text-white/85">
                      {formatInstagramNumber(instagramData.postCount)}
                    </span>
                    <span className="text-white/40">posts</span>
                  </div>
                )}
              </div>
            )}
          </OverflowPingPong>
        </div>
      </div>
    </a>
  );
}
