"use client";

import { useGitHubUser } from "@/lib/hooks/useGitHubUser";
import { useGitHubContributions } from "@/lib/hooks/useGitHubContributions";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";

const LEVEL_COLORS = [
  "bg-[#161b22] border border-white/[0.06]", // level 0 (empty)
  "bg-[#0e4429] border border-[#006d32]/40", // level 1
  "bg-[#006d32] border border-[#26a641]/50", // level 2
  "bg-[#26a641] border border-[#39d353]/60 shadow-[0_0_6px_rgba(38,166,65,0.2)]", // level 3
  "bg-[#39d353] border border-[#39d353]/80 shadow-[0_0_10px_rgba(57,211,83,0.4)]", // level 4
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

  if (loading || !userData) {
    return (
      <div className={`w-full ${showViewButton ? "py-3.5" : "h-[98px]"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 shadow-md flex flex-col justify-center gap-2.5 box-border`}>
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div
            className={`w-[52px] h-[52px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
        {showViewButton && <div className="w-full h-8 bg-white/[0.05] rounded-xl shrink-0" />}
      </div>
    );
  }

  return (
    <div className={`w-full ${showViewButton ? "h-[116px] p-3.5" : "h-[88px] px-3.5 py-3"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[22px] shadow-md overflow-hidden flex flex-col justify-between relative box-border`}>
      {/* Background Avatar Overlay */}
      {showBackgroundOverlay && (
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

      {/* Real GitHub Contribution Heatmap Full Background */}
      {showContributionHeatmap && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden p-2.5 flex items-center justify-between">
          <div className="grid grid-rows-7 grid-flow-col gap-[2.5px] w-full h-full justify-between items-center opacity-95">
            {(contributions.length > 0 ? contributions : Array.from({ length: 365 }, () => ({ level: 0 }))).map((day, i) => {
              const level = day && typeof day === "object" && "level" in day ? Number(day.level) : 0;
              const colorClass = LEVEL_COLORS[Math.min(4, Math.max(0, level))] || LEVEL_COLORS[0];
              return (
                <div
                  key={i}
                  className={`w-full h-full min-w-[7px] min-h-[7px] max-w-[10px] max-h-[10px] aspect-square rounded-[2px] shrink-0 transition-colors ${colorClass}`}
                />
              );
            })}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/80 via-[#101010]/30 to-transparent" />
        </div>
      )}

      <div className="flex flex-col justify-between h-full relative z-10 w-full">
        <div className="flex items-center gap-3 min-w-0 w-full">
          {/* Avatar */}
          <div
            className={`relative w-11 h-11 shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-xl"
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

          {/* User Info & Stats */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
            {/* Title with ping-pong overflow scroll */}
            <OverflowPingPong deps={[userData, userData?.name, userData?.login]}>
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                {userData.name || userData.login}
              </span>
              {userData.name && (
                <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-1">
                  @{userData.login}
                </span>
              )}
            </OverflowPingPong>

            {/* Counts Row */}
            {(showFollowers || showFollowing || showPublicRepos) && (
              <OverflowPingPong deps={[userData, showFollowers, showFollowing, showPublicRepos]}>
                <div className="flex items-center gap-2 text-[12px] text-white/60 font-normal whitespace-nowrap shrink-0">
                  {showFollowers && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-white/90 font-medium">
                        {Number(userData.followers || 0).toLocaleString()}
                      </span>
                      <span className="text-white/40">followers</span>
                    </div>
                  )}
                  {showFollowing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-white/90 font-medium">
                        {Number(userData.following || 0).toLocaleString()}
                      </span>
                      <span className="text-white/40">following</span>
                    </div>
                  )}
                  {showPublicRepos && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-white/90 font-medium">
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

        {/* View Profile Button */}
        {showViewButton && (
          <a
            href={userData.html_url || `https://github.com/${encodeURIComponent(cleanUsername)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-7.5 px-3 py-1 bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-[#80bbf2] border border-[#609fda]/25 rounded-xl font-normal text-[13px] transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
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
    </div>
  );
}
