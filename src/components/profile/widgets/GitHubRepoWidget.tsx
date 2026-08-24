"use client";

import { useGitHubRepo } from "@/lib/hooks/useGitHubRepo";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";
import {
  GitHubStarIcon,
  GitHubForkIcon,
  GitHubWatchersIcon,
  GitHubIssuesIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Shell: "#89e051",
  Dart: "#00B4AB",
};

export default function GitHubRepoWidget({ widget }: { widget: WidgetItem }) {
  const cleanRepo = widget.targetId
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  const { data: repoData, loading } = useGitHubRepo(cleanRepo);

  const imageShape = widget.imageShape || "rounded";
  const showBackgroundOverlay = widget.showBackgroundOverlay !== undefined ? widget.showBackgroundOverlay : true;
  const showStars = widget.showStars !== undefined ? widget.showStars : true;
  const showForks = widget.showForks !== undefined ? widget.showForks : true;
  const showWatchers = widget.showWatchers !== undefined ? widget.showWatchers : true;
  const showOpenIssues = widget.showOpenIssues !== undefined ? widget.showOpenIssues : true;
  const showPrimaryLanguage = widget.showPrimaryLanguage !== undefined ? widget.showPrimaryLanguage : true;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  const [ownerName] = cleanRepo.split("/");

  if (loading || !repoData) {
    return (
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div
            className={`w-[74px] h-[74px] shrink-0 bg-white/[0.05] ${
              imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
            }`}
          />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const langColor = repoData.language ? LANGUAGE_COLORS[repoData.language] || "#609fda" : "#609fda";

  return (
    <a
      href={repoData.html_url || `https://github.com/${encodeURIComponent(cleanRepo)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
    >
      {/* Top-Right Redirect Badge */}
      {showViewButton && (
        <div className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50">
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
        </div>
      )}

      {/* Background Avatar Ambient Overlay */}
      {showBackgroundOverlay && ownerName && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/widgets/github/avatar/${encodeURIComponent(ownerName || "github")}`}
            alt=""
            className="w-full h-full object-cover opacity-45 filter blur-[10px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/50 backdrop-blur-[1px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        {/* Owner / Repo Icon */}
        <div
          className={`relative w-[74px] h-[74px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
            imageShape === "square" ? "rounded-none" : imageShape === "circle" ? "rounded-full" : "rounded-2xl"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/widgets/github/avatar/${encodeURIComponent(ownerName || "github")}`}
            alt=""
            className="w-full h-full object-cover block"
            onError={(e) => {
              const target = e.currentTarget;
              if (repoData?.owner?.avatar_url && target.src !== repoData.owner.avatar_url) {
                target.src = repoData.owner.avatar_url;
              }
            }}
          />
        </div>

        {/* Repo Info & Stats */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Repo Name with ping-pong overflow scroll */}
          <OverflowPingPong deps={[repoData, repoData?.full_name]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
              {repoData.full_name || cleanRepo}
            </span>
          </OverflowPingPong>

          {/* Stats Row */}
          {(showStars || showForks || showWatchers || showOpenIssues || (showPrimaryLanguage && repoData.language)) && (
            <OverflowPingPong deps={[repoData, showStars, showForks, showWatchers, showOpenIssues, showPrimaryLanguage]}>
              <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
                {showPrimaryLanguage && repoData.language && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: langColor }} />
                    <span className="text-white/85">{repoData.language}</span>
                  </div>
                )}

                {showStars && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GitHubStarIcon size={14} className="text-amber-400 shrink-0" />
                    <span className="text-white/85">
                      {Number(repoData.stargazers_count || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {showForks && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GitHubForkIcon size={14} className="text-white/70 shrink-0" />
                    <span className="text-white/85">
                      {Number(repoData.forks_count || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {showWatchers && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GitHubWatchersIcon size={14} className="text-white/70 shrink-0" />
                    <span className="text-white/85">
                      {Number(repoData.subscribers_count || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {showOpenIssues && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <GitHubIssuesIcon size={14} className="text-red-400 shrink-0" />
                    <span className="text-white/85">
                      {Number(repoData.open_issues_count || 0).toLocaleString()}
                    </span>
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
