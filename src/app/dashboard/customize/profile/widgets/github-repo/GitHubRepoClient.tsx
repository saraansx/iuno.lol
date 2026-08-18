"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useGitHubRepo } from "@/lib/hooks/useGitHubRepo";
import GitHubRepoCustomization from "@/components/dashboard/customize/widgets/github-repo/GitHubRepoCustomization";
import { toast } from "sonner";

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

export default function GitHubRepoClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const isEditing = Boolean(widgetId);

  const initialTargetId = searchParams.get("id") || "";
  const currentWidget = ((user?.widgets as WidgetItem[]) || []).find((w) => w.id === widgetId);
  const initialImageShape = currentWidget?.imageShape || "rounded";
  const initialShowBackgroundOverlay = currentWidget?.showBackgroundOverlay !== undefined ? currentWidget.showBackgroundOverlay : true;
  const initialShowStars = currentWidget?.showStars !== undefined ? currentWidget.showStars : true;
  const initialShowForks = currentWidget?.showForks !== undefined ? currentWidget.showForks : true;
  const initialShowWatchers = currentWidget?.showWatchers !== undefined ? currentWidget.showWatchers : true;
  const initialShowOpenIssues = currentWidget?.showOpenIssues !== undefined ? currentWidget.showOpenIssues : true;
  const initialShowPrimaryLanguage = currentWidget?.showPrimaryLanguage !== undefined ? currentWidget.showPrimaryLanguage : true;
  const initialShowViewButton = currentWidget?.showViewButton !== undefined ? currentWidget.showViewButton : true;
  const initialPlacement = currentWidget?.placement || "inside";

  const [repoString, setRepoString] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState<boolean>(initialShowBackgroundOverlay);
  const [showStars, setShowStars] = useState<boolean>(initialShowStars);
  const [showForks, setShowForks] = useState<boolean>(initialShowForks);
  const [showWatchers, setShowWatchers] = useState<boolean>(initialShowWatchers);
  const [showOpenIssues, setShowOpenIssues] = useState<boolean>(initialShowOpenIssues);
  const [showPrimaryLanguage, setShowPrimaryLanguage] = useState<boolean>(initialShowPrimaryLanguage);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const cleanRepo = repoString
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");

  const { data: repoData, loading: loadingPreview, isValidRepo } = useGitHubRepo(cleanRepo);

  const isChanged =
    cleanRepo !== initialTargetId ||
    imageShape !== initialImageShape ||
    showBackgroundOverlay !== initialShowBackgroundOverlay ||
    showStars !== initialShowStars ||
    showForks !== initialShowForks ||
    showWatchers !== initialShowWatchers ||
    showOpenIssues !== initialShowOpenIssues ||
    showPrimaryLanguage !== initialShowPrimaryLanguage ||
    showViewButton !== initialShowViewButton ||
    placement !== initialPlacement;

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidRepo) {
      toast.error("Please enter a valid GitHub repository (e.g. owner/repo)");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    if (isEditing) {
      updated = existingList.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              targetId: cleanRepo,
              imageShape,
              showBackgroundOverlay,
              showStars,
              showForks,
              showWatchers,
              showOpenIssues,
              showPrimaryLanguage,
              showViewButton,
              placement,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "github",
        type: "github-repo",
        targetId: cleanRepo,
        useLinked: false,
        enabled: true,
        imageShape,
        showBackgroundOverlay,
        showStars,
        showForks,
        showWatchers,
        showOpenIssues,
        showPrimaryLanguage,
        showViewButton,
        placement,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        const res = await updateProfileWidgets({
          username: user.username,
          widgets: updated,
        });
        if (res?.success) {
          toast.success(isEditing ? "Widget saved successfully" : "Widget added successfully");
          router.push("/dashboard/customize/profile/widgets");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save widget");
      }
    });
  };

  const handleRevert = () => {
    if (isEditing) {
      setRepoString(initialTargetId);
      setImageShape(initialImageShape);
      setShowBackgroundOverlay(initialShowBackgroundOverlay);
      setShowStars(initialShowStars);
      setShowForks(initialShowForks);
      setShowWatchers(initialShowWatchers);
      setShowOpenIssues(initialShowOpenIssues);
      setShowPrimaryLanguage(initialShowPrimaryLanguage);
      setShowViewButton(initialShowViewButton);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const [ownerName] = cleanRepo.split("/");
  const langColor = repoData?.language ? LANGUAGE_COLORS[repoData.language] || "#609fda" : "#609fda";

  return (
    <>
      <div className="w-full flex flex-col gap-6 pb-24">
        {/* Top 2-Column Grid: Account on Left, Live Preview on Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side: Account Settings Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Account</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Tell us which repository this widget should fetch.
              </p>
            </div>

            {/* Repository Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">GitHub Repository</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={repoString}
                  onChange={(e) => setRepoString(e.target.value)}
                  placeholder="torvalds/linux"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Format as &apos;owner/repository&apos; or full repository link (e.g. &apos;shadcn/ui&apos;).
              </p>
            </div>
          </div>

          {/* Right Side: Live GitHub Repo Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidRepo ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a valid GitHub repository (owner/repo) to see live preview
                  </span>
                </div>
              ) : loadingPreview && !repoData ? (
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
                  {showViewButton && <div className="w-12 h-7 bg-white/[0.05] rounded-xl shrink-0" />}
                </div>
              ) : !repoData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Repository not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find a GitHub repository with that name.
                    </span>
                  </div>
                </div>
              ) : (
                /* Live GitHub Repo Widget Card */
                <div className="relative w-full overflow-hidden rounded-[20px] bg-[#101010] border border-white/10 p-4 transition-all duration-200 shadow-md">
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

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Owner Avatar */}
                      <div
                        className={`relative w-[62px] h-[62px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
                          imageShape === "square"
                            ? "rounded-none"
                            : imageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
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

                      {/* Info + Counts */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[15px] font-normal text-white tracking-tight truncate">
                            {repoData.full_name || cleanRepo}
                          </span>
                        </div>

                        {(showStars || showForks || showWatchers || showOpenIssues || (showPrimaryLanguage && repoData.language)) && (
                          <div className="flex items-center gap-2.5 text-[12px] text-white/60 font-normal">
                            {showPrimaryLanguage && repoData.language && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: langColor }} />
                                <span className="text-white/80">{repoData.language}</span>
                              </div>
                            )}

                            {showStars && (
                              <div className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span className="text-white/90 font-medium">
                                  {Number(repoData.stargazers_count || 0).toLocaleString()}
                                </span>
                              </div>
                            )}

                            {showForks && (
                              <div className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
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
                              <div className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                <span className="text-white/90 font-medium">
                                  {Number(repoData.subscribers_count || 0).toLocaleString()}
                                </span>
                              </div>
                            )}

                            {showOpenIssues && (
                              <div className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
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
                        )}
                      </div>
                    </div>

                    {/* View Repo Button */}
                    {showViewButton && (
                      <div className="pt-0.5">
                        <a
                          href={repoData.html_url || `https://github.com/${encodeURIComponent(cleanRepo)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#609fda]/20 hover:bg-[#609fda]/30 border border-[#609fda]/30 rounded-xl text-[12px] font-medium text-white transition-all duration-150 shadow-[0_0_12px_rgba(96,159,218,0.15)] shrink-0"
                        >
                          <span>View</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Dedicated Full-Width Repo Customization Container */}
        <GitHubRepoCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showBackgroundOverlay={showBackgroundOverlay}
          onShowBackgroundOverlayChange={setShowBackgroundOverlay}
          showStars={showStars}
          onShowStarsChange={setShowStars}
          showForks={showForks}
          onShowForksChange={setShowForks}
          showWatchers={showWatchers}
          onShowWatchersChange={setShowWatchers}
          showOpenIssues={showOpenIssues}
          onShowOpenIssuesChange={setShowOpenIssues}
          showPrimaryLanguage={showPrimaryLanguage}
          onShowPrimaryLanguageChange={setShowPrimaryLanguage}
          showViewButton={showViewButton}
          onShowViewButtonChange={setShowViewButton}
        />
      </div>

      {/* Floating Save/Add Widget Bar */}
      <SaveBar
        show={isChanged || !isEditing}
        onSave={handleSaveWidgetConfirm}
        onRevert={handleRevert}
        saveLabel={isEditing ? "Save" : "Add widget"}
        revertLabel={isEditing ? "Revert" : "Cancel"}
      />
    </>
  );
}
