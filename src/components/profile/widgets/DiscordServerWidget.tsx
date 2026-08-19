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
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

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
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div
            className={`w-[60px] h-[60px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`https://discord.gg/${encodeURIComponent(cleanInvite)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {/* Top-Right Redirect Badge */}
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
      )}

      {/* Background Layer: Banner OR Icon Overlay */}
      {showBanner && bannerUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bannerUrl}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, 400px"
            className="object-cover opacity-60 filter blur-[0.5px]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-[#101010]/50 to-[#101010]/30" />
        </div>
      ) : showBackgroundOverlay && iconUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt=""
            className="w-full h-full object-cover opacity-45 filter blur-[10px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      ) : null}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        {/* Guild Icon */}
        <div
          className={`relative w-[60px] h-[60px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          <Image
            src={iconUrl}
            alt=""
            fill
            sizes="60px"
            priority
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Guild Info */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Title with pingpong overflow scroll */}
          <OverflowPingPong deps={[serverData, guild?.name]}>
            <span className="text-[15px] font-normal text-white tracking-tight shrink-0">
              {guild?.name || (loading ? "Loading..." : "Discord Server")}
            </span>
          </OverflowPingPong>

          {/* Counts */}
          {(showOnlineCount || showMemberCount) && (
            <OverflowPingPong deps={[serverData, showOnlineCount, showMemberCount]}>
              <div className="flex items-center gap-2.5 text-[13px] text-white/60 font-normal whitespace-nowrap shrink-0">
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
    </a>
  );
}
