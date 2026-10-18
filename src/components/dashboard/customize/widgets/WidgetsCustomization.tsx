"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AddWidgetModal from "./AddWidgetModal";
import { GenshinLogoIcon, RobloxLogoIcon, TelegramLogoIcon, TikTokLogoIcon, WeatherConditionIcon } from "@/components/profile/widgets/WidgetIcons";

export interface WidgetItem {
  id: string;
  platform: string;
  type: string;
  targetId: string;
  useLinked: boolean;
  enabled: boolean;
  imageShape?: 'circle' | 'rounded' | 'square';
  showActivity?: boolean;
  showActivityImage?: boolean;
  activityImageShape?: 'circle' | 'rounded' | 'square';
  showAvatarDecoration?: boolean;
  showGuildTag?: boolean;
  showBadges?: boolean;
  badgeOrder?: string[];
  hiddenBadges?: string[];
  showLastSeen?: boolean;
  fallbackText?: string;
  showMemberCount?: boolean;
  showOnlineCount?: boolean;
  showBanner?: boolean;
  placement?: 'inside' | 'outside';
  showFollowers?: boolean;
  showFollowing?: boolean;
  showPublicRepos?: boolean;
  showViewButton?: boolean;
  showBackgroundOverlay?: boolean;
  showContributionHeatmap?: boolean;
  showStars?: boolean;
  showForks?: boolean;
  showWatchers?: boolean;
  showOpenIssues?: boolean;
  showPrimaryLanguage?: boolean;
  showPinCount?: boolean;
  imageBackground?: boolean;
  valorantRankMode?: 'current' | 'highest';
  valorantAvatar?: 'rank-icon' | 'last-agent';
  valorantBackground?: 'none' | 'player-card' | 'last-map';
  valorantMatchSource?: 'any' | 'competitive';
  showRank?: boolean;
  valorantRankStyle?: 'name' | 'icon';
  showRR?: boolean;
  showLevel?: boolean;
  steamShowLevel?: boolean;
  steamShowGames?: boolean;
  steamShowMemberSince?: boolean;
  steamShowAvatarFrame?: boolean;
  steamShowAnimatedAvatar?: boolean;
  steamBackground?: 'none' | 'large' | 'small';
  steamShowBackgroundImage?: boolean;
  genshinShowAr?: boolean;
  genshinShowWorldLevel?: boolean;
  genshinShowAchievements?: boolean;
  genshinShowRegion?: boolean;
  genshinShowBackground?: boolean;
  genshinShowBackgroundImage?: boolean;
  twitchShowLiveStatus?: boolean;
  twitchShowFollowers?: boolean;
  twitchShowPartnerBadge?: boolean;
  twitchShowBackground?: boolean;
  spotifyShowArtist?: boolean;
  spotifyShowAlbum?: boolean;
  spotifyShowTrackCount?: boolean;
  spotifyShowReleaseYear?: boolean;
  spotifyShowOwner?: boolean;
  spotifyShowMonthlyListeners?: boolean;
  spotifyShowFollowers?: boolean;
  spotifyShowBackground?: boolean;
  tiktokShowFollowers?: boolean;
  tiktokShowFollowing?: boolean;
  tiktokShowLikes?: boolean;
  tiktokShowVideos?: boolean;
  tiktokShowVerifiedBadge?: boolean;
  tiktokShowBackground?: boolean;
  youtubeMode?: 'channel' | 'latest-video';
  youtubeImageSource?: 'channel-avatar' | 'video-thumbnail';
  youtubeShowSubscribers?: boolean;
  youtubeShowVideoCount?: boolean;
  youtubeShowTotalViews?: boolean;
  youtubeShowVideoViews?: boolean;
  youtubeShowVideoLikes?: boolean;
  youtubeShowUploadDate?: boolean;
  youtubeShowBackground?: boolean;
  youtubeShowBanner?: boolean;
  telegramShowBio?: boolean;
  telegramShowBackground?: boolean;
  robloxShowFollowers?: boolean;
  robloxShowFriends?: boolean;
  robloxShowVerifiedBadge?: boolean;
  robloxShowBackground?: boolean;
  weatherUnit?: 'celsius' | 'fahrenheit' | 'both';
  weatherShowCondition?: boolean;
  weatherShowFeelsLike?: boolean;
  weatherShowLocation?: boolean;
  weatherShowBackground?: boolean;
}

interface WidgetsCustomizationProps {
  initialWidgets?: WidgetItem[];
  maxWidgets?: number;
  linkedDiscordId?: string | null;
  linkedDiscordUsername?: string | null;
  onWidgetsChange?: (widgets: WidgetItem[]) => void;
}

export default function WidgetsCustomization({
  initialWidgets = [],
  maxWidgets = 4,
  linkedDiscordId,
  linkedDiscordUsername,
  onWidgetsChange,
}: WidgetsCustomizationProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef<WidgetItem[]>(widgets);
  const dragFromRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  useEffect(() => {
    widgetsRef.current = widgets;
  }, [widgets]);

  const reorderWidgets = (from: number, to: number) => {
    const current = widgetsRef.current;
    if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return;
    const updated = [...current];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    widgetsRef.current = updated;
    setWidgets(updated);
  };

  const handleGripPointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    isDraggingRef.current = true;
    dragFromRef.current = index;
    setDraggedIdx(index);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleGripPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragFromRef.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const row = el?.closest("[data-widget-id]") as HTMLElement | null;
    if (!row) return;
    const overIdx = widgetsRef.current.findIndex((w) => w.id === row.dataset.widgetId);
    if (overIdx === -1 || overIdx === dragFromRef.current) return;
    reorderWidgets(dragFromRef.current, overIdx);
    dragFromRef.current = overIdx;
    setDraggedIdx(overIdx);
  };

  const handleGripPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    dragFromRef.current = null;
    setDraggedIdx(null);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onWidgetsChange?.(widgetsRef.current);
  };

  const handleGripKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const to = e.key === "ArrowUp" ? index - 1 : index + 1;
    if (to < 0 || to >= widgetsRef.current.length) return;
    reorderWidgets(index, to);
    onWidgetsChange?.(widgetsRef.current);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddWidget = (widget: { platform: string; type: string; useLinked: boolean; customId: string }) => {
    if (widget.platform === "discord") {
      if (widget.type === "presence") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-presence?id=${encodeURIComponent(
            widget.customId
          )}&linked=${widget.useLinked}`
        );
      } else if (widget.type === "server") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-server?id=${encodeURIComponent(widget.customId)}`
        );
      }
    } else if (widget.platform === "github") {
      if (widget.type === "github-user" || widget.type === "user") {
        router.push(
          `/dashboard/customize/profile/widgets/github-user?id=${encodeURIComponent(widget.customId)}`
        );
      } else if (widget.type === "github-repo" || widget.type === "repo") {
        router.push(
          `/dashboard/customize/profile/widgets/github-repo?id=${encodeURIComponent(widget.customId)}`
        );
      }
    } else if (widget.platform === "pinterest") {
      if (widget.type === "pinterest-profile" || widget.type === "profile") {
        router.push(
          `/dashboard/customize/profile/widgets/pinterest-profile?id=${encodeURIComponent(widget.customId)}`
        );
      } else if (widget.type === "pinterest-board" || widget.type === "board") {
        router.push(
          `/dashboard/customize/profile/widgets/pinterest-board?id=${encodeURIComponent(widget.customId)}`
        );
      }
    } else if (widget.platform === "valorant") {
      router.push(
        `/dashboard/customize/profile/widgets/valorant?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "steam") {
      router.push(
        `/dashboard/customize/profile/widgets/steam?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "genshin") {
      router.push(
        `/dashboard/customize/profile/widgets/genshin?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "twitch") {
      router.push(
        `/dashboard/customize/profile/widgets/twitch?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "telegram") {
      router.push(
        `/dashboard/customize/profile/widgets/telegram?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "roblox") {
      router.push(
        `/dashboard/customize/profile/widgets/roblox?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "weather") {
      router.push(
        `/dashboard/customize/profile/widgets/weather?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "spotify") {
      router.push(
        `/dashboard/customize/profile/widgets/spotify?type=${encodeURIComponent(widget.type)}&id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "tiktok") {
      router.push(
        `/dashboard/customize/profile/widgets/tiktok?id=${encodeURIComponent(widget.customId)}`
      );
    } else if (widget.platform === "youtube") {
      router.push(
        `/dashboard/customize/profile/widgets/youtube?id=${encodeURIComponent(widget.customId)}`
      );
    }
  };

  const handleEditWidget = (w: WidgetItem) => {
    setOpenMenuId(null);
    if (w.platform === "discord") {
      if (w.type === "presence") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-presence?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}&linked=${w.useLinked}`
        );
      } else if (w.type === "server") {
        router.push(
          `/dashboard/customize/profile/widgets/discord-server?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}`
        );
      }
    } else if (w.platform === "github") {
      if (w.type === "github-user" || w.type === "user") {
        router.push(
          `/dashboard/customize/profile/widgets/github-user?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}`
        );
      } else if (w.type === "github-repo" || w.type === "repo") {
        router.push(
          `/dashboard/customize/profile/widgets/github-repo?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}`
        );
      }
    } else if (w.platform === "pinterest") {
      if (w.type === "pinterest-profile" || w.type === "profile") {
        router.push(
          `/dashboard/customize/profile/widgets/pinterest-profile?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}`
        );
      } else if (w.type === "pinterest-board" || w.type === "board") {
        router.push(
          `/dashboard/customize/profile/widgets/pinterest-board?widgetId=${encodeURIComponent(
            w.id
          )}&id=${encodeURIComponent(w.targetId)}`
        );
      }
    } else if (w.platform === "valorant") {
      router.push(
        `/dashboard/customize/profile/widgets/valorant?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "steam") {
      router.push(
        `/dashboard/customize/profile/widgets/steam?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "genshin") {
      router.push(
        `/dashboard/customize/profile/widgets/genshin?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "twitch") {
      router.push(
        `/dashboard/customize/profile/widgets/twitch?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "telegram") {
      router.push(
        `/dashboard/customize/profile/widgets/telegram?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "roblox") {
      router.push(
        `/dashboard/customize/profile/widgets/roblox?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "weather") {
      router.push(
        `/dashboard/customize/profile/widgets/weather?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "spotify") {
      router.push(
        `/dashboard/customize/profile/widgets/spotify?widgetId=${encodeURIComponent(
          w.id
        )}&type=${encodeURIComponent(w.type)}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "tiktok") {
      router.push(
        `/dashboard/customize/profile/widgets/tiktok?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    } else if (w.platform === "youtube") {
      router.push(
        `/dashboard/customize/profile/widgets/youtube?widgetId=${encodeURIComponent(
          w.id
        )}&id=${encodeURIComponent(w.targetId)}`
      );
    }
  };

  const handleToggleWidget = (id: string) => {
    setOpenMenuId(null);
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    setWidgets(updated);
    onWidgetsChange?.(updated);
  };

  const handleDeleteWidget = (id: string) => {
    setOpenMenuId(null);
    const updated = widgets.filter((w) => w.id !== id);
    setWidgets(updated);
    onWidgetsChange?.(updated);
  };

  const count = widgets.length;
  const isAddDisabled = count >= maxWidgets;

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-4 sm:p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col min-w-0">
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">
                Your widgets ({count}/{maxWidgets})
              </h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                Drag to reorder. Disabled widgets won&apos;t appear on your page.
              </p>
            </div>

            <button
              type="button"
              disabled={isAddDisabled}
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-normal whitespace-nowrap shrink-0 w-full sm:w-auto transition-all duration-200 ${
                isAddDisabled
                  ? "bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#5b6cf5]/15 hover:bg-[#5b6cf5]/25 border border-[#5b6cf5]/20 text-white cursor-pointer active:scale-95"
              }`}
            >
              <span
                className={`text-[13px] leading-none font-normal ${
                  isAddDisabled ? "text-white/30" : "text-[#5b6cf5]"
                }`}
              >
                +
              </span>
              <span>Add widget</span>
            </button>
          </div>

          {count > 0 ? (
            <div
              className={`flex flex-col gap-2.5 ${
                count > 4 ? "max-h-[310px] overflow-y-auto custom-scrollbar pr-1.5 -mr-1.5" : ""
              }`}
            >
              {widgets.map((w, index) => (
                <div
                  key={w.id}
                  data-widget-id={w.id}
                  className={`group flex items-center justify-between gap-3 p-3.5 bg-[#141414]/70 hover:bg-[#161616] border rounded-2xl transition-all duration-150 select-none ${
                    draggedIdx === index
                      ? "border-[#5b6cf5]/60 bg-[#161616] shadow-lg shadow-[#5b6cf5]/10 scale-[0.99]"
                      : "border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Reorder widget"
                      onPointerDown={(e) => handleGripPointerDown(e, index)}
                      onPointerMove={handleGripPointerMove}
                      onPointerUp={handleGripPointerUp}
                      onPointerCancel={handleGripPointerUp}
                      onKeyDown={(e) => handleGripKeyDown(e, index)}
                      className="shrink-0 p-2 -m-2 cursor-grab active:cursor-grabbing touch-none text-white/20 group-hover:text-white/60 focus:text-white/70 focus:outline-none transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                      </svg>
                    </div>

                    <div className="w-9 h-9 shrink-0 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
                      {w.platform === "discord" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      ) : w.platform === "pinterest" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#E60023">
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                        </svg>
                      ) : w.platform === "valorant" ? (
                        <svg width="18" height="18" viewBox="0 0 100 100" fill="#FF4655">
                          <path d="M9.9 14.5L5.7 20.4v40.3l37.2 38.6h11.1L9.9 14.5zm84.4 0L57.1 66.8h17.2L94.3 35V14.5z" />
                        </svg>
                      ) : w.platform === "steam" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM7.54 18.216l-1.464-.606c.263.568.736 1.015 1.328 1.246.885.344 1.875.05 2.434-.674-.326-.062-.644-.176-.932-.341-.607-.35-1.042-.907-1.226-1.562l-.14-.063zm8.4-11.455c-1.18 0-2.137.957-2.137 2.137 0 1.18.957 2.137 2.137 2.137 1.18 0 2.137-.957 2.137-2.137 0-1.18-.957-2.137-2.137-2.137zm0 .802c.737 0 1.335.598 1.335 1.335 0 .737-.598 1.335-1.335 1.335-.737 0-1.335-.598-1.335-1.335 0-.737.598-1.335 1.335-1.335z" />
                        </svg>
                      ) : w.platform === "twitch" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#9146FF">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                        </svg>
                      ) : w.platform === "telegram" ? (
                        <TelegramLogoIcon size={18} className="w-[18px] h-[18px]" />
                      ) : w.platform === "roblox" ? (
                        <RobloxLogoIcon size={18} className="w-[18px] h-[18px]" />
                      ) : w.platform === "weather" ? (
                        <WeatherConditionIcon
                          kind="partly-cloudy"
                          size={18}
                          className="w-[18px] h-[18px]"
                        />
                      ) : w.platform === "spotify" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1ED760">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
                        </svg>
                      ) : w.platform === "genshin" ? (
                        <GenshinLogoIcon size={18} className="w-[18px] h-[18px] text-[#5b6cf5]" />
                      ) : w.platform === "tiktok" ? (
                        <TikTokLogoIcon size={18} className="w-[18px] h-[18px] text-white" />
                      ) : w.platform === "youtube" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13.5px] font-normal text-white/95 tracking-tight truncate">
                          {w.type === "presence"
                            ? "Discord Presence"
                            : w.type === "server"
                            ? "Discord Server"
                            : w.type === "github-user" || w.type === "user"
                            ? "GitHub User"
                            : w.type === "github-repo" || w.type === "repo"
                            ? "GitHub Repository"
                            : w.type === "pinterest-profile" || w.type === "profile"
                            ? "Pinterest Profile"
                            : w.type === "pinterest-board" || w.type === "board"
                            ? "Pinterest Board"
                            : w.type === "valorant-profile" || w.platform === "valorant"
                            ? "Valorant Profile"
                            : w.type === "steam-profile" || w.platform === "steam"
                            ? "Steam Profile"
                            : w.type === "twitch-channel" || w.platform === "twitch"
                            ? "Twitch Channel"
                            : w.type === "telegram-profile" || w.platform === "telegram"
                            ? "Telegram User"
                            : w.type === "roblox-profile" || w.platform === "roblox"
                            ? "Roblox Player"
                            : w.type === "weather-current" || w.platform === "weather"
                            ? "Weather"
                            : w.type === "spotify-track"
                            ? "Spotify Track"
                            : w.type === "spotify-album"
                            ? "Spotify Album"
                            : w.type === "spotify-playlist"
                            ? "Spotify Playlist"
                            : w.type === "spotify-artist"
                            ? "Spotify Artist"
                            : w.type === "spotify-user"
                            ? "Spotify User"
                            : w.type === "tiktok-profile" || w.platform === "tiktok"
                            ? "TikTok Profile"
                            : w.type === "youtube-profile" || w.platform === "youtube"
                            ? "YouTube"
                            : "Genshin Impact"}
                        </span>
                        {!w.enabled && (
                          <span className="shrink-0 px-2 py-0.5 rounded-[6px] bg-red-500/[0.08] border border-red-500/15 text-[11.5px] text-red-400 font-light tracking-normal leading-none">
                            Disabled
                          </span>
                        )}
                      </div>
                      <span className="text-[11.5px] font-mono text-white/35 truncate">
                        {w.targetId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative" ref={openMenuId === w.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === w.id ? null : w.id)}
                        title="Widget options"
                        className="w-8 h-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {openMenuId === w.id && (
                        <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#161616] border border-white/10 rounded-xl shadow-xl py-1 z-30 flex flex-col backdrop-blur-md">
                          <button
                            type="button"
                            onClick={() => handleEditWidget(w)}
                            className="w-full px-3 py-1.5 text-left text-[12.5px] text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleWidget(w.id)}
                            className={`w-full px-3 py-1.5 text-left text-[12.5px] flex items-center gap-2 cursor-pointer transition-colors ${
                              w.enabled
                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            }`}
                          >
                            {w.enabled ? (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Enable</span>
                              </>
                            )}
                          </button>

                          <div className="h-px bg-white/5 my-1" />

                          <button
                            type="button"
                            onClick={() => handleDeleteWidget(w.id)}
                            className="w-full px-3 py-1.5 text-left text-[12.5px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full border border-dashed border-white/[0.08] rounded-2xl bg-[#141414]/30 py-12 px-6 flex flex-col items-center justify-center text-center transition-colors hover:border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 mb-3 shadow-inner">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="opacity-75"
                >
                  <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z" />
                </svg>
              </div>

              <h3 className="text-[13.5px] font-normal text-white/90 tracking-tight">
                No widgets yet.
              </h3>
              <p className="text-[12.5px] font-normal text-white/35 mt-1 max-w-xs leading-relaxed">
                Add your first widget so visitors can see your live activity.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWidget}
        linkedDiscordId={linkedDiscordId}
        linkedDiscordUsername={linkedDiscordUsername}
      />
    </>
  );
}
