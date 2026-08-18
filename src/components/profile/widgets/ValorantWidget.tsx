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
    <div className={`w-full ${showViewButton ? "h-[116px] p-3.5" : "h-[88px] px-3.5 py-3"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[22px] shadow-md overflow-hidden flex flex-col justify-between relative box-border`}>
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

      <div className="flex flex-col justify-between h-full relative z-10 w-full">
        <div className="flex items-center gap-3 min-w-0 w-full">
          {/* Avatar Icon */}
          <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
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

          {/* Player Info & Badges */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
            {/* Title with ping-pong overflow scroll */}
            <OverflowPingPong deps={[valorantData.name, valorantData.tag]}>
              <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
                {valorantData.name}
              </span>
              <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-1">
                #{valorantData.tag}
              </span>
            </OverflowPingPong>

            {/* Badges / Stats */}
            <OverflowPingPong deps={[rankData, valorantData.current_rank, showRank, showRR, showLevel]}>
              <div className="flex items-center gap-2 text-[12px] text-white/70 font-normal whitespace-nowrap shrink-0">
                {/* Rank */}
                {showRank && (
                  <div className="flex items-center gap-1 shrink-0">
                    {rankIconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rankIconUrl} alt="" className="w-3.5 h-3.5 object-contain inline" />
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
                    <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
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
                    <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 shrink-0">
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

        {/* View Button (Below) */}
        {showViewButton && (
          <a
            href={`https://tracker.gg/valorant/profile/riot/${encodeURIComponent(valorantData.name)}%23${encodeURIComponent(valorantData.tag)}/overview`}
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
