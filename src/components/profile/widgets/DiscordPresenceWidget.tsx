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
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const [hoveredBadge, setHoveredBadge] = useState<{ name: string; x: number; y: number } | null>(null);

  if (loading || !discordData) {
    return (
      <div className={`w-full ${showViewButton ? "py-3.5" : "h-[98px]"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 shadow-md flex flex-col justify-center gap-2.5 box-border`}>
        <div className="flex items-center gap-3 min-w-0 w-full">
          {/* Avatar Skeleton */}
          <div
            className={`w-[52px] h-[52px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          {/* User & Status Skeleton */}
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
        {showViewButton && <div className="w-full h-8 bg-white/[0.05] rounded-xl shrink-0" />}
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

      <div className={`w-full ${showViewButton ? "h-[116px] p-3.5" : "h-[88px] px-3.5 py-3"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[22px] shadow-md flex flex-col justify-between transition-all duration-200 hover:border-white/20 box-border relative overflow-hidden`}>
        {/* Right Half Blended Activity / Spotify / Avatar Background */}
        {showActivity && showActivityImage && (discordData?.spotify?.album_art_url || discordData?.primary_activity?.large_image_url) ? (
          <div
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
            style={{
              maskImage: "linear-gradient(to right, transparent 35%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 80%, black 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 35%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 80%, black 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(discordData?.spotify?.album_art_url || discordData?.primary_activity?.large_image_url) ?? ""}
              alt=""
              className="absolute right-0 top-0 w-3/4 h-full object-cover opacity-90 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/60 via-transparent to-[#101010]/30" />
          </div>
        ) : showBackgroundOverlay && avatarUrl ? (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover opacity-35 filter blur-[14px] scale-125"
            />
            <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[2px]" />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 min-w-0 w-full relative z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`relative w-11 h-11 overflow-hidden bg-[#181818] border border-white/10 ${
                  imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-xl"
                }`}
              >
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  sizes="44px"
                  priority
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 z-20 w-3.5 h-3.5 rounded-full bg-[#101010] flex items-center justify-center">
                {discordData?.status === "dnd" ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f23f43] flex items-center justify-center">
                    <span className="w-1.5 h-0.5 bg-[#101010] rounded-full" />
                  </span>
                ) : discordData?.status === "idle" ? (
                  <span className="relative w-2.5 h-2.5 rounded-full bg-[#f0b232] flex items-center justify-center overflow-hidden">
                    <span className="absolute -top-0.5 -left-0.5 w-1 h-1 rounded-full bg-[#101010]" />
                  </span>
                ) : discordData?.status === "online" ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#23a55a]" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#80848e] flex items-center justify-center">
                    <span className="w-1 h-1 bg-[#101010] rounded-full" />
                  </span>
                )}
              </div>

              {/* Avatar Decoration */}
              {showAvatarDecoration && discordData?.user?.avatar_decoration_data?.asset && (
                <div className="absolute -inset-1.5 pointer-events-none z-10 flex items-center justify-center">
                  <Image
                    src={`https://cdn.discordapp.com/avatar-decoration-presets/${discordData.user.avatar_decoration_data.asset}.png`}
                    alt=""
                    width={56}
                    height={56}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
              {/* Header Row: Auto-scrolls ping-pong ONLY when content overflows */}
              <OverflowPingPong deps={[discordData, showGuildTag, showBadges]}>
                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {discordData?.user?.username || (loading ? "Loading..." : "Discord User")}
                </span>

                {showGuildTag && discordData?.user?.clan?.tag && (
                  <span className="inline-flex items-center gap-1 bg-white/[0.07] border border-white/10 px-1.5 py-0.5 rounded-[5px] text-[11px] font-normal leading-none text-white/85 shrink-0 ml-1.5">
                    {discordData.user.clan.badge && (
                      <Image
                        src={`https://cdn.discordapp.com/clan-badges/${discordData.user.clan.identity_guild_id}/${discordData.user.clan.badge}.png`}
                        alt=""
                        width={12}
                        height={12}
                        className="object-contain"
                        unoptimized
                      />
                    )}
                    <span>{discordData.user.clan.tag}</span>
                  </span>
                )}

                {showBadges && visibleBadges.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0 ml-1.5">
                    {visibleBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="relative w-4 h-4 shrink-0 flex items-center justify-center cursor-pointer"
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
                          width={16}
                          height={16}
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
                    <span className="text-[12px] font-normal text-white/40 whitespace-nowrap">{fallbackText}</span>
                  ) : null
                ) : discordData?.primary_activity ? (
                  <div className="flex items-center gap-1.5 text-[12px] font-normal leading-tight shrink-0 whitespace-nowrap">
                    <span className="text-white/85">
                      {discordData.primary_activity.name}
                    </span>
                    {(discordData.primary_activity.details || discordData.primary_activity.state) && (
                      <span className="text-[11px] text-white/50">
                        • {discordData.primary_activity.details || discordData.primary_activity.state}
                      </span>
                    )}
                  </div>
                ) : discordData?.spotify ? (
                  <div className="flex items-center gap-1.5 text-[12px] font-normal leading-tight shrink-0 whitespace-nowrap">
                    <span className="text-white/85">
                      {discordData.spotify.song}
                    </span>
                    {discordData.spotify.artist && (
                      <span className="text-[11px] text-white/50">
                        • {discordData.spotify.artist}
                      </span>
                    )}
                  </div>
                ) : discordData?.custom_status?.text ? (
                  <div className="flex items-center gap-1.5 text-[12px] text-white/70 font-normal shrink-0 whitespace-nowrap">
                    {discordData.custom_status.emoji?.id ? (
                      <div className="relative w-3.5 h-3.5 shrink-0">
                        <Image
                          src={`https://cdn.discordapp.com/emojis/${discordData.custom_status.emoji.id}.${discordData.custom_status.emoji.animated ? "gif" : "png"}?size=32`}
                          alt=""
                          fill
                          sizes="14px"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : discordData.custom_status.emoji?.name ? (
                      <span className="text-[12px]">{discordData.custom_status.emoji.name}</span>
                    ) : null}
                    <span>{discordData.custom_status.text}</span>
                  </div>
                ) : (
                  <span className="text-[12px] font-normal text-white/40 whitespace-nowrap">
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
        </div>

        {/* View Profile Button (Below) */}
        {showViewButton && (
          <a
            href={`https://discord.com/users/${widget.targetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-7.5 px-3 py-1 bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-[#80bbf2] border border-[#609fda]/25 rounded-xl font-normal text-[13px] transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer relative z-10"
          >
            <span>View Profile</span>
            <svg width="10.5" height="10.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
    </>
  );
}
