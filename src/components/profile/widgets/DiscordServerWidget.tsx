"use client";

import Image from "next/image";
import { useDiscordServer } from "@/lib/hooks/useDiscordServer";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";

export default function DiscordServerWidget({ widget }: { widget: WidgetItem }) {
  const cleanInvite = widget.targetId.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "");
  const { data: serverData, loading } = useDiscordServer(cleanInvite);

  const guild = serverData?.guild;
  const imageShape = widget.imageShape || "rounded";
  const showMemberCount = widget.showMemberCount !== undefined ? widget.showMemberCount : true;
  const showOnlineCount = widget.showOnlineCount !== undefined ? widget.showOnlineCount : true;
  const showBanner = widget.showBanner !== undefined ? widget.showBanner : true;

  const iconUrl = guild?.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const bannerUrl = guild?.banner
    ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${guild.banner.startsWith("a_") ? "gif" : "png"}?size=480`
    : guild?.splash
    ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png?size=480`
    : null;

  if (loading && !serverData) {
    return (
      <div className="w-full bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[20px] p-4 shadow-md flex items-center gap-3.5">
        <div
          className={`w-12 h-12 shrink-0 bg-white/[0.05] ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        />
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
          <div className="h-3 w-16 bg-white/[0.03] rounded-md" />
        </div>
        <div className="w-12 h-7 bg-white/[0.05] rounded-xl shrink-0" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[20px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 flex flex-col">
      {/* Banner */}
      {showBanner && bannerUrl && (
        <div className="relative w-full h-16 bg-[#161616] overflow-hidden">
          <Image
            src={bannerUrl}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, 400px"
            className="object-cover opacity-80"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101010]/80" />
        </div>
      )}

      <div className={`p-4 flex items-center gap-3.5 ${showBanner && bannerUrl ? "-mt-4 relative z-10" : ""}`}>
        {/* Guild Icon */}
        <div
          className={`relative w-12 h-12 shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          <Image
            src={iconUrl}
            alt=""
            fill
            sizes="48px"
            priority
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Guild Info */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-[14px] font-medium text-white tracking-tight truncate">
            {guild?.name || (loading ? "Loading..." : "Discord Server")}
          </span>

          {/* Counts */}
          {(showOnlineCount || showMemberCount) && (
            <div className="flex items-center gap-2.5 text-[11px] text-white/60 font-normal">
              {showOnlineCount && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{Number(serverData?.approximate_presence_count || 0).toLocaleString()}</span>
                </div>
              )}
              {showMemberCount && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                  <span>{Number(serverData?.approximate_member_count || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
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
