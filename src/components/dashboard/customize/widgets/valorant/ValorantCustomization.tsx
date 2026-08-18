"use client";

import PlacementSetting from "@/components/dashboard/customize/widgets/discord-presence/settings/PlacementSetting";
import RankModeSetting from "./settings/RankModeSetting";
import ValorantAvatarSetting from "./settings/ValorantAvatarSetting";
import ValorantBackgroundSetting from "./settings/ValorantBackgroundSetting";
import MatchSourceSetting from "./settings/MatchSourceSetting";
import ShowRankSetting from "./settings/ShowRankSetting";
import RankStyleSetting from "./settings/RankStyleSetting";
import ShowRRSetting from "./settings/ShowRRSetting";
import ShowLevelSetting from "./settings/ShowLevelSetting";
import ShowViewButtonSetting from "./settings/ShowViewButtonSetting";

interface ValorantCustomizationProps {
  placement: "inside" | "outside";
  onPlacementChange: (val: "inside" | "outside") => void;
  rankMode: "current" | "highest";
  onRankModeChange: (val: "current" | "highest") => void;
  avatarIcon: "rank-icon" | "last-agent";
  onAvatarIconChange: (val: "rank-icon" | "last-agent") => void;
  background: "none" | "player-card" | "last-map";
  onBackgroundChange: (val: "none" | "player-card" | "last-map") => void;
  matchSource: "any" | "competitive";
  onMatchSourceChange: (val: "any" | "competitive") => void;
  showRank: boolean;
  onShowRankChange: (val: boolean) => void;
  rankStyle: "name" | "icon";
  onRankStyleChange: (val: "name" | "icon") => void;
  showRR: boolean;
  onShowRRChange: (val: boolean) => void;
  showLevel: boolean;
  onShowLevelChange: (val: boolean) => void;
  showViewButton: boolean;
  onShowViewButtonChange: (val: boolean) => void;
}

export default function ValorantCustomization({
  placement,
  onPlacementChange,
  rankMode,
  onRankModeChange,
  avatarIcon,
  onAvatarIconChange,
  background,
  onBackgroundChange,
  matchSource,
  onMatchSourceChange,
  showRank,
  onShowRankChange,
  rankStyle,
  onRankStyleChange,
  showRR,
  onShowRRChange,
  showLevel,
  onShowLevelChange,
  showViewButton,
  onShowViewButtonChange,
}: ValorantCustomizationProps) {
  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Valorant Customization</h2>
        <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
          Toggle and customize how this widget displays on your profile.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PlacementSetting value={placement} onChange={onPlacementChange} />
        <RankModeSetting value={rankMode} onChange={onRankModeChange} />
        <ValorantAvatarSetting value={avatarIcon} onChange={onAvatarIconChange} />
        <ValorantBackgroundSetting value={background} onChange={onBackgroundChange} />
        <MatchSourceSetting value={matchSource} onChange={onMatchSourceChange} />
        <ShowRankSetting value={showRank} onChange={onShowRankChange} />
        <RankStyleSetting value={rankStyle} onChange={onRankStyleChange} disabled={!showRank} />
        <ShowRRSetting value={showRR} onChange={onShowRRChange} disabled={rankMode !== "current"} />
        <ShowLevelSetting value={showLevel} onChange={onShowLevelChange} />
        <ShowViewButtonSetting value={showViewButton} onChange={onShowViewButtonChange} />
      </div>
    </div>
  );
}
