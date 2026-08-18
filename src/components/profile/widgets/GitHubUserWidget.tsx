"use client";

import { useGitHubUser } from "@/lib/hooks/useGitHubUser";
import { useGitHubContributions } from "@/lib/hooks/useGitHubContributions";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";

const LEVEL_COLORS = [
  "bg-white/[0.04] border border-white/[0.03]", // level 0 (empty)
  "bg-[#0e4429] border border-[#006d32]/30", // level 1
  "bg-[#006d32] border border-[#26a641]/30", // level 2
  "bg-[#26a641] border border-[#39d353]/30", // level 3
  "bg-[#39d353] border border-[#39d353]/50 shadow-[0_0_8px_rgba(57,211,83,0.3)]", // level 4
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
      <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 py-3.5 shadow-md flex items-center justify-between gap-3 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-[62px] h-[62px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
        {showViewButton && <div className="w-12 h-7 bg-white/[0.05] rounded-xl shrink-0" />}
      </div>
    );
  }

  return (
    <div className="w-full h-[98px] bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 flex flex-col justify-center relative box-border">
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

      {/* Real GitHub Contribution Heatmap */}
      {showContributionHeatmap && (
        <div className="absolute inset-y-0 right-0 w-[55%] z-0 pointer-events-none flex items-center justify-end pr-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.4)_25%,rgba(0,0,0,0.85)_60%,black_100%)]">
          <div className="grid grid-rows-7 grid-flow-col gap-[3px] opacity-75">
            {contributions.length > 0
              ? contributions.map((day, i) => {
                  const colorClass = LEVEL_COLORS[Math.min(4, Math.max(0, day.level))] || LEVEL_COLORS[0];
                  return (
                    <div
                      key={i}
                      className={`w-[7px] h-[7px] rounded-[1.5px] shrink-0 transition-colors ${colorClass}`}
                      title={day.date ? `${day.count} contributions on ${day.date}` : undefined}
                    />
                  );
                })
              : Array.from({ length: 70 }).map((_, i) => (
                  <div key={i} className="w-[7px] h-[7px] rounded-[1.5px] shrink-0 bg-white/[0.04] border border-white/[0.03]" />
                ))}
          </div>
        </div>
      )}

      <div className="px-4.5 py-3.5 flex items-center justify-between gap-3 relative z-10 w-full">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div
            className={`relative w-[62px] h-[62px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
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

          {/* User Info & Stats */}
          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
            {/* Title with ping-pong overflow scroll */}
            <OverflowPingPong deps={[userData, userData?.name, userData?.login]}>
              <span className="text-[16px] font-normal text-white/95 tracking-tight shrink-0">
                {userData.name || userData.login}
              </span>
              {userData.name && (
                <span className="text-[12.5px] font-mono text-white/40 shrink-0 ml-1.5">
                  @{userData.login}
                </span>
              )}
            </OverflowPingPong>

            {/* Counts Row */}
            {(showFollowers || showFollowing || showPublicRepos) && (
              <OverflowPingPong deps={[userData, showFollowers, showFollowing, showPublicRepos]}>
                <div className="flex items-center gap-2.5 text-[12px] text-white/60 font-normal whitespace-nowrap shrink-0">
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
            className="shrink-0 px-3 py-1.5 rounded-xl bg-[#609fda]/20 hover:bg-[#609fda]/30 border border-[#609fda]/30 text-[12px] font-medium text-white transition-all duration-150 flex items-center gap-1.5 shadow-[0_0_12px_rgba(96,159,218,0.15)]"
          >
            <span>View</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
