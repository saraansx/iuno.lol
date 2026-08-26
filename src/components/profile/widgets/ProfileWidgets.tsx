"use client";

import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import DiscordPresenceWidget from "./DiscordPresenceWidget";
import DiscordServerWidget from "./DiscordServerWidget";
import GitHubUserWidget from "./GitHubUserWidget";
import GitHubRepoWidget from "./GitHubRepoWidget";
import PinterestProfileWidget from "./PinterestProfileWidget";
import PinterestBoardWidget from "./PinterestBoardWidget";
import ValorantWidget from "./ValorantWidget";
import SteamWidget from "./SteamWidget";
import GenshinWidget from "./GenshinWidget";
import TwitchWidget from "./TwitchWidget";
import SpotifyWidget from "./SpotifyWidget";
import InstagramWidget from "./InstagramWidget";
import TikTokWidget from "./TikTokWidget";
import YouTubeWidget from "./YouTubeWidget";
import TelegramWidget from "./TelegramWidget";
import RobloxWidget from "./RobloxWidget";

function renderWidget(w: WidgetItem) {
  if (w.type === "presence") {
    return <DiscordPresenceWidget widget={w} />;
  }
  if (w.type === "server") {
    return <DiscordServerWidget widget={w} />;
  }
  if (w.type === "github-user" || w.type === "user") {
    return <GitHubUserWidget widget={w} />;
  }
  if (w.type === "github-repo" || w.type === "repo") {
    return <GitHubRepoWidget widget={w} />;
  }
  if (w.type === "pinterest-profile") {
    return <PinterestProfileWidget widget={w} />;
  }
  if (w.type === "pinterest-board") {
    return <PinterestBoardWidget widget={w} />;
  }
  if (w.type === "valorant-profile" || w.platform === "valorant") {
    return <ValorantWidget widget={w} />;
  }
  if (w.type === "steam-profile" || w.platform === "steam") {
    return <SteamWidget widget={w} />;
  }
  if (w.type === "genshin-profile" || w.platform === "genshin") {
    return <GenshinWidget widget={w} />;
  }
  if (w.type === "twitch-channel" || w.platform === "twitch") {
    return <TwitchWidget widget={w} />;
  }
  if (w.platform === "spotify" || w.type?.startsWith("spotify-")) {
    return <SpotifyWidget widget={w} />;
  }
  if (w.type === "instagram-profile" || w.platform === "instagram") {
    return <InstagramWidget widget={w} />;
  }
  if (w.type === "tiktok-profile" || w.platform === "tiktok") {
    return <TikTokWidget widget={w} />;
  }
  if (w.type === "youtube-profile" || w.platform === "youtube") {
    return <YouTubeWidget widget={w} />;
  }
  if (w.type === "telegram-profile" || w.platform === "telegram") {
    return <TelegramWidget widget={w} />;
  }
  if (w.type === "roblox-profile" || w.platform === "roblox") {
    return <RobloxWidget widget={w} />;
  }
  return null;
}

export default function ProfileWidgets({
  widgets = [],
  placement = "inside",
}: {
  widgets?: WidgetItem[];
  placement?: "inside" | "outside";
}) {
  const activeWidgets = (widgets || []).filter(
    (w) => w.enabled && (w.placement || "inside") === placement
  );

  if (activeWidgets.length === 0) return null;

  if (activeWidgets.length === 1) {
    const w = activeWidgets[0];
    return (
      <div
        className={`w-full mt-4 flex justify-center items-center ${
          placement === "outside" ? "z-10" : ""
        }`}
      >
        <div className="w-full max-w-[340px]">
          {renderWidget(w)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full mt-4 grid grid-cols-1 min-[640px]:grid-cols-2 gap-3 ${
        placement === "outside" ? "z-10" : ""
      }`}
    >
      {activeWidgets.map((w) => (
        <div key={w.id} className="w-full min-w-0">
          {renderWidget(w)}
        </div>
      ))}
    </div>
  );
}
