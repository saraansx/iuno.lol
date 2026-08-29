"use client";

import { useState } from "react";
import Image from "next/image";
import { useDiscordPresence } from "@/lib/hooks/useDiscordPresence";
import { discordActivityImageUrl } from "@/lib/discord-activity-image";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import { WidgetRedirectIcon } from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

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
  const [failedIconUrl, setFailedIconUrl] = useState<string | null>(null);
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string | null>(null);

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!discordData) {
    return <WidgetUnavailable imageShape={imageShape} label="Discord profile" />;
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

  const activityIconUrl = discordActivityImageUrl(
    discordData?.primary_activity?.small_image_url || discordData?.primary_activity?.large_image_url
  );
  const activityThumbnailUrl = discordActivityImageUrl(
    discordData?.spotify?.album_art_url || discordData?.primary_activity?.large_image_url
  );

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

      <a
        href={`https://discord.com/users/${widget.targetId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] flex items-center justify-between transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 box-border relative overflow-hidden cursor-pointer"
      >
        {showViewButton && (
          <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
            <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
          </div>
        )}

        {showBackgroundOverlay && avatarUrl ? (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover opacity-35 filter blur-[12px] scale-125"
            />
            <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
          </div>
        ) : null}

        <div className="@container flex items-center justify-between gap-3.5 min-w-0 w-full relative z-10">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`relative w-[74px] h-[74px] overflow-hidden bg-[#181818] border border-white/10 ${
                  imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
                }`}
              >
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  sizes="74px"
                  priority
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div
                className={`absolute z-20 w-4 h-4 rounded-full bg-[#101010] flex items-center justify-center ${
                  imageShape === "circle" ? "bottom-0.5 right-0.5" : "-bottom-0.5 -right-0.5"
                }`}
              >
                {discordData?.status === "dnd" ? (
                  <span className="w-3 h-3 rounded-full bg-[#f23f43] flex items-center justify-center">
                    <span className="w-1.5 h-0.5 bg-[#101010] rounded-full" />
                  </span>
                ) : discordData?.status === "idle" ? (
                  <span className="relative w-3 h-3 rounded-full bg-[#f0b232] flex items-center justify-center overflow-hidden">
                    <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-[#101010]" />
                  </span>
                ) : discordData?.status === "online" ? (
                  <span className="w-3 h-3 rounded-full bg-[#23a55a]" />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-[#80848e] flex items-center justify-center">
                    <span className="w-1 h-1 bg-[#101010] rounded-full" />
                  </span>
                )}
              </div>

              {showAvatarDecoration && discordData?.user?.avatar_decoration_data?.asset && (
                <div className="absolute -inset-[10%] pointer-events-none z-10">
                  <Image
                    src={`https://cdn.discordapp.com/avatar-decoration-presets/${discordData.user.avatar_decoration_data.asset}.png`}
                    alt=""
                    fill
                    sizes="90px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
              <OverflowPingPong deps={[discordData, showGuildTag, showBadges]}>
                <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                  {discordData?.user?.username || (loading ? "Loading..." : "Discord User")}
                </span>

                {showGuildTag && discordData?.user?.clan?.tag && (
                  <span className="inline-flex items-center gap-1.5 bg-white/[0.08] border border-white/10 px-2 py-0.5 rounded-[6px] text-[12px] font-medium leading-none text-white/90 shrink-0 ml-1.5">
                    {discordData.user.clan.badge && (
                      <Image
                        src={`https://cdn.discordapp.com/clan-badges/${discordData.user.clan.identity_guild_id}/${discordData.user.clan.badge}.png`}
                        alt="Clan badge"
                        width={15}
                        height={15}
                        className="object-contain"
                        unoptimized
                      />
                    )}
                    <span>{discordData.user.clan.tag}</span>
                  </span>
                )}

                {showBadges && visibleBadges.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                    {visibleBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="relative w-[18px] h-[18px] shrink-0 flex items-center justify-center cursor-pointer"
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
                          width={18}
                          height={18}
                          className="object-contain pointer-events-none"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
              </OverflowPingPong>

              <OverflowPingPong deps={[discordData, showActivity, fallbackText]}>
                {!showActivity ? (
                  fallbackText ? (
                    <span className="text-[12.5px] font-normal leading-tight text-white/40 whitespace-nowrap">{fallbackText}</span>
                  ) : null
                ) : discordData?.spotify ? (
                  <div className="flex flex-col min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#1ED760" className="shrink-0">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                      </svg>
                      <span className="text-[12.5px] font-normal text-white/90 truncate">
                        {discordData.spotify.song}
                      </span>
                    </div>
                    {discordData.spotify.artist && (
                      <span className="text-[11.5px] font-normal text-white/50 truncate pl-[18px]">
                        {discordData.spotify.artist}
                      </span>
                    )}
                  </div>
                ) : discordData?.primary_activity ? (
                  <div className="flex items-center gap-1.5 text-[12.5px] font-normal leading-tight shrink-0 whitespace-nowrap">
                    {activityIconUrl && activityIconUrl !== failedIconUrl ? (
                      <div className="relative w-3.5 h-3.5 shrink-0 rounded-[3px] overflow-hidden">
                        <Image
                          src={activityIconUrl}
                          alt=""
                          fill
                          sizes="14px"
                          className="object-contain"
                          unoptimized
                          onError={() => setFailedIconUrl(activityIconUrl)}
                        />
                      </div>
                    ) : null}
                    <span className="text-white/85">
                      {discordData.primary_activity.name}
                    </span>
                    {(discordData.primary_activity.details || discordData.primary_activity.state) && (
                      <span className="text-[12px] text-white/50">
                        • {discordData.primary_activity.details || discordData.primary_activity.state}
                      </span>
                    )}
                  </div>
                ) : discordData?.custom_status?.text ? (
                  <div className="flex items-center gap-1.5 text-[13px] text-white/70 font-normal shrink-0 whitespace-nowrap">
                    {discordData.custom_status.emoji?.id ? (
                      <div className="relative w-4 h-4 shrink-0">
                        <Image
                          src={`https://cdn.discordapp.com/emojis/${discordData.custom_status.emoji.id}.${discordData.custom_status.emoji.animated ? "gif" : "png"}?size=32`}
                          alt=""
                          fill
                          sizes="16px"
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

          {showActivity && showActivityImage && activityThumbnailUrl && activityThumbnailUrl !== failedThumbnailUrl && (
            <div
              className={`relative shrink-0 w-[74px] h-[74px] overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ml-2 @max-[280px]:hidden ${
                activityImageShape === "square"
                  ? "rounded-none"
                  : activityImageShape === "circle"
                  ? "rounded-full"
                  : "rounded-2xl"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activityThumbnailUrl}
                alt=""
                className="w-full h-full object-cover block"
                onError={() => setFailedThumbnailUrl(activityThumbnailUrl)}
              />
            </div>
          )}
        </div>
      </a>
    </>
  );
}
