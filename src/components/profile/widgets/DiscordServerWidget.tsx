"use client";

import Image from "next/image";
import { useDiscordServer } from "@/lib/hooks/useDiscordServer";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";

export default function DiscordServerWidget({ widget }: { widget: WidgetItem }) {
  const cleanInvite = widget.targetId.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");
  const { data: serverData, loading } = useDiscordServer(cleanInvite);

  const guild = serverData?.guild;
  const imageShape = widget.imageShape || "rounded";
  const showMemberCount = widget.showMemberCount !== undefined ? widget.showMemberCount : true;
  const showOnlineCount = widget.showOnlineCount !== undefined ? widget.showOnlineCount : true;
  const showBanner = widget.showBanner !== undefined ? widget.showBanner : true;
  const showBackgroundOverlay = widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : false;

  const iconUrl = guild?.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const bannerUrl = guild?.banner
    ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${guild.banner.startsWith("a_") ? "gif" : "png"}?size=480`
    : guild?.splash
    ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png?size=480`
    : null;

  if (loading || !serverData) {
    return (
      <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 py-3.5 shadow-md flex items-center justify-between gap-3 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-[62px] h-[62px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
          </div>
        </div>
        <div className="w-12 h-7 bg-white/[0.05] rounded-xl shrink-0" />
      </div>
    );
  }

  return (
    <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 flex flex-col justify-center relative box-border">
      {/* Banner or Icon Background Overlay */}
      {showBanner && bannerUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bannerUrl}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, 400px"
            className="object-cover opacity-30 filter blur-[1px]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/90 via-[#101010]/80 to-[#101010]/40" />
        </div>
      ) : showBackgroundOverlay && iconUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[14px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[2px]" />
        </div>
      ) : null}

      <div className="px-4.5 py-3.5 flex items-center justify-between gap-3 relative z-10 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Guild Icon */}
          <div
            className={`relative w-[62px] h-[62px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          >
            <Image
              src={iconUrl}
              alt=""
              fill
              sizes="62px"
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Guild Info */}
          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
            {/* Title with pingpong overflow scroll */}
            <OverflowPingPong deps={[serverData, guild?.name]}>
              <span className="text-[16px] font-normal text-white/95 tracking-tight shrink-0">
                {guild?.name || (loading ? "Loading..." : "Discord Server")}
              </span>
            </OverflowPingPong>

            {/* Counts */}
            {(showOnlineCount || showMemberCount) && (
              <OverflowPingPong deps={[serverData, showOnlineCount, showMemberCount]}>
                <div className="flex items-center gap-2.5 text-[12.5px] text-white/60 font-normal whitespace-nowrap shrink-0">
                  {showOnlineCount && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#23a55a] shrink-0" />
                      <span>{Number(serverData?.approximate_presence_count || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {showMemberCount && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#80848e] shrink-0" />
                      <span>{Number(serverData?.approximate_member_count || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </OverflowPingPong>
            )}
          </div>
        </div>

        {/* Join button */}
        <a
          href={`https://discord.gg/${encodeURIComponent(cleanInvite)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-[12px] font-medium text-white transition-colors"
        >
          Join
        </a>
      </div>
    </div>
  );
}
