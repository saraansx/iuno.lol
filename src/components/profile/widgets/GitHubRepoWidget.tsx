"use client";

import { useGitHubRepo } from "@/lib/hooks/useGitHubRepo";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import OverflowPingPong from "./OverflowPingPong";

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
            className={`w-[60px] h-[60px] shrink-0 bg-white/[0.05] ${
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
      className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
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

      {/* Background Avatar Ambient Overlay */}
      {showBackgroundOverlay && ownerName && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/widgets/github/avatar/${encodeURIComponent(ownerName || "github")}`}
            alt=""
            className="w-full h-full object-cover opacity-35 filter blur-[14px] scale-125"
          />
          <div className="absolute inset-0 bg-[#101010]/60 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
        {/* Owner / Repo Icon */}
        <div
          className={`relative w-[60px] h-[60px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
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
          <OverflowPingPong deps={[repoData, repoData?.name, repoData?.full_name]}>
            <span className="text-[15.5px] font-medium text-white tracking-tight shrink-0">
              {repoData.full_name || cleanRepo}
            </span>
          </OverflowPingPong>

          {/* Stats Row */}
          {(showStars || showForks || showWatchers || showOpenIssues || (showPrimaryLanguage && repoData.language)) && (
            <OverflowPingPong deps={[repoData, showStars, showForks, showWatchers, showOpenIssues, showPrimaryLanguage]}>
              <div className="flex items-center gap-2.5 text-[13px] text-white/60 font-normal whitespace-nowrap shrink-0">
                {showPrimaryLanguage && repoData.language && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: langColor }} />
                    <span className="text-white/80">{repoData.language}</span>
                  </div>
                )}

                {showStars && (
                  <div className="flex items-center gap-1 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-white/90 font-medium">
                      {Number(repoData.stargazers_count || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {showForks && (
                  <div className="flex items-center gap-1 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                    <span className="text-white/90 font-medium">
                      {Number(repoData.forks_count || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {showWatchers && (
                  <div className="flex items-center gap-1 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="text-white/90 font-medium">
                      {Number(repoData.subscribers_count || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {showOpenIssues && (
                  <div className="flex items-center gap-1 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-white/90 font-medium">
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
