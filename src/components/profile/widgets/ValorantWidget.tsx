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
    <div className={`w-full ${showViewButton ? "py-3.5" : "h-[98px]"} bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[26px] shadow-md overflow-hidden flex flex-col justify-center relative box-border`}>
      {/* Background Banner / Map Splash */}
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

          {/* Player Info & Badges */}
          <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
            {/* Title with ping-pong overflow scroll */}
            <OverflowPingPong deps={[valorantData.name, valorantData.tag]}>
              <span className="text-[16px] font-normal text-white/95 tracking-tight shrink-0">
                {valorantData.name}
              </span>
              <span className="text-[12.5px] font-mono text-white/40 shrink-0 ml-1.5">
                #{valorantData.tag}
              </span>
            </OverflowPingPong>

            {/* Badges / Stats */}
            <OverflowPingPong deps={[rankData, valorantData.current_rank, showRank, showRR, showLevel]}>
              <div className="flex items-center gap-2 text-[12px] text-white/70 font-normal whitespace-nowrap shrink-0">
                {/* Rank */}
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                      <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.7 9.8 1.9 6.2 3.8-2 3.8 2 1.9-6.2a6.9 6.9 0 0 1-5.7 1.2 6.9 6.9 0 0 1-5.7-1.2z" />
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
  );
}
