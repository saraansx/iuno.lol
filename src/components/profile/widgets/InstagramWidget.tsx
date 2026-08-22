"use client";

import { useInstagramUser } from "@/lib/hooks/useInstagramUser";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { formatInstagramNumber, cleanInstagramUsername } from "@/lib/instagram";
import {
  InstagramLogoIcon,
  InstagramVerifiedIcon,
  InstagramGridIcon,
  InstagramUsersIcon,
  InstagramUserPlusIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import OverflowPingPong from "./OverflowPingPong";

export default function InstagramWidget({ widget }: { widget: WidgetItem }) {
  const cleanUsername = cleanInstagramUsername(widget.targetId || "").toLowerCase();
  const { user, isLoading } = useInstagramUser(cleanUsername);

  const imageShape = widget.imageShape || "rounded";
  const showFollowers =
    widget.instagramShowFollowers !== undefined ? widget.instagramShowFollowers : true;
  const showFollowing =
    widget.instagramShowFollowing !== undefined ? widget.instagramShowFollowing : true;
  const showPosts =
    widget.instagramShowPosts !== undefined ? widget.instagramShowPosts : true;
  const showBackground =
    widget.instagramShowBackground !== undefined ? widget.instagramShowBackground : false;
  const showViewButton =
    widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (isLoading || !user) {
    return (
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div
            className={`w-[74px] h-[74px] shrink-0 bg-white/[0.05] ${
              imageShape === "square"
                ? "rounded-none"
                : imageShape === "circle"
                ? "rounded-full"
                : "rounded-2xl"
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

  const avatarSrc = user.profilePicUrl || null;

  const bgSrc = showBackground ? avatarSrc : null;

  return (
    <a
      href={`https://instagram.com/${encodeURIComponent(user.username)}`}
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
        <div className="relative shrink-0">
          <div
            className={`relative w-[74px] h-[74px] overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
              imageShape === "square"
                ? "rounded-none"
                : imageShape === "circle"
                ? "rounded-full"
                : "rounded-2xl"
            }`}
          >
            {avatarSrc && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarSrc}
                alt={user.fullName || user.username}
                className="w-full h-full object-cover block"
              />
            )}
          </div>
        </div>

        {/* User Info & Statistics */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden pr-6">
          {/* Header Row: Instagram Logo + Display Name + Verified Badge */}
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <OverflowPingPong deps={[user.username, user.fullName, user.isVerified]}>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Instagram Brand Logo */}
                <InstagramLogoIcon className="w-3.5 h-3.5 text-[#E4405F] shrink-0" />

                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {user.fullName || `@${user.username}`}
                </span>

                {/* Verified Badge */}
                {user.isVerified && (
                  <InstagramVerifiedIcon className="w-3.5 h-3.5 shrink-0" />
                )}
              </div>
            </OverflowPingPong>
          </div>

          {/* Subtitle / Statistics Row */}
          <div className="min-w-0 overflow-hidden">
            <OverflowPingPong
              deps={[
                user.followersCount,
                user.followingCount,
                user.postsCount,
                showFollowers,
                showFollowing,
                showPosts,
              ]}
            >
              <div className="flex items-center gap-2 text-[12.5px] font-normal leading-tight whitespace-nowrap shrink-0">
                {/* Followers */}
                {showFollowers && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <InstagramUsersIcon className="w-3.5 h-3.5 text-white/50 shrink-0" />
                    <span className="text-white/85">
                      {formatInstagramNumber(user.followersCount)}
                    </span>
                    <span className="text-white/40 text-[11.5px]">followers</span>
                  </div>
                )}

                {showFollowers && showFollowing && (
                  <span className="text-white/20">•</span>
                )}

                {/* Following */}
                {showFollowing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <InstagramUserPlusIcon className="w-3.5 h-3.5 text-white/50 shrink-0" />
                    <span className="text-white/85">
                      {formatInstagramNumber(user.followingCount)}
                    </span>
                    <span className="text-white/40 text-[11.5px]">following</span>
                  </div>
                )}

                {(showFollowers || showFollowing) && showPosts && (
                  <span className="text-white/20">•</span>
                )}

                {/* Posts */}
                {showPosts && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <InstagramGridIcon className="w-3.5 h-3.5 text-white/50 shrink-0" />
                    <span className="text-white/85">
                      {formatInstagramNumber(user.postsCount)}
                    </span>
                    <span className="text-white/40 text-[11.5px]">
                      {user.postsCount === 1 ? "post" : "posts"}
                    </span>
                  </div>
                )}

                {!showFollowers && !showFollowing && !showPosts && (
                  <span className="text-white/40 text-[12px]">Instagram Profile</span>
                )}
              </div>
            </OverflowPingPong>
          </div>
        </div>
      </div>
    </a>
  );
}
