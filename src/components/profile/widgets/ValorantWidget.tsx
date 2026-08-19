"use client";

import { useValorantPlayer } from "@/lib/hooks/useValorantPlayer";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { getRankIconUrl, getAgentIconUrl, getMapSplashUrl } from "@/lib/valorant";
import OverflowPingPong from "./OverflowPingPong";

export default function ValorantWidget({ widget }: { widget: WidgetItem }) {
  const cleanId = widget.targetId.trim();
  const { data: valorantData, loading } = useValorantPlayer(cleanId);

  const rankMode = widget.valorantRankMode || "current";
  const avatarIcon = widget.valorantAvatar || "rank-icon";
  const background = widget.valorantBackground || "last-map";
  const matchSource = widget.valorantMatchSource || "competitive";
  const showRank = widget.showRank !== undefined ? widget.showRank : true;
  const rankStyle = widget.valorantRankStyle || "name";
  const showRR = widget.showRR !== undefined ? widget.showRR : true;
  const showLevel = widget.showLevel !== undefined ? widget.showLevel : true;
  const showViewButton = widget.showViewButton !== undefined ? widget.showViewButton : true;

  if (loading || !valorantData) {
    return (
      <div className="w-full h-[104px] p-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[24px] shadow-md flex items-center justify-between box-border">
        <div className="flex items-center gap-3.5 min-w-0 w-full">
          <div className="w-[60px] h-[60px] shrink-0 bg-white/[0.05] rounded-2xl" />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
            <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const rankData = rankMode === "highest" ? valorantData.highest_rank : valorantData.current_rank;
  const matchData =
    matchSource === "competitive"
      ? valorantData.last_matches?.competitive
      : valorantData.last_matches?.any;

  const rankIconUrl = getRankIconUrl(rankData.tier);
  const avatarUrl =
    avatarIcon === "last-agent" && matchData?.agent
      ? getAgentIconUrl(matchData.agent)
      : rankIconUrl;

  const bgImageUrl =
    background === "player-card" && valorantData.card_id
      ? `https://media.valorant-api.com/playercards/${valorantData.card_id}/wideart.png`
      : background === "last-map" && matchData?.map
      ? getMapSplashUrl(matchData.map)
      : null;

  return (
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

      {/* Background Banner / Map Splash */}
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
        <div className="relative w-[60px] h-[60px] shrink-0 flex items-center justify-center">
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

        {/* Player Info & Badges */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Title with ping-pong overflow scroll */}
          <OverflowPingPong deps={[valorantData.name, valorantData.tag]}>
            <span className="text-[15.5px] font-medium text-white tracking-tight shrink-0">
              {valorantData.name}
            </span>
            <span className="text-[12px] font-mono text-white/40 shrink-0 ml-1.5">
              #{valorantData.tag}
            </span>
          </OverflowPingPong>

          {/* Badges / Stats */}
          <OverflowPingPong deps={[rankData, valorantData.current_rank, showRank, showRR, showLevel]}>
            <div className="flex items-center gap-2.5 text-[13px] text-white/70 font-normal whitespace-nowrap shrink-0">
              {/* Rank */}
              {showRank && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {rankIconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rankIconUrl} alt="" className="w-4 h-4 object-contain inline" />
                  )}
                  {rankStyle !== "icon" && (
                    <span className="text-white/90 font-normal">
                      {rankData?.tier_name || "Unrated"}
                    </span>
                  )}
                </div>
              )}

              {/* RR */}
              {showRR && rankMode === "current" && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                  </svg>
                  <span className="text-white/90 font-normal">
                    {valorantData.current_rank.rr} RR
                  </span>
                </div>
              )}

              {/* Level */}
              {showLevel && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-white/90 font-normal">
                    Level {valorantData.account_level}
                  </span>
                </div>
              )}
            </div>
          </OverflowPingPong>
        </div>
      </div>
    </a>
  );
}
