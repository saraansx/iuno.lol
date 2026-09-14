"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { revalidatePath } from "next/cache";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { invalidateLiveStatsCache } from "@/lib/live-stats-cache";
import { cleanYouTubeInput } from "@/lib/youtube";
import { cleanTelegramUsername, isValidTelegramUsername } from "@/lib/telegram";
import { cleanRobloxInput, isValidRobloxInput } from "@/lib/roblox";
import { cleanWeatherLocation, isValidWeatherLocation } from "@/lib/weather";
import { DEFAULT_EMBED_COLOR } from "@/lib/og";
import { isVideoUrl } from "@/lib/utils/media";
import { sanitizeProfileSettings } from "@/lib/profile-settings-sanitize";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { uploadToCatbox, isCatboxUrl } from "@/lib/catbox";

const CATBOX_API = "https://catbox.moe/user/api.php";
const CATBOX_BASE = "https://files.catbox.moe/";

function catboxFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "files.catbox.moe") return null;
    const name = u.pathname.replace(/^\//, "");
    return name || null;
  } catch {
    return null;
  }
}

async function deleteCatboxFiles(urls: (string | null | undefined)[]) {
  const userhash = process.env.CATBOX_USERHASH;
  const files = urls.map((u) => (u ? catboxFileId(u) : null)).filter((f): f is string => Boolean(f));
  if (!userhash || files.length === 0) return;
  try {
    const form = new FormData();
    form.append("reqtype", "deletefiles");
    form.append("userhash", userhash);
    form.append("files", files.join(" "));
    await fetch(CATBOX_API, { method: "POST", body: form });
  } catch (error) {
    console.error("Failed to delete Catbox files:", error);
  }
}

async function revalidateOwnProfile(userId: number) {
  const user = await getUserById(userId);
  if (user?.username) {
    revalidatePath(`/${user.username}`);
    await purgeCloudflareProfileCache(user.username);
  }
}

function isValidMediaUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.startsWith(CATBOX_BASE) ||
         url.startsWith("https://cdn.discordapp.com/") ||
         url.startsWith("https://discord-decoration.art/");
}

export async function updateGeneralProfile(data: {
  displayName?: string;
  location?: string;
  timezone?: string;
  occupation?: string;
  bio?: string;
  avatarUrl?: string | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle";
  avatarDecorationUrl?: string | null;
  avatarDecorationHue?: number;
  profileEffectUrl?: string | null;
  profileEffectHue?: number;
  bannerImageUrl?: string | null;
  bannerBlend?: boolean;
  bannerBackgroundUrl?: string | null;
  bannerBackgroundSound?: boolean;
}) {
  const userId = await getSessionUserId();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const urlFields = [data.avatarUrl, data.bannerImageUrl, data.bannerBackgroundUrl, data.avatarDecorationUrl];
  if (data.profileEffectUrl && !data.profileEffectUrl.startsWith("effect:")) {
    urlFields.push(data.profileEffectUrl);
  }
  if (urlFields.some(url => !isValidMediaUrl(url))) {
    throw new Error("Invalid media URL.");
  }

  const avatarUrlVal = data.avatarUrl === "" ? null : data.avatarUrl;
  const bannerImageUrlVal = data.bannerImageUrl === "" ? null : data.bannerImageUrl;
  const bannerBackgroundUrlVal = data.bannerBackgroundUrl === "" ? null : data.bannerBackgroundUrl;

  const setData: Record<string, unknown> = {};

  if (data.displayName !== undefined) setData.displayName = data.displayName.slice(0, 32);
  if (data.location !== undefined) setData.location = data.location.slice(0, 50);
  if (data.timezone !== undefined) setData.timezone = data.timezone.slice(0, 50);
  if (data.occupation !== undefined) setData.occupation = data.occupation.slice(0, 50);
  if (data.bio !== undefined) {
    let bioVal = data.bio;
    if (bioVal.split('\n').length > 5) {
      bioVal = bioVal.split('\n').slice(0, 5).join('\n');
    }
    setData.bio = bioVal.slice(0, 200);
  }
  if (avatarUrlVal !== undefined) setData.avatarUrl = avatarUrlVal;
  if (data.avatarShape !== undefined) setData.avatarShape = data.avatarShape;
  if (data.avatarDecorationUrl !== undefined) setData.avatarDecorationUrl = data.avatarDecorationUrl;
  if (data.avatarDecorationHue !== undefined) setData.avatarDecorationHue = data.avatarDecorationHue;

  if (data.profileEffectUrl !== undefined) {
    if (data.profileEffectUrl === "" || data.profileEffectUrl === null) {
      setData.profileEffectUrl = null;
    } else {
      setData.profileEffectUrl = data.profileEffectUrl;
    }
  }
  if (data.profileEffectHue !== undefined) setData.profileEffectHue = data.profileEffectHue;

  if (bannerImageUrlVal !== undefined) setData.bannerImageUrl = bannerImageUrlVal;
  if (data.bannerBlend !== undefined) setData.bannerBlend = data.bannerBlend;
  if (bannerBackgroundUrlVal !== undefined) setData.bannerBackgroundUrl = bannerBackgroundUrlVal;
  if (data.bannerBackgroundSound !== undefined) setData.bannerBackgroundSound = !!data.bannerBackgroundSound;

  sanitizeProfileSettings(setData);

  const prev = await getUserById(userId);

  if (Object.keys(setData).length > 0) {
    await db
      .insert(schema.userSettings)
      .values({ userId, ...setData })
      .onDuplicateKeyUpdate({ set: setData });
  }

  const stale: (string | null | undefined)[] = [];
  if (avatarUrlVal === null) {
    if (prev?.avatarUrl) stale.push(prev.avatarUrl);
  } else if (avatarUrlVal && prev?.avatarUrl && prev.avatarUrl !== avatarUrlVal) {
    stale.push(prev.avatarUrl);
  }
  if (bannerImageUrlVal === null) {
    if (prev?.bannerImageUrl) stale.push(prev.bannerImageUrl);
  } else if (bannerImageUrlVal && prev?.bannerImageUrl && prev.bannerImageUrl !== bannerImageUrlVal) {
    stale.push(prev.bannerImageUrl);
  }
  if (bannerBackgroundUrlVal === null) {
    if (prev?.bannerBackgroundUrl) stale.push(prev.bannerBackgroundUrl);
  } else if (bannerBackgroundUrlVal && prev?.bannerBackgroundUrl && prev.bannerBackgroundUrl !== bannerBackgroundUrlVal) {
    stale.push(prev.bannerBackgroundUrl);
  }
  if (stale.length > 0) await deleteCatboxFiles(stale);

  await invalidateLiveStatsCache(userId);

  revalidatePath("/dashboard/customize/profile/general");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

export async function updateAppearanceProfile(data: {
  pageBgColor?: string;
  profileBgColor?: string;
  profileBgOpacity?: number;
  profileBorderColor?: string;
  profileBorderOpacity?: number;
  profileBorderWidth?: number;
  profileBorderRadius?: number;
  profileCardBlur?: number;
  profileBackgroundBlur?: number;
  profileShadowColor?: string;
  profileShadowOpacity?: number;
  profileOpacity?: number;
  usernameFont?: string;
  usernameFontSize?: number;
  usernameFontWeight?: number;
  usernameLetterSpacing?: number;
  usernameColor?: string;
  usernameMarginBottom?: number;
  bioFont?: string;
  bioFontSize?: number;
  bioFontWeight?: number;
  bioLetterSpacing?: number;
  bioColor?: string;
  sectionTitleFont?: string;
  sectionTitleFontSize?: number;
  sectionTitleFontWeight?: number;
  sectionTitleLetterSpacing?: number;
  sectionDescFont?: string;
  sectionDescFontSize?: number;
  sectionDescFontWeight?: number;
  sectionDescLetterSpacing?: number;
  otherFont?: string;
  otherFontSize?: number;
  otherFontWeight?: number;
  otherLetterSpacing?: number;
  otherColor?: string;
  highlightFont?: string;
  highlightFontSize?: number;
  highlightFontWeight?: number;
  highlightLetterSpacing?: number;
  widgetFont?: string;
  widgetFontSize?: number;
  widgetFontWeight?: number;
  widgetLetterSpacing?: number;
  joinDateEnabled?: boolean;
  joinDateFormat?: string;
  viewsEnabled?: boolean;
  viewsAnimationEnabled?: boolean;
  viewsAnimationDuration?: number;
  commentsEnabled?: boolean;
  showCommentsPublicly?: boolean;
  allowNewComments?: boolean;
  feedbackEnabled?: boolean;
  showFeedbackPublicly?: boolean;
  showUidTooltip?: boolean;
  showLocationTooltip?: boolean;
  showOccupationTooltip?: boolean;
  showLikesTooltip?: boolean;
  showDislikesTooltip?: boolean;
  showJoinDateTooltip?: boolean;
  showViewsTooltip?: boolean;
}) {
  const userId = await getSessionUserId();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const setData: Record<string, unknown> = {};

  if (data.profileBgColor !== undefined) setData.profileBgColor = data.profileBgColor.slice(0, 7);
  if (data.pageBgColor !== undefined) setData.pageBgColor = data.pageBgColor.slice(0, 7);
  if (data.profileBgOpacity !== undefined) setData.profileBgOpacity = data.profileBgOpacity;
  if (data.profileBorderColor !== undefined) setData.profileBorderColor = data.profileBorderColor.slice(0, 7);
  if (data.profileBorderOpacity !== undefined) setData.profileBorderOpacity = data.profileBorderOpacity;
  if (data.profileBorderWidth !== undefined) setData.profileBorderWidth = data.profileBorderWidth;
  if (data.profileBorderRadius !== undefined) setData.profileBorderRadius = data.profileBorderRadius;
  if (data.profileCardBlur !== undefined) setData.profileCardBlur = data.profileCardBlur;
  if (data.profileBackgroundBlur !== undefined) setData.profileBackgroundBlur = data.profileBackgroundBlur;
  if (data.profileShadowColor !== undefined) setData.profileShadowColor = data.profileShadowColor.slice(0, 7);
  if (data.profileShadowOpacity !== undefined) setData.profileShadowOpacity = data.profileShadowOpacity;
  if (data.profileOpacity !== undefined) setData.profileOpacity = data.profileOpacity;
  if (data.usernameFont !== undefined) setData.usernameFont = data.usernameFont.slice(0, 50);
  if (data.usernameFontSize !== undefined) setData.usernameFontSize = data.usernameFontSize;
  if (data.usernameFontWeight !== undefined) setData.usernameFontWeight = data.usernameFontWeight;
  if (data.usernameLetterSpacing !== undefined) setData.usernameLetterSpacing = data.usernameLetterSpacing;
  if (data.usernameColor !== undefined) setData.usernameColor = data.usernameColor.slice(0, 32);
  if (data.usernameMarginBottom !== undefined) setData.usernameMarginBottom = data.usernameMarginBottom;
  if (data.bioFont !== undefined) setData.bioFont = data.bioFont.slice(0, 50);
  if (data.bioFontSize !== undefined) setData.bioFontSize = data.bioFontSize;
  if (data.bioFontWeight !== undefined) setData.bioFontWeight = data.bioFontWeight;
  if (data.bioLetterSpacing !== undefined) setData.bioLetterSpacing = data.bioLetterSpacing;
  if (data.bioColor !== undefined) setData.bioColor = data.bioColor.slice(0, 32);
  if (data.sectionTitleFont !== undefined) setData.sectionTitleFont = data.sectionTitleFont.slice(0, 50);
  if (data.sectionTitleFontSize !== undefined) setData.sectionTitleFontSize = data.sectionTitleFontSize;
  if (data.sectionTitleFontWeight !== undefined) setData.sectionTitleFontWeight = data.sectionTitleFontWeight;
  if (data.sectionTitleLetterSpacing !== undefined) setData.sectionTitleLetterSpacing = data.sectionTitleLetterSpacing;
  if (data.sectionDescFont !== undefined) setData.sectionDescFont = data.sectionDescFont.slice(0, 50);
  if (data.sectionDescFontSize !== undefined) setData.sectionDescFontSize = data.sectionDescFontSize;
  if (data.sectionDescFontWeight !== undefined) setData.sectionDescFontWeight = data.sectionDescFontWeight;
  if (data.sectionDescLetterSpacing !== undefined) setData.sectionDescLetterSpacing = data.sectionDescLetterSpacing;
  if (data.otherFont !== undefined) setData.otherFont = data.otherFont.slice(0, 50);
  if (data.otherFontSize !== undefined) setData.otherFontSize = data.otherFontSize;
  if (data.otherFontWeight !== undefined) setData.otherFontWeight = data.otherFontWeight;
  if (data.otherLetterSpacing !== undefined) setData.otherLetterSpacing = data.otherLetterSpacing;
  if (data.otherColor !== undefined) setData.otherColor = data.otherColor.slice(0, 32);
  if (data.highlightFont !== undefined) setData.highlightFont = data.highlightFont.slice(0, 50);
  if (data.highlightFontSize !== undefined) setData.highlightFontSize = data.highlightFontSize;
  if (data.highlightFontWeight !== undefined) setData.highlightFontWeight = data.highlightFontWeight;
  if (data.highlightLetterSpacing !== undefined) setData.highlightLetterSpacing = data.highlightLetterSpacing;
  if (data.widgetFont !== undefined) setData.widgetFont = data.widgetFont.slice(0, 50);
  if (data.widgetFontSize !== undefined) setData.widgetFontSize = data.widgetFontSize;
  if (data.widgetFontWeight !== undefined) setData.widgetFontWeight = data.widgetFontWeight;
  if (data.widgetLetterSpacing !== undefined) setData.widgetLetterSpacing = data.widgetLetterSpacing;
  if (data.joinDateEnabled !== undefined) setData.joinDateEnabled = data.joinDateEnabled;
  if (data.joinDateFormat !== undefined) setData.joinDateFormat = data.joinDateFormat.slice(0, 32);
  if (data.viewsEnabled !== undefined) setData.viewsEnabled = data.viewsEnabled;
  if (data.viewsAnimationEnabled !== undefined) setData.viewsAnimationEnabled = data.viewsAnimationEnabled;
  if (data.viewsAnimationDuration !== undefined) setData.viewsAnimationDuration = data.viewsAnimationDuration;
  if (data.commentsEnabled !== undefined) setData.commentsEnabled = data.commentsEnabled;
  if (data.showCommentsPublicly !== undefined) setData.showCommentsPublicly = data.showCommentsPublicly;
  if (data.allowNewComments !== undefined) setData.allowNewComments = data.allowNewComments;
  if (data.feedbackEnabled !== undefined) setData.feedbackEnabled = data.feedbackEnabled;
  if (data.showFeedbackPublicly !== undefined) setData.showFeedbackPublicly = data.showFeedbackPublicly;
  if (data.showUidTooltip !== undefined) setData.showUidTooltip = data.showUidTooltip;
  if (data.showLocationTooltip !== undefined) setData.showLocationTooltip = data.showLocationTooltip;
  if (data.showOccupationTooltip !== undefined) setData.showOccupationTooltip = data.showOccupationTooltip;
  if (data.showLikesTooltip !== undefined) setData.showLikesTooltip = data.showLikesTooltip;
  if (data.showDislikesTooltip !== undefined) setData.showDislikesTooltip = data.showDislikesTooltip;
  if (data.showJoinDateTooltip !== undefined) setData.showJoinDateTooltip = data.showJoinDateTooltip;
  if (data.showViewsTooltip !== undefined) setData.showViewsTooltip = data.showViewsTooltip;

  sanitizeProfileSettings(setData);

  if (Object.keys(setData).length === 0) return { success: true };

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  await invalidateLiveStatsCache(userId);

  revalidatePath("/dashboard/customize/profile/appearance");
  revalidatePath("/dashboard/customize/profile/fonts");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

export async function updateColorsProfile(data: {
  usernameColor?: string | null;
  bioColor?: string | null;
  otherColor?: string | null;
  pageBgColor?: string | null;
  widgetPrimaryTextColor?: string | null;
  widgetSecondaryTextColor?: string | null;
  widgetBorderColor?: string | null;
}) {
  const userId = await getSessionUserId();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const setData: Record<string, unknown> = {};

  if (data.usernameColor !== undefined) setData.usernameColor = data.usernameColor?.slice(0, 32) ?? null;
  if (data.bioColor !== undefined) setData.bioColor = data.bioColor?.slice(0, 32) ?? null;
  if (data.otherColor !== undefined) setData.otherColor = data.otherColor?.slice(0, 32) ?? null;
  if (data.pageBgColor !== undefined) setData.pageBgColor = data.pageBgColor?.slice(0, 7) ?? null;
  if (data.widgetPrimaryTextColor !== undefined) setData.widgetPrimaryTextColor = data.widgetPrimaryTextColor?.slice(0, 32) ?? null;
  if (data.widgetSecondaryTextColor !== undefined) setData.widgetSecondaryTextColor = data.widgetSecondaryTextColor?.slice(0, 32) ?? null;
  if (data.widgetBorderColor !== undefined) setData.widgetBorderColor = data.widgetBorderColor?.slice(0, 32) ?? null;

  sanitizeProfileSettings(setData);

  if (Object.keys(setData).length === 0) return { success: true };
  
  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/colors");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);
  
  return { success: true };
}

const PROFILE_STRUCTURES = ["standard", "sectioned"] as const;

const CONTENT_ALIGNMENTS = ["left", "center"] as const;

const AVATAR_PLACEMENTS = ["top", "left", "right", "floating"] as const;

const DETAIL_PLACEMENTS = ["top", "beside", "bottom-profile", "bottom-page", "hidden"] as const;

const DETAIL_PLACEMENT_FIELDS = [
  "joinDatePlacement",
  "locationPlacement",
  "occupationPlacement",
  "uidPlacement",
  "viewsPlacement",
  "feedbackPlacement",
] as const;

const PROFILE_PRESETS = ["split", "floating", "modern", "classic"] as const;

const MAX_WIDGETS = 4;

export async function updateLayoutProfile(data: {
  profileStructure?: string;
  aboutSectionEnabled?: boolean;
  aboutSectionTitle?: string;
  aboutSectionDescription?: string;
  widgetsSectionEnabled?: boolean;
  profilePreset?: string;
  wrapInCard?: boolean;
  contentWidth?: number;
  profileOpacity?: number;
  joinDatePlacement?: string;
  locationPlacement?: string;
  occupationPlacement?: string;
  uidPlacement?: string;
  viewsPlacement?: string;
  feedbackPlacement?: string;
  contentAlignment?: string;
  avatarPlacement?: string;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const setData: Record<string, unknown> = {};

  if (data.profileStructure !== undefined) {
    if (!PROFILE_STRUCTURES.includes(data.profileStructure as (typeof PROFILE_STRUCTURES)[number])) {
      throw new Error("Invalid profile structure");
    }
    setData.profileStructure = data.profileStructure;
  }

  if (data.profilePreset !== undefined) {
    if (!PROFILE_PRESETS.includes(data.profilePreset as (typeof PROFILE_PRESETS)[number])) {
      throw new Error("Invalid profile preset");
    }
    setData.profilePreset = data.profilePreset;
  }

  if (data.aboutSectionEnabled !== undefined) {
    setData.aboutSectionEnabled = data.aboutSectionEnabled;
  }

  if (data.aboutSectionTitle !== undefined) {
    setData.aboutSectionTitle = data.aboutSectionTitle.trim().slice(0, 60) || "About";
  }

  if (data.aboutSectionDescription !== undefined) {
    setData.aboutSectionDescription = data.aboutSectionDescription.trim().slice(0, 1000) || null;
  }

  if (data.widgetsSectionEnabled !== undefined) {
    setData.widgetsSectionEnabled = data.widgetsSectionEnabled;
  }

  if (data.wrapInCard !== undefined) setData.wrapInCard = data.wrapInCard;

  if (data.contentWidth !== undefined) {
    setData.contentWidth = Math.min(1000, Math.max(480, Math.round(data.contentWidth)));
  }

  if (data.profileOpacity !== undefined) {
    setData.profileOpacity = Math.min(100, Math.max(10, Math.round(data.profileOpacity)));
  }

  for (const field of DETAIL_PLACEMENT_FIELDS) {
    const value = data[field];
    if (value === undefined) continue;
    if (!DETAIL_PLACEMENTS.includes(value as (typeof DETAIL_PLACEMENTS)[number])) {
      throw new Error(`Invalid ${field}`);
    }
    setData[field] = value;
  }

  if (data.contentAlignment !== undefined) {
    if (!CONTENT_ALIGNMENTS.includes(data.contentAlignment as (typeof CONTENT_ALIGNMENTS)[number])) {
      throw new Error("Invalid contentAlignment");
    }
    setData.contentAlignment = data.contentAlignment;
  }

  if (data.avatarPlacement !== undefined) {
    if (!AVATAR_PLACEMENTS.includes(data.avatarPlacement as (typeof AVATAR_PLACEMENTS)[number])) {
      throw new Error("Invalid avatarPlacement");
    }
    setData.avatarPlacement = data.avatarPlacement;
  }

  sanitizeProfileSettings(setData);

  if (Object.keys(setData).length === 0) return { success: true };

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/layout");
  revalidatePath("/dashboard/customize/profile/section-builder");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

export async function updateMetadataProfile(data: {
  embedTitle?: string;
  embedDescription?: string;
  embedColor?: string;
  embedBackgroundUrl?: string | null;
  embedIconUrl?: string | null;
  faviconUrl?: string | null;
  cursorUrl?: string | null;
  tabTitle?: string;
  tabTitleAnimated?: boolean;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const setData: Record<string, unknown> = {};

  if (data.embedTitle !== undefined) {
    const val = data.embedTitle.trim().slice(0, 100);
    setData.embedTitle = val === "" ? null : val;
  }

  if (data.embedDescription !== undefined) {
    const val = data.embedDescription.trim().slice(0, 250);
    setData.embedDescription = val === "" ? null : val;
  }

  if (data.embedColor !== undefined) {
    const val = data.embedColor.trim().toLowerCase();
    setData.embedColor = /^#[0-9a-f]{6}$/.test(val) ? val : DEFAULT_EMBED_COLOR;
  }

  if (data.embedBackgroundUrl !== undefined) {
    if (data.embedBackgroundUrl && (!isValidMediaUrl(data.embedBackgroundUrl) || isVideoUrl(data.embedBackgroundUrl))) {
      throw new Error("Invalid card background URL");
    }
    setData.embedBackgroundUrl = data.embedBackgroundUrl || null;
  }

  if (data.embedIconUrl !== undefined) {
    if (data.embedIconUrl && (!isValidMediaUrl(data.embedIconUrl) || isVideoUrl(data.embedIconUrl))) {
      throw new Error("Invalid card icon URL");
    }
    setData.embedIconUrl = data.embedIconUrl || null;
  }

  if (data.faviconUrl !== undefined) {
    if (!isValidMediaUrl(data.faviconUrl)) throw new Error("Invalid favicon URL");
    setData.faviconUrl = data.faviconUrl || null;
  }

  if (data.cursorUrl !== undefined) {
    if (!isValidMediaUrl(data.cursorUrl)) throw new Error("Invalid cursor URL");
    setData.cursorUrl = data.cursorUrl || null;
  }

  if (data.tabTitle !== undefined) {
    const val = data.tabTitle.trim().slice(0, 60);
    setData.tabTitle = val === "" ? null : val;
  }

  if (data.tabTitleAnimated !== undefined) {
    setData.tabTitleAnimated = Boolean(data.tabTitleAnimated);
  }

  if (Object.keys(setData).length === 0) return { success: true };

  const prev = await getUserById(userId);

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  const stale: (string | null | undefined)[] = [];
  if (typeof setData.embedBackgroundUrl === "string") {
    if (!setData.embedBackgroundUrl && prev?.embedBackgroundUrl) stale.push(prev.embedBackgroundUrl);
    else if (setData.embedBackgroundUrl !== prev?.embedBackgroundUrl && prev?.embedBackgroundUrl) stale.push(prev.embedBackgroundUrl);
  }
  if (typeof setData.embedIconUrl === "string") {
    if (!setData.embedIconUrl && prev?.embedIconUrl) stale.push(prev.embedIconUrl);
    else if (setData.embedIconUrl !== prev?.embedIconUrl && prev?.embedIconUrl) stale.push(prev.embedIconUrl);
  }
  if (typeof setData.faviconUrl === "string") {
    if (!setData.faviconUrl && prev?.faviconUrl) stale.push(prev.faviconUrl);
    else if (setData.faviconUrl !== prev?.faviconUrl && prev?.faviconUrl) stale.push(prev.faviconUrl);
  }
  if (typeof setData.cursorUrl === "string") {
    if (!setData.cursorUrl && prev?.cursorUrl) stale.push(prev.cursorUrl);
    else if (setData.cursorUrl !== prev?.cursorUrl && prev?.cursorUrl) stale.push(prev.cursorUrl);
  }
  if (stale.length > 0) await deleteCatboxFiles(stale);

  revalidatePath("/dashboard/customize/metadata");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

export async function updateEffectsProfile(data: {
  backgroundEffect?: string | null;
  backgroundEffectIntensity?: number | null;
  backgroundEffectColor?: string | null;
  backgroundEffectAboveContainer?: boolean | null;
  borderEffect?: string | null;
  borderEffectColor?: string | null;
  cardEffect?: string | null;
  cardTransition?: string | null;
  usernameEffect?: string | null;
  descriptionEffect?: string | null;
  cursorTrail?: string | null;
  cursorTrailColor?: string | null;
  entryTransition?: string | null;
  enterScreenEnabled?: boolean | null;
  enterScreenText?: string | null;
  enterScreenFont?: string | null;
  enterScreenFontSize?: number | null;
  enterScreenFontWeight?: number | null;
  enterScreenLetterSpacing?: number | null;
  enterScreenColor?: string | null;
  enterScreenOpacity?: number | null;
  enterScreenBlur?: number | null;
  enterScreenBlurColor?: string | null;
}) {
  const userId = await getSessionUserId();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const setData: Record<string, unknown> = {};

  if (data.backgroundEffect !== undefined) setData.backgroundEffect = data.backgroundEffect?.slice(0, 50) ?? null;
  if (data.backgroundEffectIntensity !== undefined) setData.backgroundEffectIntensity = data.backgroundEffectIntensity;
  if (data.backgroundEffectColor !== undefined) setData.backgroundEffectColor = data.backgroundEffectColor?.slice(0, 32) ?? null;
  if (data.backgroundEffectAboveContainer !== undefined) setData.backgroundEffectAboveContainer = data.backgroundEffectAboveContainer ?? false;

  if (data.borderEffect !== undefined) setData.borderEffect = data.borderEffect?.slice(0, 50) ?? null;
  if (data.borderEffectColor !== undefined) setData.borderEffectColor = data.borderEffectColor?.slice(0, 32) ?? null;

  if (data.cardEffect !== undefined) setData.cardEffect = data.cardEffect?.slice(0, 50) ?? null;
  if (data.cardTransition !== undefined) setData.cardTransition = data.cardTransition?.slice(0, 50) ?? null;
  if (data.usernameEffect !== undefined) setData.usernameEffect = data.usernameEffect?.slice(0, 50) ?? null;
  if (data.descriptionEffect !== undefined) setData.descriptionEffect = data.descriptionEffect?.slice(0, 50) ?? null;
  if (data.cursorTrail !== undefined) setData.cursorTrail = data.cursorTrail?.slice(0, 50) ?? null;
  if (data.cursorTrailColor !== undefined) setData.cursorTrailColor = data.cursorTrailColor?.slice(0, 32) ?? null;
  if (data.entryTransition !== undefined) setData.entryTransition = data.entryTransition?.slice(0, 50) ?? null;
  if (data.enterScreenEnabled !== undefined) setData.enterScreenEnabled = data.enterScreenEnabled ?? false;
  if (data.enterScreenText !== undefined) setData.enterScreenText = data.enterScreenText?.slice(0, 100) ?? 'click to enter';
  if (data.enterScreenFont !== undefined) setData.enterScreenFont = data.enterScreenFont?.slice(0, 50) ?? 'Inter';
  if (data.enterScreenFontSize !== undefined) setData.enterScreenFontSize = data.enterScreenFontSize;
  if (data.enterScreenFontWeight !== undefined) setData.enterScreenFontWeight = data.enterScreenFontWeight;
  if (data.enterScreenLetterSpacing !== undefined) setData.enterScreenLetterSpacing = data.enterScreenLetterSpacing;
  if (data.enterScreenColor !== undefined) setData.enterScreenColor = data.enterScreenColor?.slice(0, 32) ?? '#ffffff';
  if (data.enterScreenOpacity !== undefined) setData.enterScreenOpacity = data.enterScreenOpacity;
  if (data.enterScreenBlur !== undefined) setData.enterScreenBlur = data.enterScreenBlur;
  if (data.enterScreenBlurColor !== undefined) setData.enterScreenBlurColor = data.enterScreenBlurColor?.slice(0, 32) ?? '#000000';

  sanitizeProfileSettings(setData);

  if (Object.keys(setData).length === 0) return { success: true };
  
  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/effects");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

export async function updateProfileWidgets(data: {
  widgetBorderWidth?: number;
  widgetBorderRadius?: number;
  widgetBorderOpacity?: number;
  widgets: Array<{
    id: string;
    platform: string;
    type: string;
    targetId: string;
    useLinked: boolean;
    enabled: boolean;
    imageShape?: "circle" | "rounded" | "square";
    showActivity?: boolean;
    showActivityImage?: boolean;
    activityImageShape?: "circle" | "rounded" | "square";
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
    placement?: "inside" | "outside";
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
    valorantRankMode?: "current" | "highest";
    valorantAvatar?: "rank-icon" | "last-agent";
    valorantBackground?: "none" | "player-card" | "last-map";
    valorantMatchSource?: "any" | "competitive";
    showRank?: boolean;
    valorantRankStyle?: "name" | "icon";
    showRR?: boolean;
    showLevel?: boolean;
    steamShowLevel?: boolean;
    steamShowGames?: boolean;
    steamShowMemberSince?: boolean;
    steamShowAvatarFrame?: boolean;
    steamShowAnimatedAvatar?: boolean;
    steamBackground?: "none" | "large" | "small";
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
    youtubeMode?: "channel" | "latest-video";
    youtubeImageSource?: "channel-avatar" | "video-thumbnail";
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
  }>;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  // No per-type limits — any mix allowed, only the total cap applies.
  if ((data.widgets || []).length > MAX_WIDGETS) {
    throw new Error(`You can only add a maximum of ${MAX_WIDGETS} widgets.`);
  }

  const sanitizedWidgets = (data.widgets || []).slice(0, MAX_WIDGETS).map((w) => {
    const platform =
      w.platform === "github"
        ? "github"
        : w.platform === "pinterest"
        ? "pinterest"
        : w.platform === "valorant"
        ? "valorant"
        : w.platform === "steam"
        ? "steam"
        : w.platform === "genshin"
        ? "genshin"
        : w.platform === "twitch"
        ? "twitch"
        : w.platform === "spotify"
        ? "spotify"
        : w.platform === "tiktok"
        ? "tiktok"
        : w.platform === "youtube"
        ? "youtube"
        : w.platform === "telegram"
        ? "telegram"
        : w.platform === "roblox"
        ? "roblox"
        : w.platform === "weather"
        ? "weather"
        : "discord";
    const type =
      w.type === "server"
        ? "server"
        : w.type === "github-user" || w.type === "user"
        ? "github-user"
        : w.type === "github-repo" || w.type === "repo"
        ? "github-repo"
        : w.type === "pinterest-profile" || w.type === "profile"
        ? "pinterest-profile"
        : w.type === "pinterest-board" || w.type === "board"
        ? "pinterest-board"
        : w.type === "valorant-profile" || w.platform === "valorant"
        ? "valorant-profile"
        : w.type === "steam-profile" || w.platform === "steam"
        ? "steam-profile"
        : w.type === "genshin-profile" || w.platform === "genshin"
        ? "genshin-profile"
        : w.type === "twitch-channel" || w.platform === "twitch"
        ? "twitch-channel"
        : w.type === "spotify-track"
        ? "spotify-track"
        : w.type === "spotify-album"
        ? "spotify-album"
        : w.type === "spotify-playlist"
        ? "spotify-playlist"
        : w.type === "spotify-artist"
        ? "spotify-artist"
        : w.type === "spotify-user"
        ? "spotify-user"
        : w.type === "tiktok-profile" || w.platform === "tiktok"
        ? "tiktok-profile"
        : w.type === "youtube-profile" || w.platform === "youtube"
        ? "youtube-profile"
        : w.type === "telegram-profile" || w.platform === "telegram"
        ? "telegram-profile"
        : w.type === "roblox-profile" || w.platform === "roblox"
        ? "roblox-profile"
        : w.type === "weather-current" || w.platform === "weather"
        ? "weather-current"
        : "presence";
    let targetId = "";
    let useLinked = false;

    if (platform === "discord") {
      if (type === "server") {
        targetId = String(w.targetId || "").trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "").slice(0, 100);
        if (!targetId || targetId.length < 2) {
          throw new Error("Invalid Discord invite code format");
        }
      } else {
        useLinked = Boolean(w.useLinked) && Boolean(user.discordId);
        targetId = String(w.targetId || "").replace(/\D/g, "").slice(0, 20);
        if (useLinked && user.discordId) {
          targetId = user.discordId;
        }
        if (!/^\d{17,20}$/.test(targetId)) {
          throw new Error("Invalid Discord ID format");
        }
      }
    } else if (platform === "steam") {
      targetId = String(w.targetId || "")
        .trim()
        .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, "")
        .replace(/\/$/, "")
        .slice(0, 100);
      if (!targetId || !/^[a-zA-Z0-9_.-]{2,64}$/.test(targetId)) {
        throw new Error("Invalid Steam vanity URL or ID format");
      }
    } else if (platform === "github") {
      if (type === "github-repo") {
        targetId = String(w.targetId || "").trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "").slice(0, 100);
        const parts = targetId.split("/");
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          throw new Error("Invalid GitHub repository format (owner/repo)");
        }
      } else {
        targetId = String(w.targetId || "").trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "").slice(0, 39);
        if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(targetId)) {
          throw new Error("Invalid GitHub username format");
        }
      }
    } else if (platform === "pinterest") {
      if (type === "pinterest-board") {
        targetId = String(w.targetId || "").trim().replace(/^https?:\/\/(www\.)?pinterest\.com\//i, "").replace(/\/$/, "").slice(0, 100);
        const parts = targetId.split("/").filter(Boolean);
        if (parts.length < 2 || !parts[0] || !parts[1]) {
          throw new Error("Invalid Pinterest board format (username/board)");
        }
      } else {
        targetId = String(w.targetId || "").trim().replace(/^https?:\/\/(www\.)?pinterest\.com\//i, "").replace(/\/$/, "").slice(0, 30);
        if (!/^[a-zA-Z0-9_]{1,30}$/.test(targetId)) {
          throw new Error("Invalid Pinterest username format");
        }
      }
    } else if (platform === "valorant") {
      targetId = String(w.targetId || "").trim().slice(0, 30);
      if (!/^.{3,16}#[a-zA-Z0-9]{3,5}$/.test(targetId)) {
        throw new Error("Invalid Riot ID format (name#tag)");
      }
    } else if (platform === "genshin") {
      targetId = String(w.targetId || "").trim().slice(0, 20);
      if (!/^[1-9][0-9]{8,9}$/.test(targetId)) {
        throw new Error("Invalid Genshin Impact UID format (must be 9-10 digits)");
      }
    } else if (platform === "twitch") {
      targetId = String(w.targetId || "").trim().toLowerCase().slice(0, 25);
      if (!/^[a-zA-Z0-9_]{3,25}$/.test(targetId)) {
        throw new Error("Invalid Twitch username format (3-25 alphanumeric/underscore)");
      }
    } else if (platform === "spotify") {
      targetId = String(w.targetId || "").trim().slice(0, 100);
      if (!targetId || (!/^[a-zA-Z0-9]{22}$/.test(targetId) && !/^[a-zA-Z0-9_.-]{1,64}$/.test(targetId))) {
        throw new Error("Invalid Spotify ID format");
      }
    } else if (platform === "tiktok") {
      targetId = String(w.targetId || "")
        .trim()
        .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "")
        .replace(/^@/, "")
        .replace(/\/$/, "")
        .slice(0, 50);
      if (!targetId || !/^[a-zA-Z0-9_.-]{1,50}$/.test(targetId)) {
        throw new Error("Invalid TikTok username format");
      }
    } else if (platform === "youtube") {
      targetId = cleanYouTubeInput(String(w.targetId || "")).slice(0, 30);
      if (!targetId || !/^(UC[\w-]{22}|@?[a-zA-Z0-9_.-]{3,30})$/.test(targetId)) {
        throw new Error("Invalid YouTube channel format");
      }
    } else if (platform === "telegram") {
      targetId = cleanTelegramUsername(String(w.targetId || "")).slice(0, 32);
      if (!isValidTelegramUsername(targetId)) {
        throw new Error(
          "Invalid Telegram username format (5-32 characters, letters/numbers/underscore, must start with a letter)"
        );
      }
    } else if (platform === "roblox") {
      targetId = cleanRobloxInput(String(w.targetId || "")).slice(0, 20);
      if (!isValidRobloxInput(targetId)) {
        throw new Error(
          "Invalid Roblox user ID or username (3-20 letters, numbers and underscores)"
        );
      }
    } else if (platform === "weather") {
      targetId = cleanWeatherLocation(String(w.targetId || "")).slice(0, 80);
      if (!isValidWeatherLocation(targetId)) {
        throw new Error(
          "Invalid location (a city name, optionally with state and country, or 'lat,lon' coordinates)"
        );
      }
    }

    const imageShape: "circle" | "rounded" | "square" =
      w.imageShape === "circle" || w.imageShape === "square" ? w.imageShape : "rounded";
    const activityImageShape: "circle" | "rounded" | "square" =
      w.activityImageShape === "circle" || w.activityImageShape === "square"
        ? w.activityImageShape
        : "rounded";

    const steamShowBackgroundImage = Boolean(w.steamShowBackgroundImage);
    const steamBackground: "none" | "large" | "small" = steamShowBackgroundImage
      ? "none"
      : w.steamBackground === "none" || w.steamBackground === "small"
      ? w.steamBackground
      : "large";

    const genshinShowBackgroundImage = Boolean(w.genshinShowBackgroundImage);
    const genshinShowBackground = genshinShowBackgroundImage
      ? false
      : w.genshinShowBackground !== undefined
      ? Boolean(w.genshinShowBackground)
      : true;

    return {
      id: String(w.id || `widget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).slice(0, 50),
      platform,
      type,
      targetId,
      useLinked,
      enabled: Boolean(w.enabled),
      imageShape,
      showActivity: w.showActivity !== undefined ? Boolean(w.showActivity) : true,
      showActivityImage: w.showActivityImage !== undefined ? Boolean(w.showActivityImage) : true,
      activityImageShape,
      showAvatarDecoration: w.showAvatarDecoration !== undefined ? Boolean(w.showAvatarDecoration) : true,
      showGuildTag: w.showGuildTag !== undefined ? Boolean(w.showGuildTag) : true,
      showBadges: w.showBadges !== undefined ? Boolean(w.showBadges) : true,
      badgeOrder: Array.isArray(w.badgeOrder) ? w.badgeOrder.map(String).slice(0, 50) : undefined,
      hiddenBadges: Array.isArray(w.hiddenBadges) ? w.hiddenBadges.map(String).slice(0, 50) : undefined,
      showLastSeen: w.showLastSeen !== undefined ? Boolean(w.showLastSeen) : true,
      fallbackText: typeof w.fallbackText === "string" ? w.fallbackText.slice(0, 100) : undefined,
      showMemberCount: w.showMemberCount !== undefined ? Boolean(w.showMemberCount) : true,
      showOnlineCount: w.showOnlineCount !== undefined ? Boolean(w.showOnlineCount) : true,
      showBanner: w.showBanner !== undefined ? Boolean(w.showBanner) : true,
      placement: (w.placement === "outside" ? "outside" : "inside") as "inside" | "outside",
      showFollowers: w.showFollowers !== undefined ? Boolean(w.showFollowers) : true,
      showFollowing: w.showFollowing !== undefined ? Boolean(w.showFollowing) : true,
      showPublicRepos: w.showPublicRepos !== undefined ? Boolean(w.showPublicRepos) : true,
      showViewButton: w.showViewButton !== undefined ? Boolean(w.showViewButton) : true,
      showBackgroundOverlay: w.showBackgroundOverlay !== undefined ? Boolean(w.showBackgroundOverlay) : true,
      showContributionHeatmap: w.showContributionHeatmap !== undefined ? Boolean(w.showContributionHeatmap) : false,
      showStars: w.showStars !== undefined ? Boolean(w.showStars) : true,
      showForks: w.showForks !== undefined ? Boolean(w.showForks) : true,
      showWatchers: w.showWatchers !== undefined ? Boolean(w.showWatchers) : true,
      showOpenIssues: w.showOpenIssues !== undefined ? Boolean(w.showOpenIssues) : true,
      showPrimaryLanguage: w.showPrimaryLanguage !== undefined ? Boolean(w.showPrimaryLanguage) : true,
      showPinCount: w.showPinCount !== undefined ? Boolean(w.showPinCount) : true,
      imageBackground: w.imageBackground !== undefined ? Boolean(w.imageBackground) : true,
      valorantRankMode: w.valorantRankMode === "highest" ? "highest" : "current",
      valorantAvatar: w.valorantAvatar === "last-agent" ? "last-agent" : "rank-icon",
      valorantBackground:
        w.valorantBackground === "none" || w.valorantBackground === "player-card"
          ? w.valorantBackground
          : "last-map",
      valorantMatchSource: w.valorantMatchSource === "any" ? "any" : "competitive",
      showRank: w.showRank !== undefined ? Boolean(w.showRank) : true,
      valorantRankStyle: w.valorantRankStyle === "icon" ? "icon" : "name",
      showRR: w.showRR !== undefined ? Boolean(w.showRR) : true,
      showLevel: w.showLevel !== undefined ? Boolean(w.showLevel) : true,
      steamShowLevel: w.steamShowLevel !== undefined ? Boolean(w.steamShowLevel) : true,
      steamShowGames: w.steamShowGames !== undefined ? Boolean(w.steamShowGames) : true,
      steamShowMemberSince: w.steamShowMemberSince !== undefined ? Boolean(w.steamShowMemberSince) : true,
      steamShowAvatarFrame: w.steamShowAvatarFrame !== undefined ? Boolean(w.steamShowAvatarFrame) : true,
      steamShowAnimatedAvatar: w.steamShowAnimatedAvatar !== undefined ? Boolean(w.steamShowAnimatedAvatar) : true,
      steamBackground,
      steamShowBackgroundImage,
      genshinShowAr: w.genshinShowAr !== undefined ? Boolean(w.genshinShowAr) : true,
      genshinShowWorldLevel: w.genshinShowWorldLevel !== undefined ? Boolean(w.genshinShowWorldLevel) : true,
      genshinShowAchievements: w.genshinShowAchievements !== undefined ? Boolean(w.genshinShowAchievements) : true,
      genshinShowRegion: w.genshinShowRegion !== undefined ? Boolean(w.genshinShowRegion) : true,
      genshinShowBackground,
      genshinShowBackgroundImage,
      twitchShowLiveStatus: w.twitchShowLiveStatus !== undefined ? Boolean(w.twitchShowLiveStatus) : true,
      twitchShowFollowers: w.twitchShowFollowers !== undefined ? Boolean(w.twitchShowFollowers) : true,
      twitchShowPartnerBadge: w.twitchShowPartnerBadge !== undefined ? Boolean(w.twitchShowPartnerBadge) : true,
      twitchShowBackground: w.twitchShowBackground !== undefined ? Boolean(w.twitchShowBackground) : true,
      spotifyShowArtist: w.spotifyShowArtist !== undefined ? Boolean(w.spotifyShowArtist) : true,
      spotifyShowAlbum: w.spotifyShowAlbum !== undefined ? Boolean(w.spotifyShowAlbum) : true,
      spotifyShowTrackCount: w.spotifyShowTrackCount !== undefined ? Boolean(w.spotifyShowTrackCount) : true,
      spotifyShowReleaseYear: w.spotifyShowReleaseYear !== undefined ? Boolean(w.spotifyShowReleaseYear) : true,
      spotifyShowOwner: w.spotifyShowOwner !== undefined ? Boolean(w.spotifyShowOwner) : true,
      spotifyShowMonthlyListeners: w.spotifyShowMonthlyListeners !== undefined ? Boolean(w.spotifyShowMonthlyListeners) : true,
      spotifyShowFollowers: w.spotifyShowFollowers !== undefined ? Boolean(w.spotifyShowFollowers) : true,
      spotifyShowBackground: w.spotifyShowBackground !== undefined ? Boolean(w.spotifyShowBackground) : true,
      tiktokShowFollowers: w.tiktokShowFollowers !== undefined ? Boolean(w.tiktokShowFollowers) : true,
      tiktokShowFollowing: w.tiktokShowFollowing !== undefined ? Boolean(w.tiktokShowFollowing) : true,
      tiktokShowLikes: w.tiktokShowLikes !== undefined ? Boolean(w.tiktokShowLikes) : true,
      tiktokShowVideos: w.tiktokShowVideos !== undefined ? Boolean(w.tiktokShowVideos) : true,
      tiktokShowVerifiedBadge: w.tiktokShowVerifiedBadge !== undefined ? Boolean(w.tiktokShowVerifiedBadge) : true,
      tiktokShowBackground: w.tiktokShowBackground !== undefined ? Boolean(w.tiktokShowBackground) : true,
      youtubeMode: (w.youtubeMode === "latest-video" ? "latest-video" : "channel") as "channel" | "latest-video",
      youtubeImageSource: (w.youtubeImageSource === "video-thumbnail" ? "video-thumbnail" : "channel-avatar") as "channel-avatar" | "video-thumbnail",
      youtubeShowSubscribers: w.youtubeShowSubscribers !== undefined ? Boolean(w.youtubeShowSubscribers) : true,
      youtubeShowVideoCount: w.youtubeShowVideoCount !== undefined ? Boolean(w.youtubeShowVideoCount) : true,
      youtubeShowTotalViews: w.youtubeShowTotalViews !== undefined ? Boolean(w.youtubeShowTotalViews) : true,
      youtubeShowVideoViews: w.youtubeShowVideoViews !== undefined ? Boolean(w.youtubeShowVideoViews) : true,
      youtubeShowVideoLikes: w.youtubeShowVideoLikes !== undefined ? Boolean(w.youtubeShowVideoLikes) : true,
      youtubeShowUploadDate: w.youtubeShowUploadDate !== undefined ? Boolean(w.youtubeShowUploadDate) : true,
      youtubeShowBackground: w.youtubeShowBackground !== undefined ? Boolean(w.youtubeShowBackground) : false,
      youtubeShowBanner: w.youtubeShowBanner !== undefined ? Boolean(w.youtubeShowBanner) : false,
      telegramShowBio: w.telegramShowBio !== undefined ? Boolean(w.telegramShowBio) : true,
      telegramShowBackground: w.telegramShowBackground !== undefined ? Boolean(w.telegramShowBackground) : false,
      robloxShowFollowers: w.robloxShowFollowers !== undefined ? Boolean(w.robloxShowFollowers) : true,
      robloxShowFriends: w.robloxShowFriends !== undefined ? Boolean(w.robloxShowFriends) : true,
      robloxShowVerifiedBadge: w.robloxShowVerifiedBadge !== undefined ? Boolean(w.robloxShowVerifiedBadge) : true,
      robloxShowBackground: w.robloxShowBackground !== undefined ? Boolean(w.robloxShowBackground) : false,
      weatherUnit: (["celsius", "fahrenheit", "both"] as const).includes(
        w.weatherUnit as "celsius" | "fahrenheit" | "both"
      )
        ? (w.weatherUnit as "celsius" | "fahrenheit" | "both")
        : "celsius",
      weatherShowCondition: w.weatherShowCondition !== undefined ? Boolean(w.weatherShowCondition) : true,
      weatherShowFeelsLike: w.weatherShowFeelsLike !== undefined ? Boolean(w.weatherShowFeelsLike) : false,
      weatherShowLocation: w.weatherShowLocation !== undefined ? Boolean(w.weatherShowLocation) : true,
      weatherShowBackground: w.weatherShowBackground !== undefined ? Boolean(w.weatherShowBackground) : false,
    };
  });

  const setData: Record<string, unknown> = { widgets: sanitizedWidgets };

  if (data.widgetBorderWidth !== undefined) {
    setData.widgetBorderWidth = Math.min(20, Math.max(0, data.widgetBorderWidth));
  }
  if (data.widgetBorderRadius !== undefined) {
    setData.widgetBorderRadius = Math.min(100, Math.max(0, data.widgetBorderRadius));
  }
  if (data.widgetBorderOpacity !== undefined) {
    setData.widgetBorderOpacity = Math.min(
      100,
      Math.max(0, Math.round(data.widgetBorderOpacity))
    );
  }

  sanitizeProfileSettings(setData);

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/widgets");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${user.username}`);
  await purgeCloudflareProfileCache(user.username);

  return { success: true };
}

export type MusicTrackInput = {
  id: string;
  title: string;
  artist: string;
  artwork?: string | null;
  album?: string | null;
  duration?: number | null;
  streamUrl?: string | null;
};

type CachedTrackMedia = {
  streamUrl: string;
  artwork: string | null;
  lyrics: Array<{ text: string; start: number; end: number }> | null;
};

const EVI_BASE = "https://evi.wtf";
const EVI_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function eviHeaders(accept: string): Record<string, string> {
  return {
    "User-Agent": EVI_UA,
    Accept: accept,
    ...(process.env.EVI_COOKIE ? { Cookie: process.env.EVI_COOKIE } : {}),
  };
}

/** Download the 320kbps mp3 from upstream and pin it to Catbox.
 *  Returns null on failure — no upstream fallback, main page is Catbox-only. */
async function cacheTrackAudio(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${EVI_BASE}/api/stream/${encodeURIComponent(id)}?quality=320`, {
      headers: eviHeaders("audio/*,*/*"),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok || !res.body) {
      await res.body?.cancel();
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > 25 * 1024 * 1024) return null;
    return await uploadToCatbox(buf, `track_${id}.mp3`, "audio/mpeg");
  } catch (error) {
    console.error("[Music Cache] audio failed:", error);
    return null;
  }
}

/** Download cover art from upstream and pin it to Catbox. Accepts the local
 *  `/api/music/artwork?...` path or an already-cached Catbox URL. */
async function cacheTrackArtwork(artwork: string | null | undefined): Promise<string | null> {
  if (!artwork) return null;
  if (isCatboxUrl(artwork)) return artwork;
  let artId: string | null = null;
  let artist = "";
  try {
    const u = new URL(artwork, "http://local");
    artId = u.searchParams.get("id");
    artist = u.searchParams.get("artist") ?? "";
  } catch {
    return null;
  }
  if (!artId) return null;
  try {
    const res = await fetch(
      `${EVI_BASE}/api/artwork?id=${encodeURIComponent(artId)}&artist=${encodeURIComponent(artist)}`,
      { headers: eviHeaders("image/*"), signal: AbortSignal.timeout(30000) },
    );
    if (!res.ok || !res.body) {
      await res.body?.cancel();
      return null;
    }
    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!contentType.startsWith("image/")) {
      await res.body.cancel();
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > 5 * 1024 * 1024) return null;
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    return await uploadToCatbox(buf, `art_${artId}.${ext}`, contentType);
  } catch (error) {
    console.error("[Music Cache] artwork failed:", error);
    return null;
  }
}

/** Fetch synced lyrics from upstream (stored as JSON, no file needed). */
async function fetchTrackLyrics(input: {
  id: string;
  title: string;
  artist: string;
  duration: number | null;
}): Promise<CachedTrackMedia["lyrics"]> {
  try {
    const qs = new URLSearchParams({
      id: input.id,
      title: input.title,
      artist: input.artist,
      duration: String(input.duration ?? ""),
    });
    const res = await fetch(`${EVI_BASE}/api/lyrics?${qs.toString()}`, {
      headers: eviHeaders("application/json"),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      await res.body?.cancel();
      return null;
    }
    const data = await res.json().catch(() => null);
    const raw = Array.isArray(data?.lines) ? data.lines : [];
    const lines = raw
      .map((l: { words?: Array<{ word?: string }>; startTime?: number; endTime?: number }) => ({
        text: (Array.isArray(l.words)
          ? l.words.map((w) => (typeof w.word === "string" ? w.word : "")).join("")
          : ""
        ).trim(),
        start: typeof l.startTime === "number" ? l.startTime : 0,
        end: typeof l.endTime === "number" ? l.endTime : 0,
      }))
      .filter((l: { text: string }) => l.text !== "");
    return lines.length > 0 ? lines : null;
  } catch (error) {
    console.error("[Music Cache] lyrics failed:", error);
    return null;
  }
}

export async function updateMusicProfile(data: {
  tracks: MusicTrackInput[];
  playerStyle?: string;
  artBg?: boolean;
  volumeControl?: boolean;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  if ((data.tracks || []).length > 2) {
    throw new Error("You can only add a maximum of 2 tracks.");
  }

  // Re-resolve every track server-side and pin its media to Catbox, so the
  // profile page plays from saved files instead of the upstream API.
  // Tracks that are already cached (Catbox URLs) are reused as-is.
  const prevTracks = Array.isArray(user?.musicTracks) ? user.musicTracks : [];
  const sanitizedTracks = await Promise.all(
    (data.tracks || []).slice(0, 2).map(async (t) => {
      const id = String(t.id || "").trim().slice(0, 32);
      if (!id || !/^[A-Za-z0-9_-]{1,32}$/.test(id)) {
        throw new Error("Invalid track ID.");
      }
      const title = String(t.title || "Untitled").trim().slice(0, 200) || "Untitled";
      const artist = String(t.artist || "Unknown artist").trim().slice(0, 200) || "Unknown artist";
      const album =
        typeof t.album === "string" && t.album.trim()
          ? t.album.trim().slice(0, 200)
          : null;
      const duration =
        typeof t.duration === "number" && Number.isFinite(t.duration) && t.duration > 0
          ? Math.round(t.duration)
          : null;

      // Already cached (e.g. re-save without changes)? Reuse saved media.
      const prev = prevTracks.find((p) => p.id === id);
      if (prev && isCatboxUrl(t.streamUrl) && prev.streamUrl === t.streamUrl) {
        return {
          id,
          title,
          artist,
          artwork: prev.artwork ?? null,
          album,
          duration,
          streamUrl: prev.streamUrl ?? null,
          lyrics: prev.lyrics ?? null,
        };
      }

      const [cachedAudio, artwork, lyrics] = await Promise.all([
        isCatboxUrl(t.streamUrl) ? (t.streamUrl as string) : cacheTrackAudio(id),
        cacheTrackArtwork(typeof t.artwork === "string" ? t.artwork.slice(0, 500) : null),
        fetchTrackLyrics({ id, title, artist, duration }),
      ]);
      // No upstream fallback: a track without a Catbox file can't play on the main page.
      const streamUrl = isCatboxUrl(t.streamUrl) ? (t.streamUrl as string) : cachedAudio;
      if (!streamUrl) {
        throw new Error(`Could not save "${title}" — audio upload failed. Try again.`);
      }
      return { id, title, artist, artwork, album, duration, streamUrl, lyrics };
    }),
  );

  // Background video sound and the music player can't play at once.
  if (sanitizedTracks.length > 0 && user.bannerBackgroundSound) {
    throw new Error("Turn off background sound to use the music player.");
  }

  const playerStyle =
    data.playerStyle === "lyrics" ? "lyrics" : data.playerStyle === "waveform" ? "waveform" : "compact";

  const setData: Record<string, unknown> = {
    musicTracks: sanitizedTracks.length > 0 ? sanitizedTracks : null,
    musicPlayerStyle: playerStyle,
    ...(typeof data.artBg === "boolean" ? { musicPlayerArtBg: data.artBg } : {}),
    ...(typeof data.volumeControl === "boolean" ? { musicPlayerVolume: data.volumeControl } : {}),
  };

  sanitizeProfileSettings(setData);

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  // Delete orphaned Catbox files from tracks that were removed/replaced.
  const kept = new Set(sanitizedTracks.flatMap((t) => [t.streamUrl, t.artwork]));
  const orphaned = prevTracks.flatMap((p) => [p.streamUrl, p.artwork]).filter((u) => u && !kept.has(u));
  if (orphaned.length > 0) await deleteCatboxFiles(orphaned);

  revalidatePath("/dashboard/customize/music");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return {
    success: true,
    tracks: sanitizedTracks,
    artBg: typeof data.artBg === "boolean" ? data.artBg : undefined,
    volumeControl: typeof data.volumeControl === "boolean" ? data.volumeControl : undefined,
  };
}

