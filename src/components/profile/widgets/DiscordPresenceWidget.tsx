"use client";

import { useState } from "react";
import Image from "next/image";
import { useDiscordPresence } from "@/lib/hooks/useDiscordPresence";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";

function formatLastSeen(timestamp?: number | null) {
  if (!timestamp) return "last seen recently";
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return "last seen just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `last seen ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `last seen ${days}d ago`;
}

function getCleanBadgeName(badge: { id: string; description?: string }): string {
  const desc = badge.description?.trim();
  if (desc) return desc;

  const id = badge.id.toLowerCase();
  if (id.includes("premium") || id.includes("nitro")) return "Discord Nitro";
  if (id.includes("orb")) return "Orb";
  if (id.includes("guild_booster") || id.includes("boost")) return "Server Booster";
  if (id.includes("staff")) return "Discord Staff";
  if (id.includes("partner")) return "Partnered Server Owner";
  if (id.includes("hypesquad_house_1") || id.includes("bravery")) return "HypeSquad Bravery";
  if (id.includes("hypesquad_house_2") || id.includes("brilliance")) return "HypeSquad Brilliance";
  if (id.includes("hypesquad_house_3") || id.includes("balance")) return "HypeSquad Balance";
  if (id.includes("hypesquad_events") || id.includes("hypesquad")) return "HypeSquad Events";
  if (id.includes("bug_hunter_level_2")) return "Discord Bug Hunter (Gold)";
  if (id.includes("bug_hunter_level_1") || id.includes("bug_hunter")) return "Discord Bug Hunter";
  if (id.includes("verified_developer") || id.includes("bot_developer")) return "Early Verified Bot Developer";
  if (id.includes("early_supporter")) return "Early Supporter";
  if (id.includes("legacy_username")) return "Legacy Username";
  return "Discord Badge";
}

export default function DiscordPresenceWidget({ widget }: { widget: WidgetItem }) {
  const { data: discordData, loading } = useDiscordPresence(widget.targetId);

  const showBackgroundOverlay = widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : true;
  const showActivity = widget.showActivity !== undefined ? widget.showActivity : true;
  const showActivityImage = widget.showActivityImage !== undefined ? widget.showActivityImage : true;
  const activityImageShape = widget.activityImageShape || "rounded";
  const imageShape = widget.imageShape || "circle";
  const showAvatarDecoration = widget.showAvatarDecoration !== undefined ? widget.showAvatarDecoration : true;
  const showGuildTag = widget.showGuildTag !== undefined ? widget.showGuildTag : true;
  const showBadges = widget.showBadges !== undefined ? widget.showBadges : true;
  const showLastSeen = widget.showLastSeen !== undefined ? widget.showLastSeen : true;
  const fallbackText = widget.fallbackText !== undefined ? widget.fallbackText : "Currently doing nothing";

  const [hoveredBadge, setHoveredBadge] = useState<{ name: string; x: number; y: number } | null>(null);

  if (loading || !discordData) {
    return (
      <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-5 py-4 shadow-md flex items-center justify-between gap-3.5 box-border">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Avatar Skeleton */}
          <div
            className={`w-[62px] h-[62px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          {/* User & Status Skeleton */}
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const badges = (discordData?.user?.profile_badges || [])
    .filter((b: { icon?: string }) => Boolean(b.icon))
    .map((b: { id: string; icon?: string; description?: string }) => ({
      id: b.id,
      name: getCleanBadgeName(b),
      icon: `https://cdn.discordapp.com/badge-icons/${b.icon}.png`,
    }));

  const orderedBadges =
    widget.badgeOrder && widget.badgeOrder.length > 0
      ? [...badges].sort((a, b) => {
          const aIndex = widget.badgeOrder!.indexOf(a.id);
          const bIndex = widget.badgeOrder!.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        })
      : badges;

  const visibleBadges = orderedBadges.filter(
    (badge) => !widget.hiddenBadges || !widget.hiddenBadges.includes(badge.id)
  );

  const avatarUrl = discordData?.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordData.user.id}/${discordData.user.avatar}.${
        discordData.user.avatar.startsWith("a_") ? "gif" : "png"
      }?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(widget.targetId && /^\d+$/.test(widget.targetId) ? widget.targetId : "0") % BigInt(5))}.png`;

  return (
    <>
      {hoveredBadge && (
        <div
          className="fixed pointer-events-none z-[99999] -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${hoveredBadge.x}px`,
            top: `${hoveredBadge.y - 6}px`,
          }}
        >
          <div
            className="bg-[#0f0f12]/80 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono text-white shadow-xl"
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "normal",
            }}
          >
            {hoveredBadge.name}
          </div>
        </div>
      )}

      <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 py-3.5 shadow-md flex items-center justify-between gap-3 transition-all duration-200 hover:border-white/20 box-border relative overflow-hidden">
        {/* Background Avatar Ambient Overlay */}
        {showBackgroundOverlay && avatarUrl && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover opacity-35 filter blur-[14px] scale-125"
            />
            <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[2px]" />
          </div>
        )}

        <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
        {/* Avatar */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div
            className={`relative w-[62px] h-[62px] overflow-hidden bg-[#181818] border border-white/10 ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          >
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="62px"
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Status Indicator */}
          <div className="absolute bottom-0 right-0 z-20 w-4.5 h-4.5 rounded-full bg-[#101010] flex items-center justify-center">
            {discordData?.status === "dnd" ? (
              <span className="w-3.5 h-3.5 rounded-full bg-[#f23f43] flex items-center justify-center">
                <span className="w-2 h-0.5 bg-[#101010] rounded-full" />
              </span>
            ) : discordData?.status === "idle" ? (
              <span className="relative w-3.5 h-3.5 rounded-full bg-[#f0b232] flex items-center justify-center overflow-hidden">
                <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-[#101010]" />
              </span>
            ) : discordData?.status === "online" ? (
              <span className="w-3.5 h-3.5 rounded-full bg-[#23a55a]" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-[#80848e] flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-[#101010] rounded-full" />
              </span>
            )}
          </div>

          {/* Avatar Decoration */}
          {showAvatarDecoration && discordData?.user?.avatar_decoration_data?.asset && (
            <div className="absolute -inset-2.5 pointer-events-none z-10 flex items-center justify-center">
              <Image
                src={`https://cdn.discordapp.com/avatar-decoration-presets/${discordData.user.avatar_decoration_data.asset}.png`}
                alt=""
                width={78}
                height={78}
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Header Row: Auto-scrolls ping-pong ONLY when content overflows */}
          <OverflowPingPong deps={[discordData, showGuildTag, showBadges]}>
            <span className="text-[16px] font-normal text-white/95 tracking-tight shrink-0">
              {discordData?.user?.username || (loading ? "Loading..." : "Discord User")}
            </span>

            {showGuildTag && discordData?.user?.clan?.tag && (
              <span className="inline-flex items-center gap-1.5 bg-white/[0.07] border border-white/10 px-2 py-1 rounded-[6px] text-[12px] font-normal leading-none text-white/85 shrink-0 ml-2">
                {discordData.user.clan.badge && (
                  <Image
                    src={`https://cdn.discordapp.com/clan-badges/${discordData.user.clan.identity_guild_id}/${discordData.user.clan.badge}.png`}
                    alt=""
                    width={14}
                    height={14}
                    className="object-contain"
                    unoptimized
                  />
                )}
                <span>{discordData.user.clan.tag}</span>
              </span>
            )}

            {showBadges && visibleBadges.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {visibleBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="relative w-5 h-5 shrink-0 flex items-center justify-center cursor-pointer"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredBadge({
                        name: badge.name,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <Image
                      src={badge.icon}
                      alt={badge.name}
                      width={20}
                      height={20}
                      className="object-contain pointer-events-none"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </OverflowPingPong>

          {/* Activity / Status with ping-pong overflow scroll */}
          <OverflowPingPong deps={[discordData, showActivity, fallbackText]}>
            {!showActivity ? (
              fallbackText ? (
                <span className="text-[13px] font-normal text-white/40 whitespace-nowrap">{fallbackText}</span>
              ) : null
            ) : discordData?.primary_activity ? (
              <div className="flex items-center gap-1.5 text-[13px] font-normal leading-tight shrink-0 whitespace-nowrap">
                <span className="text-white/85">
                  {discordData.primary_activity.name}
                </span>
                {(discordData.primary_activity.details || discordData.primary_activity.state) && (
                  <span className="text-[12px] text-white/50">
                    • {discordData.primary_activity.details || discordData.primary_activity.state}
                  </span>
                )}
              </div>
            ) : discordData?.spotify ? (
              <div className="flex items-center gap-1.5 text-[13px] font-normal leading-tight shrink-0 whitespace-nowrap">
                <span className="text-white/85">
                  {discordData.spotify.song}
                </span>
                <span className="text-[12px] text-white/50">
                  • {discordData.spotify.artist}
                </span>
              </div>
            ) : discordData?.custom_status?.text ? (
              <div className="flex items-center gap-1.5 text-[13px] text-white/70 font-normal shrink-0 whitespace-nowrap">
                {discordData.custom_status.emoji?.id ? (
                  <div className="relative w-4.5 h-4.5 shrink-0">
                    <Image
                      src={`https://cdn.discordapp.com/emojis/${discordData.custom_status.emoji.id}.${discordData.custom_status.emoji.animated ? "gif" : "png"}?size=32`}
                      alt=""
                      fill
                      sizes="18px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : discordData.custom_status.emoji?.name ? (
                  <span className="text-[13px]">{discordData.custom_status.emoji.name}</span>
                ) : null}
                <span>{discordData.custom_status.text}</span>
              </div>
            ) : (
              <span className="text-[13px] font-normal text-white/40 whitespace-nowrap">
                {discordData?.status === "offline"
                  ? showLastSeen
                    ? formatLastSeen(discordData?.last_seen)
                    : "offline"
                  : discordData?.status || "offline"}
              </span>
            )}
          </OverflowPingPong>
        </div>
      </div>

      {/* Right Thumbnail */}
      {showActivity && showActivityImage && discordData?.primary_activity?.large_image_url ? (
        <div
          className={`w-[66px] h-[66px] shrink-0 overflow-hidden bg-white/[0.04] border border-white/10 shadow-sm flex items-center justify-center ${
            activityImageShape === "square"
              ? "rounded-none"
              : activityImageShape === "circle"
              ? "rounded-full"
              : "rounded-2xl"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={discordData.primary_activity.large_image_url}
            alt=""
            className="w-[66px] h-[66px] min-w-[66px] min-h-[66px] object-cover block"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : showActivity && showActivityImage && discordData?.spotify?.album_art_url ? (
        <div
          className={`w-[66px] h-[66px] shrink-0 overflow-hidden bg-white/[0.04] border border-white/10 shadow-sm flex items-center justify-center ${
            activityImageShape === "square"
              ? "rounded-none"
              : activityImageShape === "circle"
              ? "rounded-full"
              : "rounded-2xl"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={discordData.spotify.album_art_url}
            alt=""
            className="w-[66px] h-[66px] min-w-[66px] min-h-[66px] object-cover block"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}
    </div>
    </>
  );
}
