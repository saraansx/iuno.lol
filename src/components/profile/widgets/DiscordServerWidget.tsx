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
      <div className="w-full py-3.5 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 shadow-md flex flex-col justify-center gap-2.5 box-border">
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div
            className={`w-[52px] h-[52px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
          </div>
        </div>
        <div className="w-full h-8 bg-white/[0.05] rounded-xl shrink-0" />
      </div>
    );
  }

  return (
    <div className="w-full h-[116px] p-3.5 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[22px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 flex flex-col justify-between relative box-border">
      {/* Background Layer: Banner, Icon Ambient Overlay, or none */}
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
      ) : null}
      {showBackgroundOverlay && iconUrl ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt=""
            className="w-full h-full object-cover opacity-60 filter blur-[8px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/40 backdrop-blur-[1px]" />
        </div>
      ) : null}

      <div className="flex flex-col justify-between h-full relative z-10 w-full">
        <div className="flex items-center gap-3 min-w-0 w-full">
          {/* Guild Icon */}
          <div
            className={`relative w-11 h-11 shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-xl"
            }`}
          >
            <Image
              src={iconUrl}
              alt=""
              fill
              sizes="44px"
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Guild Info */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
            {/* Title with pingpong overflow scroll */}
            <OverflowPingPong deps={[serverData, guild?.name]}>
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                {guild?.name || (loading ? "Loading..." : "Discord Server")}
              </span>
            </OverflowPingPong>

            {/* Counts */}
            {(showOnlineCount || showMemberCount) && (
              <OverflowPingPong deps={[serverData, showOnlineCount, showMemberCount]}>
                <div className="flex items-center gap-2 text-[12px] text-white/60 font-normal whitespace-nowrap shrink-0">
                  {showOnlineCount && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#23a55a] shrink-0" />
                      <span>{Number(serverData?.approximate_presence_count || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {showMemberCount && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#80848e] shrink-0" />
                      <span>{Number(serverData?.approximate_member_count || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </OverflowPingPong>
            )}
          </div>
        </div>

        {/* Join Server Button (Below) */}
        <a
          href={`https://discord.gg/${encodeURIComponent(cleanInvite)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-7.5 px-3 py-1 bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-[#80bbf2] border border-[#609fda]/25 rounded-xl font-normal text-[13px] transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Join Server</span>
          <svg width="10.5" height="10.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
