"use client";

import { useGitHubUser } from "@/lib/hooks/useGitHubUser";
import { useGitHubContributions } from "@/lib/hooks/useGitHubContributions";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import { WidgetRedirectIcon } from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

const LEVEL_COLORS = [
  "bg-[#161b22] border border-white/[0.06]",
  "bg-[#0e4429] border border-[#006d32]/40",
  "bg-[#006d32] border border-[#26a641]/50",
  "bg-[#26a641] border border-[#39d353]/60 shadow-[0_0_6px_rgba(38,166,65,0.2)]",
  "bg-[#39d353] border border-[#39d353]/80 shadow-[0_0_10px_rgba(57,211,83,0.4)]",
];

export default function GitHubUserWidget({ widget }: { widget: WidgetItem }) {
  const cleanUsername = widget.targetId
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const { data: userData, loading } = useGitHubUser(cleanUsername);
  const showContributionHeatmap = widget.showContributionHeatmap !== undefined ? widget.showContributionHeatmap : false;
  const { contributions } = useGitHubContributions(cleanUsername, showContributionHeatmap);

  const imageShape = widget.imageShape || "rounded";
  const showFollowers = widget.showFollowers !== undefined ? widget.showFollowers : true;
  const showFollowing = widget.showFollowing !== undefined ? widget.showFollowing : true;
  const showPublicRepos = widget.showPublicRepos !== undefined ? widget.showPublicRepos : true;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;
  const showBackgroundOverlay = widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : true;

  const avatarUrl = `/api/widgets/github/avatar/${encodeURIComponent(cleanUsername || "github")}`;

  if (loading) {
    return <WidgetSkeleton imageShape={imageShape} />;
  }

  if (!userData) {
    return <WidgetUnavailable imageShape={imageShape} label="GitHub profile" />;
  }

  return (
    <a
      href={userData.html_url || `https://github.com/${encodeURIComponent(cleanUsername)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {showBackgroundOverlay && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover opacity-45 filter blur-[10px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      )}

      {showContributionHeatmap && (
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden p-3 flex items-center justify-end">
          <div className="grid grid-rows-7 grid-flow-col gap-[3.5px] h-full items-center opacity-95">
            {(contributions.length > 0 ? contributions.slice(-280) : Array.from({ length: 280 }, () => ({ level: 0 }))).map((day, i) => {
              const level = day && typeof day === "object" && "level" in day ? Number(day.level) : 0;
              const colorClass = LEVEL_COLORS[Math.min(4, Math.max(0, level))] || LEVEL_COLORS[0];
              return (
                <div
                  key={i}
                  className={`w-[8.5px] h-[8.5px] rounded-[2px] shrink-0 transition-colors ${colorClass}`}
                />
              );
            })}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/80 via-[#101010]/30 to-transparent" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        <div
          className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover block"
            onError={(e) => {
              const target = e.currentTarget;
              if (userData?.avatar_url && target.src !== userData.avatar_url) {
                target.src = userData.avatar_url;
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          <OverflowPingPong deps={[userData, userData?.name, userData?.login]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
              {userData.name || userData.login}
            </span>
            {userData.name && (
              <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-1.5">
                @{userData.login}
              </span>
            )}
          </OverflowPingPong>

          {(showFollowers || showFollowing || showPublicRepos) && (
            <OverflowPingPong deps={[userData, showFollowers, showFollowing, showPublicRepos]}>
              <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                {showFollowers && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-white/85">
                      {Number(userData.followers || 0).toLocaleString()}
                    </span>
                    <span className="text-white/40">followers</span>
                  </div>
                )}
                {showFollowing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-white/85">
                      {Number(userData.following || 0).toLocaleString()}
                    </span>
                    <span className="text-white/40">following</span>
                  </div>
                )}
                {showPublicRepos && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-white/85">
                      {Number(userData.public_repos || 0).toLocaleString()}
                    </span>
                    <span className="text-white/40">repos</span>
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
