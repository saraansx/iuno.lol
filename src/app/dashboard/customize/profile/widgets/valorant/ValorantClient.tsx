"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useValorantPlayer } from "@/lib/hooks/useValorantPlayer";
import { getRankIconUrl, getAgentIconUrl, getMapSplashUrl } from "@/lib/valorant";
import SaveBar from "@/components/dashboard/SaveBar";
import ValorantCustomization from "@/components/dashboard/customize/widgets/valorant/ValorantCustomization";
import { toast } from "sonner";

export default function ValorantClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetIdParam = searchParams.get("widgetId");
  const idParam = searchParams.get("id") || "";

  const existingWidgets = useMemo(
    () => ((user?.widgets as WidgetItem[]) || []),
    [user?.widgets]
  );

  const existingWidget = useMemo(
    () =>
      widgetIdParam
        ? existingWidgets.find((w) => w.id === widgetIdParam)
        : existingWidgets.find((w) => w.platform === "valorant"),
    [existingWidgets, widgetIdParam]
  );

  const isEditing = Boolean(widgetIdParam && existingWidget);

  const initialTargetId = existingWidget?.targetId || idParam || "";
  const initialPlacement = (existingWidget?.placement || "inside") as "inside" | "outside";
  const initialRankMode = (existingWidget?.valorantRankMode || "current") as "current" | "highest";
  const initialAvatarIcon = (existingWidget?.valorantAvatar || "rank-icon") as "rank-icon" | "last-agent";
  const initialBackground = (existingWidget?.valorantBackground || "last-map") as "none" | "player-card" | "last-map";
  const initialMatchSource = (existingWidget?.valorantMatchSource || "competitive") as "any" | "competitive";
  const initialShowRank = existingWidget?.showRank !== undefined ? existingWidget.showRank : true;
  const initialRankStyle = (existingWidget?.valorantRankStyle || "name") as "name" | "icon";
  const initialShowRR = existingWidget?.showRR !== undefined ? existingWidget.showRR : true;
  const initialShowLevel = existingWidget?.showLevel !== undefined ? existingWidget.showLevel : true;
  const initialShowViewButton = existingWidget?.showViewButton !== undefined ? existingWidget.showViewButton : true;

  const [riotId, setRiotId] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [rankMode, setRankMode] = useState<"current" | "highest">(initialRankMode);
  const [avatarIcon, setAvatarIcon] = useState<"rank-icon" | "last-agent">(initialAvatarIcon);
  const [background, setBackground] = useState<"none" | "player-card" | "last-map">(initialBackground);
  const [matchSource, setMatchSource] = useState<"any" | "competitive">(initialMatchSource);
  const [showRank, setShowRank] = useState<boolean>(initialShowRank);
  const [rankStyle, setRankStyle] = useState<"name" | "icon">(initialRankStyle);
  const [showRR, setShowRR] = useState<boolean>(initialShowRR);
  const [showLevel, setShowLevel] = useState<boolean>(initialShowLevel);
  const [showViewButton, setShowViewButton] = useState<boolean>(initialShowViewButton);

  const [, startTransition] = useTransition();

  const { data: valorantData, loading: loadingPreview, isValidRiotId } = useValorantPlayer(riotId);

  const isChanged = useMemo(() => {
    if (!isEditing) {
      return Boolean(riotId.trim());
    }
    return (
      riotId.trim() !== initialTargetId ||
      placement !== initialPlacement ||
      rankMode !== initialRankMode ||
      avatarIcon !== initialAvatarIcon ||
      background !== initialBackground ||
      matchSource !== initialMatchSource ||
      showRank !== initialShowRank ||
      rankStyle !== initialRankStyle ||
      showRR !== initialShowRR ||
      showLevel !== initialShowLevel ||
      showViewButton !== initialShowViewButton
    );
  }, [
    isEditing,
    riotId,
    placement,
    rankMode,
    avatarIcon,
    background,
    matchSource,
    showRank,
    rankStyle,
    showRR,
    showLevel,
    showViewButton,
    initialTargetId,
    initialPlacement,
    initialRankMode,
    initialAvatarIcon,
    initialBackground,
    initialMatchSource,
    initialShowRank,
    initialRankStyle,
    initialShowRR,
    initialShowLevel,
    initialShowViewButton,
  ]);

  const handleSaveWidgetConfirm = () => {
    const cleanId = riotId.trim();
    if (!cleanId || !cleanId.includes("#")) {
      toast.error("Please enter a valid Riot ID in name#tag format");
      return;
    }

    const existingList = existingWidgets.filter(
      (w) => w.id !== (existingWidget?.id || "valorant") && w.type !== "valorant-profile"
    );

    let updated: WidgetItem[];

    if (isEditing && existingWidget) {
      updated = existingWidgets.map((w) =>
        w.id === existingWidget.id
          ? {
              ...w,
              targetId: cleanId,
              placement,
              valorantRankMode: rankMode,
              valorantAvatar: avatarIcon,
              valorantBackground: background,
              valorantMatchSource: matchSource,
              showRank,
              valorantRankStyle: rankStyle,
              showRR,
              showLevel,
              showViewButton,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "valorant",
        type: "valorant-profile",
        targetId: cleanId,
        useLinked: false,
        enabled: true,
        placement,
        valorantRankMode: rankMode,
        valorantAvatar: avatarIcon,
        valorantBackground: background,
        valorantMatchSource: matchSource,
        showRank,
        valorantRankStyle: rankStyle,
        showRR,
        showLevel,
        showViewButton,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
        if (!user?.username) return;
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
      setRiotId(initialTargetId);
      setPlacement(initialPlacement);
      setRankMode(initialRankMode);
      setAvatarIcon(initialAvatarIcon);
      setBackground(initialBackground);
      setMatchSource(initialMatchSource);
      setShowRank(initialShowRank);
      setRankStyle(initialRankStyle);
      setShowRR(initialShowRR);
      setShowLevel(initialShowLevel);
      setShowViewButton(initialShowViewButton);
    } else {
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  const rankData = rankMode === "highest" ? valorantData?.highest_rank : valorantData?.current_rank;
  const matchData =
    matchSource === "competitive"
      ? valorantData?.last_matches?.competitive
      : valorantData?.last_matches?.any;

  const rankIconUrl = rankData ? getRankIconUrl(rankData.tier) : getRankIconUrl(0);
  const avatarUrl =
    avatarIcon === "last-agent" && matchData?.agent
      ? getAgentIconUrl(matchData.agent)
      : rankIconUrl;

  const bgImageUrl =
    background === "player-card" && valorantData?.card_id
      ? `https://media.valorant-api.com/playercards/${valorantData.card_id}/wideart.png`
      : background === "last-map" && matchData?.map
      ? getMapSplashUrl(matchData.map)
      : null;

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

            {/* Riot ID Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Riot ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  placeholder="e.g. tenz#sen"
                  className="w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your Riot ID in &apos;name#tag&apos; format (e.g. &apos;tenz#sen&apos;). Find it on your Riot account page.
              </p>
            </div>
          </div>

          {/* Right Side: Live Valorant Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidRiotId ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a valid Riot ID (name#tag) to see live preview
                  </span>
                </div>
              ) : loadingPreview && !valorantData ? (
                <div className={`w-full ${showViewButton ? "py-3.5" : "h-[98px]"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] px-4.5 shadow-md flex flex-col justify-center gap-2.5 box-border`}>
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div className="w-[52px] h-[52px] shrink-0 bg-white/[0.05] rounded-2xl" />
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
                      <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                  {showViewButton && <div className="w-full h-8 bg-white/[0.05] rounded-xl shrink-0" />}
                </div>
              ) : !valorantData ? (
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Player not found
                    </span>
                    <span className="text-[12px] text-white/35">
                      Could not find a Valorant player with that Riot ID.
                    </span>
                  </div>
                </div>
              ) : (
                /* Live Valorant Widget Card Preview */
                <div className={`relative w-full ${showViewButton ? "py-3.5" : "h-[98px]"} overflow-hidden rounded-[26px] bg-[#101010]/80 backdrop-blur-md border border-white/10 shadow-md flex flex-col justify-center relative box-border`}>
                  {/* Background Layer */}
                  {bgImageUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bgImageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-45 scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/95 via-[#101010]/85 to-[#101010]/70" />
                    </div>
                  )}

                  <div className="px-4.5 flex flex-col gap-2.5 relative z-10 w-full">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                    {/* Avatar Icon */}
                    <div className="relative w-[52px] h-[52px] shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-full h-full object-contain block transition-transform duration-200 hover:scale-105"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-[16px] font-normal text-white/95 tracking-tight truncate">
                          {valorantData.name}
                        </span>
                        <span className="text-[12.5px] font-mono text-white/40 truncate">
                          #{valorantData.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-white/70 font-normal">
                        {/* Rank Info */}
                        {showRank && (
                          <div className="flex items-center gap-1 shrink-0">
                            {rankStyle === "icon" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={rankIconUrl} alt="" className="w-3.5 h-3.5 object-contain inline" />
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                                <path d="M19 4h-2V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v2a4 4 0 0 0 3.26 3.93 6.002 6.002 0 0 0 4.74 4.88V19H8a2 2 0 0 0-2 2v1h12v-1a2 2 0 0 0-2-2h-2v-3.19a6.002 6.002 0 0 0 4.74-4.88A4 4 0 0 0 22 9V7a3 3 0 0 0-3-3zM4 9V7a1 1 0 0 1 1-1h2v4.88A2 2 0 0 1 4 9zm16 0a2 2 0 0 1-3 1.88V6h2a1 1 0 0 1 1 1v2z" />
                              </svg>
                            )}
                            <span className="text-white/90 font-normal">
                              {rankData?.tier_name || "Unrated"}
                            </span>
                          </div>
                        )}

                        {/* RR */}
                        {showRR && rankMode === "current" && (
                          <div className="flex items-center gap-1 shrink-0">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                              <polygon points="13 2 4 13 11 13 9 22 20 9 13 9 13 2" />
                            </svg>
                            <span className="text-white/90 font-normal">
                              {valorantData.current_rank.rr} RR
                            </span>
                          </div>
                        )}

                        {/* Level */}
                        {showLevel && (
                          <div className="flex items-center gap-1 shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                              <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.7 9.8 1.9 6.2 3.8-2 3.8 2 1.9-6.2a6.9 6.9 0 0 1-5.7 1.2 6.9 6.9 0 0 1-5.7-1.2z" />
                            </svg>
                            <span className="text-white/90 font-normal">
                              Level {valorantData.account_level}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  {showViewButton && (
                    <a
                      href={`https://tracker.gg/valorant/profile/riot/${encodeURIComponent(valorantData.name)}%23${encodeURIComponent(valorantData.tag)}/overview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-8 px-3 bg-[#609fda]/15 hover:bg-[#609fda]/25 border border-[#609fda]/25 rounded-xl text-[12px] font-medium text-white transition-all duration-150 shadow-[0_0_12px_rgba(96,159,218,0.1)] flex items-center justify-center gap-1.5 shrink-0"
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
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Dedicated Full-Width Valorant Customization Container */}
        <ValorantCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          rankMode={rankMode}
          onRankModeChange={setRankMode}
          avatarIcon={avatarIcon}
          onAvatarIconChange={setAvatarIcon}
          background={background}
          onBackgroundChange={setBackground}
          matchSource={matchSource}
          onMatchSourceChange={setMatchSource}
          showRank={showRank}
          onShowRankChange={setShowRank}
          rankStyle={rankStyle}
          onRankStyleChange={setRankStyle}
          showRR={showRR}
          onShowRRChange={setShowRR}
          showLevel={showLevel}
          onShowLevelChange={setShowLevel}
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
