"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useGitHubUser } from "@/lib/hooks/useGitHubUser";
import { useGitHubContributions } from "@/lib/hooks/useGitHubContributions";
import GitHubUserCustomization from "@/components/dashboard/customize/widgets/github-user/GitHubUserCustomization";
import { toast } from "sonner";

const LEVEL_COLORS = [
  "bg-[#161b22] border border-white/[0.06]", // level 0
  "bg-[#0e4429] border border-[#006d32]/40", // level 1
  "bg-[#006d32] border border-[#26a641]/50", // level 2
  "bg-[#26a641] border border-[#39d353]/60 shadow-[0_0_6px_rgba(38,166,65,0.2)]", // level 3
  "bg-[#39d353] border border-[#39d353]/80 shadow-[0_0_10px_rgba(57,211,83,0.4)]", // level 4
];

export default function GitHubUserClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const isEditing = Boolean(widgetId);

  const initialTargetId = searchParams.get("id") || "";
  const currentWidget = ((user?.widgets as WidgetItem[]) || []).find((w) => w.id === widgetId);
  const initialImageShape = currentWidget?.imageShape || "rounded";
  const initialShowFollowers = currentWidget?.showFollowers !== undefined ? currentWidget.showFollowers : true;
  const initialShowFollowing = currentWidget?.showFollowing !== undefined ? currentWidget.showFollowing : true;
  const initialShowPublicRepos = currentWidget?.showPublicRepos !== undefined ? currentWidget.showPublicRepos : true;
  const initialShowViewButton = currentWidget?.showViewButton !== undefined ? currentWidget.showViewButton : true;
  const initialShowBackgroundOverlay = currentWidget?.showBackgroundOverlay !== undefined ? currentWidget.showBackgroundOverlay : true;
  const initialShowContributionHeatmap = currentWidget?.showContributionHeatmap !== undefined ? currentWidget.showContributionHeatmap : false;
  const initialPlacement = currentWidget?.placement || "inside";

  const [username, setUsername] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showFollowers, setShowFollowers] = useState<boolean>(initialShowFollowers);
  const [showFollowing, setShowFollowing] = useState<boolean>(initialShowFollowing);
  const [showPublicRepos, setShowPublicRepos] = useState<boolean>(initialShowPublicRepos);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);
  const [showBackgroundOverlay, setShowBackgroundOverlay] = useState<boolean>(initialShowBackgroundOverlay);
  const [showContributionHeatmap, setShowContributionHeatmap] = useState<boolean>(initialShowContributionHeatmap);

  const cleanUsername = username
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");

  const { data: userData, loading: loadingPreview, isValidUser } = useGitHubUser(cleanUsername);
  const { contributions } = useGitHubContributions(cleanUsername, showContributionHeatmap);

  const isChanged =
    cleanUsername !== initialTargetId ||
    imageShape !== initialImageShape ||
    showFollowers !== initialShowFollowers ||
    showFollowing !== initialShowFollowing ||
    showPublicRepos !== initialShowPublicRepos ||
    showViewButton !== initialShowViewButton ||
    showBackgroundOverlay !== initialShowBackgroundOverlay ||
    showContributionHeatmap !== initialShowContributionHeatmap ||
    placement !== initialPlacement;

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidUser) {
      toast.error("Please enter a valid GitHub username (e.g. octocat)");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    if (isEditing) {
      updated = existingList.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              targetId: cleanUsername,
              imageShape,
              showFollowers,
              showFollowing,
              showPublicRepos,
              showViewButton,
              showBackgroundOverlay,
              showContributionHeatmap,
              placement,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "github",
        type: "github-user",
        targetId: cleanUsername,
        useLinked: false,
        enabled: true,
        imageShape,
        showFollowers,
        showFollowing,
        showPublicRepos,
        showViewButton,
        showBackgroundOverlay,
        showContributionHeatmap,
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
      setUsername(initialTargetId);
      setImageShape(initialImageShape);
      setShowFollowers(initialShowFollowers);
      setShowFollowing(initialShowFollowing);
      setShowPublicRepos(initialShowPublicRepos);
      setShowViewButton(initialShowViewButton);
      setShowBackgroundOverlay(initialShowBackgroundOverlay);
      setShowContributionHeatmap(initialShowContributionHeatmap);
      setPlacement(initialPlacement);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const avatarUrl = `/api/widgets/github/avatar/${encodeURIComponent(cleanUsername || "github")}`;

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
                Tell us which account this widget should fetch.
              </p>
            </div>

            {/* Username Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">GitHub Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. octocat"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                The GitHub username or URL of the profile you want to display.
              </p>
            </div>
          </div>

          {/* Right Side: Live GitHub User Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidUser ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a valid GitHub username to see live preview
                  </span>
                </div>
              ) : loadingPreview && !userData ? (
                <div className={`w-full ${showViewButton ? "py-3.5" : "h-[98px]"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[20px] px-4 shadow-md flex flex-col justify-center gap-2.5`}>
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
                  {showViewButton && <div className="w-full h-8 bg-white/[0.05] rounded-xl shrink-0" />}
                </div>
              ) : !userData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      User not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find a GitHub user with that username.
                    </span>
                  </div>
                </div>
              ) : (
                /* Live GitHub User Widget Card */
                <div className={`relative w-full overflow-hidden rounded-[20px] bg-[#101010] border border-white/10 ${showViewButton ? "py-3.5 px-4" : "h-[98px] px-4"} flex flex-col justify-center gap-2.5 transition-all duration-200 shadow-md`}>
                  {/* Background Avatar Ambient Overlay */}
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

                  <div className="relative z-10 flex flex-col gap-2.5 w-full">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      {/* Avatar */}
                      <div
                        className={`relative w-[52px] h-[52px] shrink-0 overflow-hidden bg-[#181818] border border-white/10 shadow-sm flex items-center justify-center ${
                          imageShape === "square"
                            ? "rounded-none"
                            : imageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
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

                      {/* Info + Counts */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[15px] font-normal text-white tracking-tight truncate">
                            {userData.name || userData.login}
                          </span>
                          {userData.name && (
                            <span className="text-[12px] font-mono text-white/40 truncate">
                              @{userData.login}
                            </span>
                          )}
                        </div>

                        {(showFollowers || showFollowing || showPublicRepos) && (
                          <div className="flex items-center gap-2.5 text-[12px] text-white/60 font-normal whitespace-nowrap">
                            {showFollowers && (
                              <div className="flex items-center gap-1">
                                <span className="text-white/90 font-medium">
                                  {Number(userData.followers || 0).toLocaleString()}
                                </span>
                                <span className="text-white/40">followers</span>
                              </div>
                            )}
                            {showFollowing && (
                              <div className="flex items-center gap-1">
                                <span className="text-white/90 font-medium">
                                  {Number(userData.following || 0).toLocaleString()}
                                </span>
                                <span className="text-white/40">following</span>
                              </div>
                            )}
                            {showPublicRepos && (
                              <div className="flex items-center gap-1">
                                <span className="text-white/90 font-medium">
                                  {Number(userData.public_repos || 0).toLocaleString()}
                                </span>
                                <span className="text-white/40">repos</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    {showViewButton && (
                      <a
                        href={userData.html_url || `https://github.com/${encodeURIComponent(cleanUsername)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-8 px-7 py-2.5 bg-[#1a2b3c] hover:bg-[#1a2b3c]/90 text-[#80bbf2] border border-[#609fda]/25 rounded-xl font-normal text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <span>View Profile</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Dedicated Full-Width User Customization Container */}
        <GitHubUserCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showFollowers={showFollowers}
          onShowFollowersChange={setShowFollowers}
          showFollowing={showFollowing}
          onShowFollowingChange={setShowFollowing}
          showPublicRepos={showPublicRepos}
          onShowPublicReposChange={setShowPublicRepos}
          showViewButton={showViewButton}
          onShowViewButtonChange={setShowViewButton}
          showBackgroundOverlay={showBackgroundOverlay}
          onShowBackgroundOverlayChange={setShowBackgroundOverlay}
          showContributionHeatmap={showContributionHeatmap}
          onShowContributionHeatmapChange={setShowContributionHeatmap}
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
