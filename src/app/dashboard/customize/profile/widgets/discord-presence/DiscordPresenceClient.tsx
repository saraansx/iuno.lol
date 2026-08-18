"use client";

import { useState, useTransition, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import SaveBar from "@/components/dashboard/SaveBar";
import { type FullUser } from "@/lib/features/users/db";
import { type WidgetItem } from "@/components/dashboard/customize/widgets/WidgetsCustomization";
import { updateProfileWidgets } from "@/actions/profile";
import { useDiscordPresence } from "@/lib/hooks/useDiscordPresence";
import PresenceCustomization from "@/components/dashboard/customize/widgets/discord-presence/PresenceCustomization";
import BadgesOrderCustomization from "@/components/dashboard/customize/widgets/discord-presence/BadgesOrderCustomization";
import { toast } from "sonner";

function formatLastSeen(timestamp?: number | null, referenceNow: number = Date.now()) {
  if (!timestamp) return "last seen recently";
  const diffSeconds = Math.max(0, Math.floor((referenceNow - timestamp) / 1000));
  if (diffSeconds < 60) return "last seen just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `last seen ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `last seen ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `last seen ${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DiscordPresenceClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("widgetId");
  const isEditing = Boolean(widgetId);

  const initialTargetId = searchParams.get("id") || user?.discordId || "";
  const initialUseLinked = searchParams.get("linked") === "true";
  const currentWidget = ((user?.widgets as WidgetItem[]) || []).find((w) => w.id === widgetId);
  const initialImageShape = currentWidget?.imageShape || "circle";
  const initialShowActivity = currentWidget?.showActivity !== undefined ? currentWidget.showActivity : true;
  const initialShowActivityImage = currentWidget?.showActivityImage !== undefined ? currentWidget.showActivityImage : true;
  const initialActivityImageShape = currentWidget?.activityImageShape || "rounded";
  const initialShowAvatarDecoration = currentWidget?.showAvatarDecoration !== undefined ? currentWidget.showAvatarDecoration : true;
  const initialShowGuildTag = currentWidget?.showGuildTag !== undefined ? currentWidget.showGuildTag : true;
  const initialShowBadges = currentWidget?.showBadges !== undefined ? currentWidget.showBadges : true;
  const initialShowLastSeen = currentWidget?.showLastSeen !== undefined ? currentWidget.showLastSeen : true;
  const initialFallbackText = currentWidget?.fallbackText !== undefined ? currentWidget.fallbackText : "Currently doing nothing";
  const initialBadgeOrder = currentWidget?.badgeOrder || [];
  const initialHiddenBadges = currentWidget?.hiddenBadges || [];
  const initialPlacement = currentWidget?.placement || "inside";

  const [useLinked, setUseLinked] = useState(initialUseLinked && Boolean(user?.discordId));
  const [discordId, setDiscordId] = useState(initialTargetId);
  const [placement, setPlacement] = useState<"inside" | "outside">(initialPlacement);
  const [imageShape, setImageShape] = useState<"circle" | "rounded" | "square">(initialImageShape);
  const [showActivity, setShowActivity] = useState<boolean>(initialShowActivity);
  const [showActivityImage, setShowActivityImage] = useState<boolean>(initialShowActivityImage);
  const [activityImageShape, setActivityImageShape] = useState<"circle" | "rounded" | "square">(initialActivityImageShape);
  const [showAvatarDecoration, setShowAvatarDecoration] = useState<boolean>(initialShowAvatarDecoration);
  const [showGuildTag, setShowGuildTag] = useState<boolean>(initialShowGuildTag);
  const [showBadges, setShowBadges] = useState<boolean>(initialShowBadges);
  const [showLastSeen, setShowLastSeen] = useState<boolean>(initialShowLastSeen);
  const [fallbackText, setFallbackText] = useState<string>(initialFallbackText);
  const [badgeOrder, setBadgeOrder] = useState<string[]>(initialBadgeOrder);
  const [hiddenBadges, setHiddenBadges] = useState<string[]>(initialHiddenBadges);

  const [hoveredBadge, setHoveredBadge] = useState<{ name: string; x: number; y: number } | null>(null);

  const effectiveId = useLinked ? (user?.discordId || "") : discordId;

  // Presence fetched once per ID — refreshes on reload, not on a timer
  const { data: discordData, loading: loadingPreview, isValidId } = useDiscordPresence(effectiveId);
  const mountTimeRef = useRef(Date.now());

  const defaultBadgeIds = (discordData?.user?.profile_badges || [])
    .filter((b: { icon?: string }) => Boolean(b.icon))
    .map((b: { id: string }) => b.id);

  const effectiveInitialOrder = initialBadgeOrder.length > 0 ? initialBadgeOrder : defaultBadgeIds;
  const effectiveCurrentOrder = badgeOrder.length > 0 ? badgeOrder : defaultBadgeIds;

  const isBadgeOrderChanged =
    effectiveCurrentOrder.length > 0 &&
    effectiveInitialOrder.length > 0 &&
    JSON.stringify(effectiveCurrentOrder) !== JSON.stringify(effectiveInitialOrder);

  const isHiddenBadgesChanged =
    JSON.stringify([...hiddenBadges].sort()) !== JSON.stringify([...initialHiddenBadges].sort());

  const isChanged =
    useLinked !== initialUseLinked ||
    discordId !== initialTargetId ||
    imageShape !== initialImageShape ||
    showActivity !== initialShowActivity ||
    showActivityImage !== initialShowActivityImage ||
    activityImageShape !== initialActivityImageShape ||
    showAvatarDecoration !== initialShowAvatarDecoration ||
    showGuildTag !== initialShowGuildTag ||
    showBadges !== initialShowBadges ||
    showLastSeen !== initialShowLastSeen ||
    fallbackText !== initialFallbackText ||
    placement !== initialPlacement ||
    isBadgeOrderChanged ||
    isHiddenBadgesChanged;

  const [, startTransition] = useTransition();

  const handleSaveWidgetConfirm = () => {
    if (!user?.username) return;
    if (!isValidId) {
      toast.error("Please enter a valid 17-20 digit Discord ID");
      return;
    }

    const existingList: WidgetItem[] = (user?.widgets as WidgetItem[]) || [];
    let updated: WidgetItem[];

    if (isEditing) {
      updated = existingList.map((w) =>
        w.id === widgetId
          ? {
              ...w,
              targetId: effectiveId,
              useLinked,
              imageShape,
              showActivity,
              showActivityImage,
              activityImageShape,
              showAvatarDecoration,
              showGuildTag,
              showBadges,
              showLastSeen,
              fallbackText,
              badgeOrder,
              hiddenBadges,
              placement,
            }
          : w
      );
    } else {
      const newWidget: WidgetItem = {
        id: `widget_${Date.now()}`,
        platform: "discord",
        type: "presence",
        targetId: effectiveId,
        useLinked,
        enabled: true,
        imageShape,
        showActivity,
        showActivityImage,
        activityImageShape,
        showAvatarDecoration,
        showGuildTag,
        showBadges,
        showLastSeen,
        fallbackText,
        badgeOrder,
        hiddenBadges,
        placement,
      };
      updated = [newWidget, ...existingList];
    }

    startTransition(async () => {
      try {
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

  const avatarUrl = discordData?.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordData.user.id}/${discordData.user.avatar}.${
        discordData.user.avatar.startsWith("a_") ? "gif" : "png"
      }?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(effectiveId && /^\d+$/.test(effectiveId) ? effectiveId : "0") % BigInt(5))}.png`;

  function getCleanBadgeName(badge: { id: string; description?: string }): string {
    const desc = badge.description?.trim();
    if (desc) return desc;

    const id = badge.id.toLowerCase();
    if (id.includes("premium") || id.includes("nitro")) return "Discord Nitro";
    if (id.includes("orb")) return "Orb";
    if (id.includes("guild_booster") || id.includes("boost")) return "Server Booster";
    if (id.includes("staff")) return "Discord Staff";
    if (id.includes("partner")) return "Partnered Server Owner";
    if (id.includes("hypesquad_house_1") || id.includes("bravery")) return "HypeSquad Bravery";
    if (id.includes("hypesquad_house_2") || id.includes("brilliance")) return "HypeSquad Brilliance";
    if (id.includes("hypesquad_house_3") || id.includes("balance")) return "HypeSquad Balance";
    if (id.includes("hypesquad_events") || id.includes("hypesquad")) return "HypeSquad Events";
    if (id.includes("bug_hunter_level_2")) return "Discord Bug Hunter (Gold)";
    if (id.includes("bug_hunter_level_1") || id.includes("bug_hunter")) return "Discord Bug Hunter";
    if (id.includes("verified_developer") || id.includes("bot_developer")) return "Early Verified Bot Developer";
    if (id.includes("early_supporter")) return "Early Supporter";
    if (id.includes("legacy_username")) return "Legacy Username";
    if (id.includes("quest")) return "Quest Completed";
    if (id.includes("active_developer")) return "Active Developer";
    return "Discord Badge";
  }

  // Badges strictly from Discord user token profile endpoint
  const userBadges: { id: string; name: string; icon: string }[] = [];

  if (discordData?.user?.profile_badges && Array.isArray(discordData.user.profile_badges)) {
    for (const badge of discordData.user.profile_badges) {
      if (!badge.icon) continue;
      userBadges.push({
        id: badge.id,
        name: getCleanBadgeName(badge),
        icon: `https://cdn.discordapp.com/badge-icons/${badge.icon}.png`,
      });
    }
  }

  // Sorted and filtered preview badges according to badgeOrder and hiddenBadges
  const previewBadges = [...userBadges]
    .filter((b) => !hiddenBadges.includes(b.id))
    .sort((a, b) => {
      const idxA = badgeOrder.indexOf(a.id);
      const idxB = badgeOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

  const decorationAsset = discordData?.user?.avatar_decoration_data?.asset;
  const decorationUrl = decorationAsset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${decorationAsset}.png`
    : null;

  const handleRevert = () => {
    if (isEditing) {
      // Revert values back to initial state without leaving page
      setUseLinked(initialUseLinked && Boolean(user?.discordId));
      setDiscordId(initialTargetId);
      setImageShape(initialImageShape);
      setShowActivity(initialShowActivity);
      setShowActivityImage(initialShowActivityImage);
      setActivityImageShape(initialActivityImageShape);
      setShowAvatarDecoration(initialShowAvatarDecoration);
      setShowGuildTag(initialShowGuildTag);
      setShowBadges(initialShowBadges);
      setShowLastSeen(initialShowLastSeen);
      setFallbackText(initialFallbackText);
      setBadgeOrder(initialBadgeOrder);
      setHiddenBadges(initialHiddenBadges);
    } else {
      // If creating new widget, cancel exits back to widgets list
      router.push("/dashboard/customize/profile/widgets");
    }
  };

  return (
    <>
      {hoveredBadge && (
        <div
          className="fixed pointer-events-none z-[99999] -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${hoveredBadge.x}px`,
            top: `${hoveredBadge.y - 6}px`,
          }}
        >
          <div
            className="bg-[#0f0f12]/80 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono text-white shadow-xl"
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "normal",
            }}
          >
            {hoveredBadge.name}
          </div>
        </div>
      )}

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

            {/* Toggle Linked Account */}
            <div className="flex items-center justify-between p-4 bg-[#141414]/70 border border-white/5 rounded-2xl">
              <div className="flex flex-col gap-0.5 pr-4">
                <span className="text-[13px] font-normal text-white/90 tracking-tight">
                  Use linked Discord account
                </span>
                <p className="text-[11.5px] text-white/40 leading-relaxed">
                  Follow the Discord account connected to your iuno.lol account instead of a fixed ID.
                  {!user?.discordId && (
                    <span className="block text-amber-400/70 mt-1">
                      No Discord account linked yet — connect via account settings.
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                disabled={!user?.discordId}
                onClick={() => setUseLinked(!useLinked)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  useLinked ? "bg-[#609fda]" : "bg-white/10"
                } ${!user?.discordId ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    useLinked ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Discord ID Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-normal text-white/80">Discord ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  disabled={useLinked}
                  value={useLinked ? user?.discordId || "" : discordId}
                  onChange={(e) => setDiscordId(e.target.value.trim())}
                  placeholder="200770268778463233"
                  className={`w-full bg-[#161616] border border-white/5 rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors ${
                    useLinked ? "opacity-50 cursor-not-allowed bg-white/[0.02]" : ""
                  }`}
                />
              </div>
              <p className="text-[11.5px] text-white/35">
                Your Discord user ID (Settings → Advanced → enable Developer Mode, then right-click your name → Copy User ID).
              </p>
            </div>
          </div>

          {/* Right Side: Live Discord Widget Preview Card */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[14px] font-normal text-white/90 tracking-tight">Preview</h2>
              <p className="text-[12.5px] font-normal text-white/40 mt-0.5">
                A live look at how this widget will appear on your page.
              </p>
            </div>

            <div className="w-full flex-1 flex items-center justify-start p-6 bg-[#141414]/40 border border-white/5 rounded-2xl min-h-[180px]">
              {!isValidId ? (
                <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-white/40">
                    Enter a valid Discord ID to see live preview
                  </span>
                </div>
              ) : loadingPreview && !discordData ? (
                /* Static dark glass skeleton loader matching widget shape */
                <div className="w-full bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-[20px] p-4 shadow-md flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={`w-14 h-14 shrink-0 bg-white/[0.05] ${
                        imageShape === "square"
                          ? "rounded-lg"
                          : imageShape === "rounded"
                          ? "rounded-2xl"
                          : "rounded-full"
                      }`}
                    />
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <div className="h-4 w-28 bg-white/[0.06] rounded-md" />
                      <div className="h-3 w-20 bg-white/[0.03] rounded-md" />
                    </div>
                  </div>
                </div>
              ) : discordData?.in_server === false ? (
                /* User NOT in the iuno Discord Server (Matches Haunt.gg UI) */
                <div className="flex items-center gap-3.5 py-2 transition-all duration-200">
                  <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold text-white tracking-tight">
                      Not in the server
                    </span>
                    <span className="text-[12px] text-white/35">
                      This user isn&apos;t in the iuno.lol Discord.
                    </span>
                  </div>
                </div>
              ) : (
                /* User IS in the server -> Show full presence, badges & avatar */
                <div className="relative w-full overflow-hidden rounded-[26px] bg-[#101010]/80 backdrop-blur-md border border-white/10 px-6 py-5.5 transition-all duration-200 shadow-md">
                  <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4.5 min-w-0">
                      {/* Avatar + Status badge + Discord Avatar Decoration */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <div
                          className={`w-[64px] h-[64px] overflow-hidden bg-[#181818] border border-white/10 relative shadow-md ${
                            imageShape === "square"
                              ? "rounded-none"
                              : imageShape === "rounded"
                              ? "rounded-2xl"
                              : "rounded-full"
                          }`}
                        >
                          <Image
                            src={avatarUrl}
                            alt="Discord avatar"
                            fill
                            sizes="64px"
                            priority
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        {/* Discord Avatar Decoration preset */}
                        {showAvatarDecoration && decorationUrl && (
                          <div className="pointer-events-none absolute -inset-2.5 z-10 flex items-center justify-center">
                            <Image
                              src={decorationUrl}
                              alt="Avatar decoration"
                              width={78}
                              height={78}
                              priority
                              loading="eager"
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}

                        {/* Status Indicator Icon */}
                        <div className="absolute bottom-0 right-0 z-20 w-4 h-4 rounded-full bg-[#101010] flex items-center justify-center">
                          {discordData?.status === "dnd" ? (
                            <span className="w-3 h-3 rounded-full bg-[#f23f43] flex items-center justify-center">
                              <span className="w-1.5 h-0.5 bg-[#101010] rounded-full" />
                            </span>
                          ) : discordData?.status === "idle" ? (
                            <span className="relative w-3 h-3 rounded-full bg-[#f0b232] flex items-center justify-center overflow-hidden">
                              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-[#101010]" />
                            </span>
                          ) : discordData?.status === "online" ? (
                            <span className="w-3 h-3 rounded-full bg-[#23a55a]" />
                          ) : (
                            <span className="w-3 h-3 rounded-full bg-[#80848e] flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-[#101010] rounded-full" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* User Details + Badges + Subtitle Status / Activity */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        {/* Top Line: Global Name / Username + Guild/Clan Tag + Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[16px] font-medium text-white tracking-tight">
                            {discordData?.user?.username || (loadingPreview ? "Loading..." : "Discord User")}
                          </span>

                          {/* Discord Guild / Clan Tag (e.g. ᶻz𐰁) */}
                          {showGuildTag && discordData?.user?.clan?.tag && (
                            <span className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-md text-[12px] font-medium text-white/85 tracking-tight">
                              {discordData.user.clan.badge && (
                                <Image
                                  src={`https://cdn.discordapp.com/clan-badges/${discordData.user.clan.identity_guild_id}/${discordData.user.clan.badge}.png`}
                                  alt="Clan badge"
                                  width={14}
                                  height={14}
                                  className="object-contain"
                                  unoptimized
                                />
                              )}
                              <span>{discordData.user.clan.tag}</span>
                            </span>
                          )}

                          {/* Discord Badges (No container wrapper) */}
                          {showBadges && previewBadges.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              {previewBadges.map((badge) => (
                                <div
                                  key={badge.id}
                                  className="relative w-5 h-5 flex items-center justify-center shrink-0 cursor-pointer"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredBadge({
                                      name: badge.name,
                                      x: rect.left + rect.width / 2,
                                      y: rect.top,
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredBadge(null)}
                                >
                                  <Image
                                    src={badge.icon}
                                    alt={badge.name}
                                    width={20}
                                    height={20}
                                    className="object-contain pointer-events-none"
                                    unoptimized
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Line: Activity / Spotify / Custom Status / Offline */}
                        {!showActivity ? (
                          fallbackText ? (
                            <div className="flex items-center gap-1.5 text-[13px] text-white/40">
                              <span>{fallbackText}</span>
                            </div>
                          ) : null
                        ) : discordData?.primary_activity ? (
                          <div className="flex flex-col text-[13px] leading-snug">
                            <span className="font-medium text-white/90 truncate">
                              {discordData.primary_activity.name}
                            </span>
                            {(discordData.primary_activity.details || discordData.primary_activity.state) && (
                              <span className="text-[12px] text-white/50 truncate">
                                {discordData.primary_activity.details || discordData.primary_activity.state}
                              </span>
                            )}
                          </div>
                        ) : discordData?.spotify ? (
                          <div className="flex flex-col text-[13px] leading-snug">
                            <span className="font-medium text-white/90 truncate">
                              {discordData.spotify.song}
                            </span>
                            <span className="text-[12px] text-white/50 truncate">
                              {discordData.spotify.artist}
                            </span>
                          </div>
                        ) : discordData?.custom_status?.text ? (
                          <div className="flex items-center gap-1.5 text-[13px] text-white/70 font-normal truncate">
                            {discordData.custom_status.emoji?.id ? (
                              <div className="relative w-4 h-4 shrink-0">
                                <Image
                                  src={`https://cdn.discordapp.com/emojis/${discordData.custom_status.emoji.id}.${discordData.custom_status.emoji.animated ? "gif" : "png"}?size=32`}
                                  alt={discordData.custom_status.emoji.name || "Emoji"}
                                  fill
                                  sizes="16px"
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            ) : discordData.custom_status.emoji?.name ? (
                              <span className="text-[13px]">{discordData.custom_status.emoji.name}</span>
                            ) : null}
                            <span className="truncate text-white/70 font-normal">{discordData.custom_status.text}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[13px] text-white/40">
                            <span>
                              {discordData?.status === "offline"
                                ? showLastSeen
                                  ? formatLastSeen(discordData?.last_seen, mountTimeRef.current)
                                  : "offline"
                                : discordData?.status || "offline"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Activity / Spotify Rich Media Thumbnail */}
                    {showActivity && showActivityImage && discordData?.primary_activity?.large_image_url ? (
                      <div
                        className={`w-[72px] h-[72px] shrink-0 overflow-hidden bg-white/[0.04] border border-white/10 shadow-md flex items-center justify-center ${
                          activityImageShape === "square"
                            ? "rounded-none"
                            : activityImageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={discordData.primary_activity.large_image_url}
                          alt=""
                          className={`w-[72px] h-[72px] min-w-[72px] min-h-[72px] object-cover block ${
                            activityImageShape === "square"
                              ? "rounded-none"
                              : activityImageShape === "circle"
                              ? "rounded-full"
                              : "rounded-2xl"
                          }`}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : showActivity && showActivityImage && discordData?.spotify?.album_art_url ? (
                      <div
                        className={`w-[72px] h-[72px] shrink-0 overflow-hidden bg-white/[0.04] border border-white/10 shadow-md flex items-center justify-center ${
                          activityImageShape === "square"
                            ? "rounded-none"
                            : activityImageShape === "circle"
                            ? "rounded-full"
                            : "rounded-2xl"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={discordData.spotify.album_art_url}
                          alt=""
                          className={`w-[72px] h-[72px] min-w-[72px] min-h-[72px] object-cover block ${
                            activityImageShape === "square"
                              ? "rounded-none"
                              : activityImageShape === "circle"
                              ? "rounded-full"
                              : "rounded-2xl"
                          }`}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Dedicated Full-Width Presence Customization Container */}
        <PresenceCustomization
          placement={placement}
          onPlacementChange={setPlacement}
          imageShape={imageShape}
          onImageShapeChange={setImageShape}
          showActivity={showActivity}
          onShowActivityChange={setShowActivity}
          showActivityImage={showActivityImage}
          onShowActivityImageChange={setShowActivityImage}
          activityImageShape={activityImageShape}
          onActivityImageShapeChange={setActivityImageShape}
          showAvatarDecoration={showAvatarDecoration}
          onShowAvatarDecorationChange={setShowAvatarDecoration}
          showGuildTag={showGuildTag}
          onShowGuildTagChange={setShowGuildTag}
          showBadges={showBadges}
          onShowBadgesChange={setShowBadges}
          showLastSeen={showLastSeen}
          onShowLastSeenChange={setShowLastSeen}
          fallbackText={fallbackText}
          onFallbackTextChange={setFallbackText}
        />
        {/* Badges & Order Customization Card (Shows when user has badges) */}
        {showBadges && userBadges.length > 0 && (
          <BadgesOrderCustomization
            availableBadges={userBadges}
            badgeOrder={badgeOrder}
            hiddenBadges={hiddenBadges}
            onOrderChange={setBadgeOrder}
            onHiddenChange={setHiddenBadges}
          />
        )}
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
