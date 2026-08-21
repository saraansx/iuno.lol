"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GenshinLogoIcon } from "@/components/profile/widgets/WidgetIcons";
import { parseSpotifyIdentifier } from "@/lib/spotify";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widget: { platform: string; type: string; useLinked: boolean; customId: string }) => void;
  linkedDiscordId?: string | null;
  linkedDiscordUsername?: string | null;
  hasPresenceWidget?: boolean;
  hasServerWidget?: boolean;
  hasGitHubUserWidget?: boolean;
  hasGitHubRepoWidget?: boolean;
  hasPinterestProfileWidget?: boolean;
  hasPinterestBoardWidget?: boolean;
  hasValorantWidget?: boolean;
  hasSteamWidget?: boolean;
  hasGenshinWidget?: boolean;
  hasTwitchWidget?: boolean;
  hasSpotifyWidget?: boolean;
  hasInstagramWidget?: boolean;
  hasTikTokWidget?: boolean;
}

const PLATFORMS = [
  { id: "none", name: "None" },
  { id: "discord", name: "Discord" },
  { id: "instagram", name: "Instagram" },
  { id: "tiktok", name: "TikTok" },
  { id: "spotify", name: "Spotify" },
  { id: "twitch", name: "Twitch" },
  { id: "github", name: "GitHub" },
  { id: "pinterest", name: "Pinterest" },
  { id: "valorant", name: "Valorant" },
  { id: "steam", name: "Steam" },
  { id: "genshin", name: "Genshin Impact" },
];

const SPOTIFY_TYPES = [
  { id: "spotify-track" as const, name: "Spotify Track", placeholder: "Track link, URI, or ID (e.g. 4cOdK2wGLETKBW3PvgPWqT)" },
  { id: "spotify-album" as const, name: "Spotify Album", placeholder: "Album link, URI, or ID (e.g. 1A2GTWGtXBfuI0x08OHWyJ)" },
  { id: "spotify-playlist" as const, name: "Spotify Playlist", placeholder: "Playlist link, URI, or ID (e.g. 37i9dQZF1DXcBWIGoYBM5M)" },
  { id: "spotify-artist" as const, name: "Spotify Artist", placeholder: "Artist link, URI, or ID (e.g. 06HL4z0CvFAxyc27GXpf02)" },
  { id: "spotify-user" as const, name: "Spotify User", placeholder: "User link, URI, or ID (e.g. spotify)" },
];

export default function AddWidgetModal({
  isOpen,
  onClose,
  onAdd,
  linkedDiscordId,
  linkedDiscordUsername,
  hasPresenceWidget = false,
  hasServerWidget = false,
  hasGitHubUserWidget = false,
  hasGitHubRepoWidget = false,
  hasPinterestProfileWidget = false,
  hasPinterestBoardWidget = false,
  hasValorantWidget = false,
  hasSteamWidget = false,
  hasGenshinWidget = false,
  hasTwitchWidget = false,
  hasSpotifyWidget = false,
  hasInstagramWidget = false,
  hasTikTokWidget = false,
}: AddWidgetModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("discord");
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isSpotifyTypeDropdownOpen, setIsSpotifyTypeDropdownOpen] = useState(false);
  const [customDiscordId, setCustomDiscordId] = useState("");
  const [serverId, setServerId] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [twitchUsername, setTwitchUsername] = useState("");
  const [spotifyInput, setSpotifyInput] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [pinterestUsername, setPinterestUsername] = useState("");
  const [pinterestBoard, setPinterestBoard] = useState("");
  const [valorantId, setValorantId] = useState("");
  const [steamId, setSteamId] = useState("");
  const [genshinUid, setGenshinUid] = useState("");
  const [customWidgetType, setCustomWidgetType] = useState<string | null>(null);
  const [useLinkedAccount, setUseLinkedAccount] = useState(Boolean(linkedDiscordId));
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const spotifyTypeDropdownRef = useRef<HTMLDivElement>(null);

  const defaultWidgetType =
    selectedPlatform === "discord"
      ? hasPresenceWidget && !hasServerWidget
        ? "server"
        : "presence"
      : selectedPlatform === "instagram"
      ? "instagram-profile"
      : selectedPlatform === "tiktok"
      ? "tiktok-profile"
      : selectedPlatform === "spotify"
      ? "spotify-track"
      : selectedPlatform === "twitch"
      ? "twitch-channel"
      : selectedPlatform === "github"
      ? hasGitHubUserWidget && !hasGitHubRepoWidget
        ? "github-repo"
        : "github-user"
      : selectedPlatform === "pinterest"
      ? hasPinterestProfileWidget && !hasPinterestBoardWidget
        ? "pinterest-board"
        : "pinterest-profile"
      : selectedPlatform === "valorant"
      ? "valorant-profile"
      : selectedPlatform === "steam"
      ? "steam-profile"
      : selectedPlatform === "genshin"
      ? "genshin-profile"
      : "presence";

  const widgetType = customWidgetType || defaultWidgetType;
  const setWidgetType = (t: string) => setCustomWidgetType(t);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPlatformDropdownOpen(false);
      }
      if (spotifyTypeDropdownRef.current && !spotifyTypeDropdownRef.current.contains(e.target as Node)) {
        setIsSpotifyTypeDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDiscord = selectedPlatform === "discord";
  const isInstagram = selectedPlatform === "instagram";
  const isTikTok = selectedPlatform === "tiktok";
  const isSpotify = selectedPlatform === "spotify";
  const isTwitch = selectedPlatform === "twitch";
  const isGitHub = selectedPlatform === "github";
  const isPinterest = selectedPlatform === "pinterest";
  const isValorant = selectedPlatform === "valorant";
  const isSteam = selectedPlatform === "steam";
  const isGenshin = selectedPlatform === "genshin";
  const isPresence = widgetType === "presence";
  const isServer = widgetType === "server";
  const isGitHubUser = widgetType === "github-user";
  const isGitHubRepo = widgetType === "github-repo";
  const isPinterestProfile = widgetType === "pinterest-profile";
  const isPinterestBoard = widgetType === "pinterest-board";

  const targetId = isDiscord
    ? isPresence
      ? useLinkedAccount
        ? linkedDiscordId || ""
        : customDiscordId.trim()
      : serverId.trim()
    : isInstagram
    ? instagramUsername.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/$/, "")
    : isTikTok
    ? tiktokUsername.trim().replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "").replace(/^@/, "").replace(/\/$/, "")
    : isSpotify
    ? spotifyInput.trim()
    : isTwitch
    ? twitchUsername.trim().replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "").replace(/\/$/, "")
    : isGitHub
    ? isGitHubUser
      ? githubUsername.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "")
      : githubRepo.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "")
    : isPinterest
    ? isPinterestProfile
      ? pinterestUsername.trim().replace(/^https?:\/\/(www\.)?pinterest\.com\//i, "").replace(/\/$/, "")
      : pinterestBoard.trim().replace(/^https?:\/\/(www\.)?pinterest\.com\//i, "").replace(/\/$/, "")
    : isValorant
    ? valorantId.trim()
    : isSteam
    ? steamId.trim().replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "").replace(/\/$/, "")
    : isGenshin
    ? genshinUid.trim()
    : "";

  const isFormatValid = isDiscord
    ? isPresence
      ? hasPresenceWidget
        ? false
        : useLinkedAccount
        ? Boolean(linkedDiscordId)
        : /^\d{17,20}$/.test(customDiscordId.trim())
      : hasServerWidget
      ? false
      : serverId.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "").length >= 2
    : isInstagram
    ? hasInstagramWidget
      ? false
      : /^[a-zA-Z0-9_.-]{1,30}$/.test(instagramUsername.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/$/, ""))
    : isTikTok
    ? hasTikTokWidget
      ? false
      : /^[a-zA-Z0-9_.-]{1,24}$/.test(tiktokUsername.trim().replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "").replace(/^@/, "").replace(/\/$/, ""))
    : isSpotify
    ? hasSpotifyWidget
      ? false
      : spotifyInput.trim().length >= 3
    : isTwitch
    ? hasTwitchWidget
      ? false
      : /^[a-zA-Z0-9_]{3,25}$/.test(twitchUsername.trim().replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "").replace(/\/$/, ""))
    : isGitHub
    ? isGitHubUser
      ? hasGitHubUserWidget
        ? false
        : /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(githubUsername.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, ""))
      : hasGitHubRepoWidget
      ? false
      : githubRepo.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "").split("/").length === 2 &&
        Boolean(githubRepo.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "").split("/")[0]) &&
        Boolean(githubRepo.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "").split("/")[1])
    : isPinterest
    ? isPinterestProfile
      ? hasPinterestProfileWidget
        ? false
        : /^[a-zA-Z0-9_]{1,30}$/.test(pinterestUsername.trim().replace(/^https?:\/\/(www\.)?pinterest\.com\//i, "").replace(/\/$/, ""))
      : hasPinterestBoardWidget
      ? false
      : pinterestBoard.trim().replace(/^https?:\/\/(www\.)?pinterest\.com\//i, "").replace(/\/$/, "").split("/").filter(Boolean).length >= 2
    : isValorant
    ? hasValorantWidget
      ? false
      : /^.{3,16}#[a-zA-Z0-9]{3,5}$/.test(valorantId.trim())
    : isSteam
    ? hasSteamWidget
      ? false
      : steamId.trim().replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "").replace(/\/$/, "").length >= 2
    : isGenshin
    ? hasGenshinWidget
      ? false
      : /^[1-9][0-9]{8,9}$/.test(genshinUid.trim())
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormatValid) return;

    if (isDiscord) {
      if (isPresence && useLinkedAccount && linkedDiscordId) {
        onAdd({
          platform: selectedPlatform,
          type: widgetType,
          useLinked: true,
          customId: linkedDiscordId,
        });
        onClose();
        return;
      }

      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isInstagram) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isTikTok) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isSpotify) {
      const parsed = parseSpotifyIdentifier(targetId);
      const resolvedId = parsed.id || targetId;
      const resolvedType = parsed.type ? `spotify-${parsed.type}` : widgetType;

      onAdd({
        platform: selectedPlatform,
        type: resolvedType,
        useLinked: false,
        customId: resolvedId,
      });
      onClose();
    } else if (isTwitch) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isGitHub) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isPinterest) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isValorant) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isSteam) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    } else if (isGenshin) {
      onAdd({
        platform: selectedPlatform,
        type: widgetType,
        useLinked: false,
        customId: targetId,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[440px] bg-[#0c0c0c] border border-white/10 rounded-[24px] p-6 shadow-2xl z-10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <h3 className="text-[16px] font-normal text-white/95 tracking-tight">Add a Widget</h3>
            <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
              Select platform and configure details for your page.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Platform Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-normal text-white/60">Platform</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
              className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {selectedPlatform === "discord" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                ) : selectedPlatform === "instagram" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E4405F" className="shrink-0">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                ) : selectedPlatform === "tiktok" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white shrink-0">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c.03-.03.07-.07.1-.1a6.3 6.3 0 0 0 1.87-4.52V8.71a8.28 8.28 0 0 0 4.76 1.49v-3.46a4.87 4.87 0 0 1-1-.05z" />
                  </svg>
                ) : selectedPlatform === "spotify" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1ED760" className="shrink-0">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                  </svg>
                ) : selectedPlatform === "twitch" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#9146FF" className="shrink-0">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                ) : selectedPlatform === "github" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                ) : selectedPlatform === "pinterest" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E60023" className="shrink-0">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                ) : selectedPlatform === "valorant" ? (
                  <svg width="18" height="18" viewBox="0 0 100 100" fill="#FF4655">
                    <path d="M9.9 14.5L5.7 20.4v40.3l37.2 38.6h11.1L9.9 14.5zm84.4 0L57.1 66.8h17.2L94.3 35V14.5z" />
                  </svg>
                ) : selectedPlatform === "steam" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white shrink-0">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM7.54 18.216l-1.464-.606c.263.568.736 1.015 1.328 1.246.885.344 1.875.05 2.434-.674-.326-.062-.644-.176-.932-.341-.607-.35-1.042-.907-1.226-1.562l-.14-.063zm8.4-11.455c-1.18 0-2.137.957-2.137 2.137 0 1.18.957 2.137 2.137 2.137 1.18 0 2.137-.957 2.137-2.137 0-1.18-.957-2.137-2.137-2.137zm0 .802c.737 0 1.335.598 1.335 1.335 0 .737-.598 1.335-1.335 1.335-.737 0-1.335-.598-1.335-1.335 0-.737.598-1.335 1.335-1.335z" />
                  </svg>
                ) : selectedPlatform === "genshin" ? (
                  <GenshinLogoIcon size={18} className="w-[18px] h-[18px] text-[#609fda] shrink-0" />
                ) : null}
                <span>{PLATFORMS.find((p) => p.id === selectedPlatform)?.name || "Select platform"}</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-white/40 transition-transform duration-200 ${isPlatformDropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isPlatformDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col gap-0.5 max-h-[308px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {PLATFORMS.map((platform) => {
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setIsPlatformDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                        selectedPlatform === platform.id
                          ? "bg-white/10 text-white font-normal"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {platform.id === "discord" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        ) : platform.id === "instagram" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#E4405F" className="shrink-0">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        ) : platform.id === "tiktok" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white shrink-0">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c.03-.03.07-.07.1-.1a6.3 6.3 0 0 0 1.87-4.52V8.71a8.28 8.28 0 0 0 4.76 1.49v-3.46a4.87 4.87 0 0 1-1-.05z" />
                          </svg>
                        ) : platform.id === "spotify" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ED760" className="shrink-0">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                          </svg>
                        ) : platform.id === "twitch" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#9146FF" className="shrink-0">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                          </svg>
                        ) : platform.id === "github" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                        ) : platform.id === "pinterest" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#E60023" className="shrink-0">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                          </svg>
                        ) : platform.id === "valorant" ? (
                          <svg width="16" height="16" viewBox="0 0 100 100" fill="#FF4655">
                            <path d="M9.9 14.5L5.7 20.4v40.3l37.2 38.6h11.1L9.9 14.5zm84.4 0L57.1 66.8h17.2L94.3 35V14.5z" />
                          </svg>
                        ) : platform.id === "steam" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM7.54 18.216l-1.464-.606c.263.568.736 1.015 1.328 1.246.885.344 1.875.05 2.434-.674-.326-.062-.644-.176-.932-.341-.607-.35-1.042-.907-1.226-1.562l-.14-.063zm8.4-11.455c-1.18 0-2.137.957-2.137 2.137 0 1.18.957 2.137 2.137 2.137 1.18 0 2.137-.957 2.137-2.137 0-1.18-.957-2.137-2.137-2.137zm0 .802c.737 0 1.335.598 1.335 1.335 0 .737-.598 1.335-1.335 1.335-.737 0-1.335-.598-1.335-1.335 0-.737.598-1.335 1.335-1.335z" />
                          </svg>
                        ) : platform.id === "genshin" ? (
                          <GenshinLogoIcon size={16} className="w-4 h-4 text-[#609fda] shrink-0" />
                        ) : null}
                        <span>{platform.name}</span>
                      </div>
                      {selectedPlatform === platform.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#609fda]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {isInstagram && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="text-[12px] font-normal text-white/60">Instagram Username</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
              <input
                type="text"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="e.g. zuck"
                maxLength={30}
                className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-white/30 leading-normal mt-0.5">
              Your Instagram username or profile URL (e.g. &apos;zuck&apos; or instagram.com/zuck).
            </p>
          </div>
        )}

        {isTikTok && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="text-[12px] font-normal text-white/60">TikTok Username</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
              <input
                type="text"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                placeholder="e.g. charlidamelio"
                maxLength={24}
                className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-white/30 leading-normal mt-0.5">
              Your TikTok username or profile URL (e.g. &apos;charlidamelio&apos; or tiktok.com/@charlidamelio).
            </p>
          </div>
        )}

        {isSpotify && (
          <>
            {/* Spotify Item Type Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-normal text-white/60">Type</label>
              <div className="relative" ref={spotifyTypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSpotifyTypeDropdownOpen(!isSpotifyTypeDropdownOpen)}
                  className="w-full flex items-center justify-between bg-[#161616] border border-white/5 rounded-xl px-4 py-2.5 text-[13.5px] text-white/90 hover:border-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ED760" className="shrink-0">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                    </svg>
                    <span>{SPOTIFY_TYPES.find((t) => t.id === widgetType)?.name || "Spotify Track"}</span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-white/40 transition-transform duration-200 ${isSpotifyTypeDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isSpotifyTypeDropdownOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 p-1 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50 flex flex-col gap-0.5">
                    {SPOTIFY_TYPES.map((typeOption) => (
                      <button
                        key={typeOption.id}
                        type="button"
                        onClick={() => {
                          setWidgetType(typeOption.id);
                          setIsSpotifyTypeDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                          widgetType === typeOption.id
                            ? "bg-white/10 text-white font-normal"
                            : "text-white/50 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{typeOption.name}</span>
                        {widgetType === typeOption.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1ED760]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Spotify Identifier Input */}
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
              <label className="text-[12px] font-normal text-white/60">
                {SPOTIFY_TYPES.find((t) => t.id === widgetType)?.name || "Spotify Item"} Link or ID
              </label>
              <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                <input
                  type="text"
                  value={spotifyInput}
                  onChange={(e) => setSpotifyInput(e.target.value)}
                  placeholder={
                    SPOTIFY_TYPES.find((t) => t.id === widgetType)?.placeholder ||
                    "Enter Spotify link, URI, or ID"
                  }
                  className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                Paste the full Spotify share link (open.spotify.com/...), URI (spotify:track:...), or ID.
              </p>
            </div>
          </>
        )}

        {isDiscord && (
          <>
            {/* Widget Type */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-normal text-white/60">Type</label>
              <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-white/5 rounded-xl">
                <button
                  type="button"
                  disabled={hasPresenceWidget}
                  onClick={() => setWidgetType("presence")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasPresenceWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "presence"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  Discord Presence
                </button>
                <button
                  type="button"
                  disabled={hasServerWidget}
                  onClick={() => setWidgetType("server")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasServerWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "server"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  Discord Server
                </button>
              </div>
            </div>

            {/* Discord Presence Settings */}
            {isPresence && (
              <>
                {/* Linked Discord Account Toggle / Link Button */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#141414]/60 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-normal text-white/90">Use connected Discord</span>
                      <span className="text-[11.5px] text-white/35">
                        {linkedDiscordId && linkedDiscordUsername
                          ? `@${linkedDiscordUsername}`
                          : "No Discord account connected"}
                      </span>
                    </div>

                    {linkedDiscordId ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={useLinkedAccount}
                        onClick={() => setUseLinkedAccount(!useLinkedAccount)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          useLinkedAccount ? "bg-[#609fda]" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ${
                            useLinkedAccount ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href="/api/auth/discord"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#609fda]/15 hover:bg-[#609fda]/25 border border-[#609fda]/20 text-[12px] font-normal text-white transition-all cursor-pointer active:scale-95"
                      >
                        <span>Link account</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#609fda] opacity-80">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Discord User ID Input */}
                <div className={`flex flex-col gap-1.5 transition-opacity duration-200 ${useLinkedAccount && linkedDiscordId ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-normal text-white/60">Discord User ID</label>
                    {useLinkedAccount && linkedDiscordId && (
                      <span className="text-[11px] text-white/40">Using connected account ID</span>
                    )}
                  </div>
                  <div className={`flex items-center bg-[#161616] border rounded-xl px-3.5 h-[40px] transition-colors ${useLinkedAccount && linkedDiscordId ? "border-white/5 bg-[#121212]" : "border-white/5 focus-within:border-white/15"}`}>
                    <input
                      type="text"
                      disabled={Boolean(useLinkedAccount && linkedDiscordId)}
                      value={useLinkedAccount && linkedDiscordId ? linkedDiscordId : customDiscordId}
                      onChange={(e) => setCustomDiscordId(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 1024354678901234567"
                      maxLength={20}
                      className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none disabled:text-white/40"
                    />
                  </div>
                  <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                    Settings → Advanced → Enable Developer Mode → Right-click profile → Copy User ID.
                  </p>
                </div>
              </>
            )}

            {/* Discord Server Settings */}
            {isServer && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                <label className="text-[12px] font-normal text-white/60">Discord Server Invite Code</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                  <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="e.g. QgZEkJjF8q"
                    maxLength={100}
                    className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                  The code from your permanent invite link (e.g. &apos;QgZEkJjF8q&apos; from discord.gg/QgZEkJjF8q).
                </p>
              </div>
            )}
          </>
        )}

        {isTwitch && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="text-[12px] font-normal text-white/60">Twitch Username</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
              <input
                type="text"
                value={twitchUsername}
                onChange={(e) => setTwitchUsername(e.target.value)}
                placeholder="e.g. shroud"
                maxLength={25}
                className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-white/30 leading-normal mt-0.5">
              Your Twitch channel username or link (e.g. &apos;shroud&apos; from twitch.tv/shroud).
            </p>
          </div>
        )}

        {isGitHub && (
          <>
            {/* Widget Type */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-normal text-white/60">Type</label>
              <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-white/5 rounded-xl">
                <button
                  type="button"
                  disabled={hasGitHubUserWidget}
                  onClick={() => setWidgetType("github-user")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasGitHubUserWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "github-user"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  GitHub User
                </button>
                <button
                  type="button"
                  disabled={hasGitHubRepoWidget}
                  onClick={() => setWidgetType("github-repo")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasGitHubRepoWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "github-repo"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  GitHub Repository
                </button>
              </div>
            </div>

            {/* GitHub User Settings */}
            {isGitHubUser && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                <label className="text-[12px] font-normal text-white/60">GitHub Username</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. octocat"
                    maxLength={39}
                    className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                  Your GitHub username or profile link (e.g. &apos;octocat&apos;).
                </p>
              </div>
            )}

            {/* GitHub Repo Settings */}
            {isGitHubRepo && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                <label className="text-[12px] font-normal text-white/60">GitHub Repository</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="e.g. torvalds/linux"
                    maxLength={100}
                    className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                  Format as &apos;owner/repository&apos; or full repository link.
                </p>
              </div>
            )}
          </>
        )}

        {isPinterest && (
          <>
            {/* Widget Type */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-normal text-white/60">Type</label>
              <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-white/5 rounded-xl">
                <button
                  type="button"
                  disabled={hasPinterestProfileWidget}
                  onClick={() => setWidgetType("pinterest-profile")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasPinterestProfileWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "pinterest-profile"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  Pinterest Profile
                </button>
                <button
                  type="button"
                  disabled={hasPinterestBoardWidget}
                  onClick={() => setWidgetType("pinterest-board")}
                  className={`flex-1 py-2 px-3 rounded-lg text-[12.5px] font-normal transition-all ${
                    hasPinterestBoardWidget
                      ? "opacity-30 cursor-not-allowed text-white/30 bg-transparent"
                      : widgetType === "pinterest-board"
                      ? "bg-white/[0.08] text-white shadow-sm cursor-pointer"
                      : "text-white/40 hover:text-white/70 cursor-pointer"
                  }`}
                >
                  Pinterest Board
                </button>
              </div>
            </div>

            {/* Pinterest Profile Settings */}
            {isPinterestProfile && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                <label className="text-[12px] font-normal text-white/60">Pinterest Username</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                  <input
                    type="text"
                    value={pinterestUsername}
                    onChange={(e) => setPinterestUsername(e.target.value)}
                    placeholder="e.g. username"
                    maxLength={30}
                    className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                  Your Pinterest username or profile link (e.g. &apos;username&apos; from pinterest.com/username). The profile must be public.
                </p>
              </div>
            )}

            {/* Pinterest Board Settings */}
            {isPinterestBoard && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                <label className="text-[12px] font-normal text-white/60">Pinterest Board</label>
                <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
                  <input
                    type="text"
                    value={pinterestBoard}
                    onChange={(e) => setPinterestBoard(e.target.value)}
                    placeholder="e.g. username/board"
                    maxLength={100}
                    className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/30 leading-normal mt-0.5">
                  The board in &apos;username/board&apos; format (e.g. &apos;username/board&apos; from pinterest.com/username/board).
                </p>
              </div>
            )}
          </>
        )}

        {isValorant && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="text-[12px] font-normal text-white/60">Riot ID</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
              <input
                type="text"
                value={valorantId}
                onChange={(e) => setValorantId(e.target.value)}
                placeholder="e.g. tenz#sen"
                maxLength={30}
                className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-white/30 leading-normal mt-0.5">
              Your Riot ID in &apos;name#tag&apos; format (e.g. &apos;tenz#sen&apos;). Find it on your Riot account page.
            </p>
          </div>
        )}

        {isSteam && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="text-[12px] font-normal text-white/60">Steam ID or Vanity URL</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="e.g. gabelogannewell or 76561197960287930"
                maxLength={100}
                className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-white/30 leading-normal mt-0.5">
              Custom URL name, SteamID64, or full Steam profile link. Profile must be public.
            </p>
          </div>
        )}

        {isGenshin && (
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            <label className="text-[12px] font-normal text-white/60">Genshin Impact UID</label>
            <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3.5 h-[40px] focus-within:border-white/15 transition-colors">
              <input
                type="text"
                value={genshinUid}
                onChange={(e) => setGenshinUid(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="e.g. 800000024"
                maxLength={10}
                className="w-full bg-transparent text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-white/30 leading-normal mt-0.5">
              Your 9-10 digit in-game UID. Public details fetched via Enka.Network.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] font-normal text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormatValid}
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-xl text-[13px] font-normal transition-all cursor-pointer flex items-center justify-center gap-2 min-w-[95px] ${
              isFormatValid
                ? "bg-[#609fda]/20 hover:bg-[#609fda]/30 border border-[#609fda]/30 text-white"
                : "bg-white/5 border border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
}
