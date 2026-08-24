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
import WidgetSkeleton from "@/components/profile/widgets/WidgetSkeleton";

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
                <WidgetSkeleton />
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
                <a
                  href={`https://tracker.gg/valorant/profile/riot/${encodeURIComponent(valorantData.name)}%23${encodeURIComponent(valorantData.tag)}/overview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-[#141414]/90 flex items-center justify-between relative box-border cursor-pointer"
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

                  {/* Background Layer */}
                  {bgImageUrl && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bgImageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-80 scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/80 via-[#101010]/50 to-[#101010]/40" />
                    </div>
                  )}

                  <div className="flex items-center gap-3.5 min-w-0 w-full relative z-10">
                    {/* Avatar Icon */}
                    <div className="relative w-[74px] h-[74px] shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-full h-full object-contain block transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/10" />
                      )}
                    </div>

                    {/* Info + Badges */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[14.5px] font-normal text-white/95 tracking-tight truncate">
                          {valorantData.name}
                        </span>
                        <span className="text-[11.5px] font-mono text-white/40 truncate">
                          #{valorantData.tag}
                        </span>
                      </div>

                      {/* Badges / Stats */}
                      <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap overflow-hidden">
                        {showRank && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {rankIconUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={rankIconUrl} alt="" className="w-3.5 h-3.5 object-contain inline" />
                            )}
                            {rankStyle !== "icon" && (
                              <span className="text-white/85">
                                {rankData?.tier_name || "Unrated"}
                              </span>
                            )}
                          </div>
                        )}

                        {showRR && rankMode === "current" && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 shrink-0">
                              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                            </svg>
                            <span className="text-white/85">
                              {valorantData.current_rank.rr} RR
                            </span>
                          </div>
                        )}

                        {showLevel && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 shrink-0">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="text-white/85">
                              Level {valorantData.account_level}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
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
