"use client";

import { useValorantPlayer } from "@/lib/hooks/useValorantPlayer";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { getRankIconUrl, getAgentIconUrl, getMapSplashUrl } from "@/lib/valorant";
import OverflowPingPong from "./OverflowPingPong";
import {
  ValorantFlameIcon,
  ValorantUserIcon,
  WidgetRedirectIcon,
} from "./WidgetIcons";
import WidgetSkeleton from "./WidgetSkeleton";
import WidgetUnavailable from "./WidgetUnavailable";

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

  if (loading) {
    return <WidgetSkeleton />;
  }

  if (!valorantData) {
    return <WidgetUnavailable label="Valorant profile" />;
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
          <WidgetRedirectIcon size={11} className="w-[11px] h-[11px]" />
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

        {/* Player Info & Badges */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
          {/* Title with ping-pong overflow scroll */}
          <OverflowPingPong deps={[valorantData.name, valorantData.tag]}>
            <span className="text-[14.5px] font-normal text-white/95 tracking-tight shrink-0">
              {valorantData.name}
            </span>
            <span className="text-[11.5px] font-mono text-white/40 shrink-0 ml-1.5">
              #{valorantData.tag}
            </span>
          </OverflowPingPong>

          {/* Badges / Stats */}
          <OverflowPingPong deps={[rankData, valorantData.current_rank, showRank, showRR, showLevel]}>
            <div className="flex items-center gap-2.5 text-[12.5px] font-normal leading-tight text-white/60 whitespace-nowrap shrink-0">
              {/* Rank */}
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

              {/* RR */}
              {showRR && rankMode === "current" && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <ValorantFlameIcon size={14} className="w-3.5 h-3.5 text-white/50 shrink-0" />
                  <span className="text-white/85">
                    {valorantData.current_rank.rr} RR
                  </span>
                </div>
              )}

              {/* Level */}
              {showLevel && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <ValorantUserIcon size={14} className="w-3.5 h-3.5 text-white/50 shrink-0" />
                  <span className="text-white/85">
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
