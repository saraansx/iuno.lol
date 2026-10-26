"use server";

import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import {
  isPremiumActive,
  isPremiumOption,
  PREMIUM_BACKGROUND_EFFECTS,
  PREMIUM_BORDER_EFFECTS,
  PREMIUM_CARD_EFFECTS,
  PREMIUM_CARD_TRANSITIONS,
  PREMIUM_TEXT_EFFECTS,
  PREMIUM_CLICK_EFFECTS,
  PREMIUM_CLICK_SOUNDS,
  PREMIUM_CURSOR_TRAILS,
  PREMIUM_ENTRY_TRANSITIONS,
} from "@/lib/premium";
import { revalidatePath } from "next/cache";
import { revalidateProfile } from "@/app/[username]/profile-data";
import { profileUpdateRateLimit, musicSaveRateLimit } from "@/lib/rate-limit";
import { invalidateLiveStatsCache } from "@/lib/live-stats-cache";
import { cleanYouTubeInput } from "@/lib/youtube";
import { cleanTelegramUsername, isValidTelegramUsername } from "@/lib/telegram";
import { cleanRobloxInput, isValidRobloxInput } from "@/lib/roblox";
import { cleanWeatherLocation, isValidWeatherLocation } from "@/lib/weather";
import { cleanInstagramUsername, isValidInstagramUsername } from "@/lib/instagram";
import { cleanAppleMusicInput, isValidAppleMusicId } from "@/lib/apple-music";
import {
  cleanSoundcloudHandle,
  cleanSoundcloudTrackPath,
  isValidSoundcloudHandle,
  isValidSoundcloudTrackPath,
} from "@/lib/soundcloud";
import { normalizeProfileSections } from "@/lib/profile-sections";
import { DEFAULT_EMBED_COLOR } from "@/lib/og";
import { isVideoUrl } from "@/lib/utils/media";
import { sanitizeProfileSettings } from "@/lib/profile-settings-sanitize";
import { EFFECT_CONFIG_KEYS, packEffectConfig, pickEffectConfig, type EffectConfig } from "@/lib/effect-config";
import { normalizeDetailLayout } from "@/components/profile/layouts/ProfilePresetLayout";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { isStoredMediaUrl } from "@/lib/cdn";
import { storageDeleteOwned, storagePut } from "@/lib/storage";
import { animatedBackgroundId, isAnimatedBackgroundUrl, isPremiumBackgroundId } from "@/lib/animated-background";
import { MAX_LINKS, sanitizeProfileLink, type ProfileLink } from "@/lib/links";
import { CLICK_EFFECTS, CLICK_SOUNDS } from "@/lib/click-effects";

async function revalidateOwnProfile(userId: number) {
  const user = await getUserById(userId);
  if (user?.username) {
    revalidateProfile(user.username);
    await purgeCloudflareProfileCache(user.username);
  }
}

function isValidMediaUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return isStoredMediaUrl(url) ||
          isAnimatedBackgroundUrl(url) ||
          url.startsWith("https://cdn.discordapp.com/") ||
          url.startsWith("https://discord-decoration.art/");
}

async function updateGeneralProfileImpl(data: {
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
  bannerBackgroundShuffle?: boolean | null;
  bannerBackgroundAutoplay?: boolean | null;
  bannerBackgroundSound?: boolean;
  auroraColor1?: string | null;
  auroraColor2?: string | null;
  auroraColor3?: string | null;
  auroraSpeed?: number | null;
  auroraBlend?: number | null;
  darkveilSpeed?: number | null;
  darkveilHueShift?: number | null;
  darkveilNoise?: number | null;
  darkveilScanFreq?: number | null;
  darkveilScan?: number | null;
  darkveilWarp?: number | null;
  pixelblastColor?: string | null;
  pixelblastVariant?: string | null;
  pixelblastPixelSize?: number | null;
  pixelblastPatternScale?: number | null;
  pixelblastPatternDensity?: number | null;
  pixelblastPixelJitter?: number | null;
  pixelblastSpeed?: number | null;
  pixelblastEdgeFade?: number | null;
  pixelblastRipples?: boolean | null;
  pixelblastLiquid?: boolean | null;
  colorbendsColor?: string | null;
  colorbendsRotation?: number | null;
  colorbendsAutoRotate?: number | null;
  colorbendsSpeed?: number | null;
  colorbendsScale?: number | null;
  colorbendsFrequency?: number | null;
  colorbendsWarp?: number | null;
  colorbendsMouse?: number | null;
  colorbendsParallax?: number | null;
  colorbendsNoise?: number | null;
  colorbendsIterations?: number | null;
  colorbendsIntensity?: number | null;
  colorbendsBandWidth?: number | null;
  liquidchromeColor?: string | null;
  liquidchromeSpeed?: number | null;
  liquidchromeAmplitude?: number | null;
  liquidchromeInteractive?: boolean | null;
  crtwarpColor?: string | null;
  crtwarpBackground?: string | null;
  crtwarpSpeed?: number | null;
  crtwarpCurvature?: number | null;
  crtwarpWaveAmount?: number | null;
  crtwarpWaveDensity?: number | null;
  crtwarpScanStrength?: number | null;
  crtwarpScanDensity?: number | null;
  crtwarpBloom?: number | null;
  crtwarpBloomRadius?: number | null;
  crtwarpNoise?: number | null;
  crtwarpVignette?: number | null;
  crtwarpBrightness?: number | null;
  crtwarpRgbShift?: number | null;
  crtwarpPixelSize?: number | null;
  crtwarpRenderQuality?: number | null;
  crtwarpFrameRate?: number | null;
  crtwarpPointerWarp?: boolean | null;
  crtwarpPointerStrength?: number | null;
  crtwarpPaused?: boolean | null;
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

  const urlFields = [data.avatarUrl, data.bannerImageUrl, data.avatarDecorationUrl];
  if (data.profileEffectUrl && !data.profileEffectUrl.startsWith("effect:")) {
    urlFields.push(data.profileEffectUrl);
  }
  if (urlFields.some(url => !isValidMediaUrl(url))) {
    throw new Error("Invalid media URL.");
  }

  const avatarUrlVal = data.avatarUrl === "" ? null : data.avatarUrl;
  const bannerImageUrlVal = data.bannerImageUrl === "" ? null : data.bannerImageUrl;

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
  if (data.bannerBackgroundShuffle !== undefined) setData.bannerBackgroundShuffle = !!data.bannerBackgroundShuffle;
  if (data.bannerBackgroundAutoplay !== undefined) setData.bannerBackgroundAutoplay = !!data.bannerBackgroundAutoplay;
  if (data.bannerBackgroundSound !== undefined) setData.bannerBackgroundSound = !!data.bannerBackgroundSound;
  if (data.auroraColor1 !== undefined) setData.auroraColor1 = data.auroraColor1?.slice(0, 32) ?? null;
  if (data.auroraColor2 !== undefined) setData.auroraColor2 = data.auroraColor2?.slice(0, 32) ?? null;
  if (data.auroraColor3 !== undefined) setData.auroraColor3 = data.auroraColor3?.slice(0, 32) ?? null;
  if (data.auroraSpeed !== undefined) setData.auroraSpeed = data.auroraSpeed;
  if (data.auroraBlend !== undefined) setData.auroraBlend = data.auroraBlend;
  if (data.darkveilSpeed !== undefined) setData.darkveilSpeed = data.darkveilSpeed;
  if (data.darkveilHueShift !== undefined) setData.darkveilHueShift = data.darkveilHueShift;
  if (data.darkveilNoise !== undefined) setData.darkveilNoise = data.darkveilNoise;
  if (data.darkveilScanFreq !== undefined) setData.darkveilScanFreq = data.darkveilScanFreq;
  if (data.darkveilScan !== undefined) setData.darkveilScan = data.darkveilScan;
  if (data.darkveilWarp !== undefined) setData.darkveilWarp = data.darkveilWarp;
  if (data.pixelblastColor !== undefined) setData.pixelblastColor = data.pixelblastColor?.slice(0, 32) ?? null;
  if (data.pixelblastVariant !== undefined) {
    const v = data.pixelblastVariant?.trim().toLowerCase() ?? "square";
    setData.pixelblastVariant = ["square", "circle", "triangle", "diamond"].includes(v) ? v : "square";
  }
  if (data.pixelblastPixelSize !== undefined) setData.pixelblastPixelSize = data.pixelblastPixelSize;
  if (data.pixelblastPatternScale !== undefined) setData.pixelblastPatternScale = data.pixelblastPatternScale;
  if (data.pixelblastPatternDensity !== undefined) setData.pixelblastPatternDensity = data.pixelblastPatternDensity;
  if (data.pixelblastPixelJitter !== undefined) setData.pixelblastPixelJitter = data.pixelblastPixelJitter;
  if (data.pixelblastSpeed !== undefined) setData.pixelblastSpeed = data.pixelblastSpeed;
  if (data.pixelblastEdgeFade !== undefined) setData.pixelblastEdgeFade = data.pixelblastEdgeFade;
  if (data.pixelblastRipples !== undefined) setData.pixelblastRipples = !!data.pixelblastRipples;
  if (data.pixelblastLiquid !== undefined) setData.pixelblastLiquid = !!data.pixelblastLiquid;
  if (data.colorbendsColor !== undefined) setData.colorbendsColor = data.colorbendsColor?.slice(0, 32) ?? null;
  if (data.colorbendsRotation !== undefined) setData.colorbendsRotation = data.colorbendsRotation;
  if (data.colorbendsAutoRotate !== undefined) setData.colorbendsAutoRotate = data.colorbendsAutoRotate;
  if (data.colorbendsSpeed !== undefined) setData.colorbendsSpeed = data.colorbendsSpeed;
  if (data.colorbendsScale !== undefined) setData.colorbendsScale = data.colorbendsScale;
  if (data.colorbendsFrequency !== undefined) setData.colorbendsFrequency = data.colorbendsFrequency;
  if (data.colorbendsWarp !== undefined) setData.colorbendsWarp = data.colorbendsWarp;
  if (data.colorbendsMouse !== undefined) setData.colorbendsMouse = data.colorbendsMouse;
  if (data.colorbendsParallax !== undefined) setData.colorbendsParallax = data.colorbendsParallax;
  if (data.colorbendsNoise !== undefined) setData.colorbendsNoise = data.colorbendsNoise;
  if (data.colorbendsIterations !== undefined) setData.colorbendsIterations = data.colorbendsIterations;
  if (data.colorbendsIntensity !== undefined) setData.colorbendsIntensity = data.colorbendsIntensity;
  if (data.colorbendsBandWidth !== undefined) setData.colorbendsBandWidth = data.colorbendsBandWidth;
  if (data.liquidchromeColor !== undefined) setData.liquidchromeColor = data.liquidchromeColor?.slice(0, 32) ?? null;
  if (data.liquidchromeSpeed !== undefined) setData.liquidchromeSpeed = data.liquidchromeSpeed;
  if (data.liquidchromeAmplitude !== undefined) setData.liquidchromeAmplitude = data.liquidchromeAmplitude;
  if (data.liquidchromeInteractive !== undefined) setData.liquidchromeInteractive = !!data.liquidchromeInteractive;
  if (data.crtwarpColor !== undefined) setData.crtwarpColor = data.crtwarpColor?.slice(0, 32) ?? null;
  if (data.crtwarpBackground !== undefined) setData.crtwarpBackground = data.crtwarpBackground?.slice(0, 32) ?? null;
  if (data.crtwarpSpeed !== undefined) setData.crtwarpSpeed = data.crtwarpSpeed;
  if (data.crtwarpCurvature !== undefined) setData.crtwarpCurvature = data.crtwarpCurvature;
  if (data.crtwarpWaveAmount !== undefined) setData.crtwarpWaveAmount = data.crtwarpWaveAmount;
  if (data.crtwarpWaveDensity !== undefined) setData.crtwarpWaveDensity = data.crtwarpWaveDensity;
  if (data.crtwarpScanStrength !== undefined) setData.crtwarpScanStrength = data.crtwarpScanStrength;
  if (data.crtwarpScanDensity !== undefined) setData.crtwarpScanDensity = data.crtwarpScanDensity;
  if (data.crtwarpBloom !== undefined) setData.crtwarpBloom = data.crtwarpBloom;
  if (data.crtwarpBloomRadius !== undefined) setData.crtwarpBloomRadius = data.crtwarpBloomRadius;
  if (data.crtwarpNoise !== undefined) setData.crtwarpNoise = data.crtwarpNoise;
  if (data.crtwarpVignette !== undefined) setData.crtwarpVignette = data.crtwarpVignette;
  if (data.crtwarpBrightness !== undefined) setData.crtwarpBrightness = data.crtwarpBrightness;
  if (data.crtwarpRgbShift !== undefined) setData.crtwarpRgbShift = data.crtwarpRgbShift;
  if (data.crtwarpPixelSize !== undefined) setData.crtwarpPixelSize = data.crtwarpPixelSize;
  if (data.crtwarpRenderQuality !== undefined) setData.crtwarpRenderQuality = data.crtwarpRenderQuality;
  if (data.crtwarpFrameRate !== undefined) setData.crtwarpFrameRate = data.crtwarpFrameRate;
  if (data.crtwarpPointerWarp !== undefined) setData.crtwarpPointerWarp = !!data.crtwarpPointerWarp;
  if (data.crtwarpPointerStrength !== undefined) setData.crtwarpPointerStrength = data.crtwarpPointerStrength;
  if (data.crtwarpPaused !== undefined) setData.crtwarpPaused = !!data.crtwarpPaused;

  sanitizeProfileSettings(setData);

  const prev = await getUserById(userId);

  const changedEffectKeys = EFFECT_CONFIG_KEYS.filter((key) => key in setData);
  if (changedEffectKeys.length > 0) {
    const changes: Partial<EffectConfig> = {};
    for (const key of changedEffectKeys) {
      (changes as Record<string, unknown>)[key] = setData[key];
      delete setData[key];
    }
    setData.effectConfig = packEffectConfig(pickEffectConfig(prev), changes);
  }

  if (Object.keys(setData).length > 0) {
    await db
      .insert(schema.userSettings)
      .values({ userId, ...setData })
      .onDuplicateKeyUpdate({ set: setData });
  }

  await invalidateLiveStatsCache(userId);

  revalidatePath("/dashboard/customize/profile/general");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

async function updateBackgroundsImpl(urls: string[]) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const cleanAll = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  const prevUser = await getUserById(userId);
  const premium = isPremiumActive(prevUser);
  const allowed = premium ? 5 : 1;
  if (cleanAll.length > allowed) {
    throw new Error("Additional backgrounds need Premium.");
  }
  for (const url of cleanAll) {
    const pid = animatedBackgroundId(url);
    if (pid && isPremiumBackgroundId(pid) && !premium) {
      throw new Error("That background needs Premium.");
    }
  }
  const clean = cleanAll.slice(0, allowed);
  if (clean.some((url) => !isValidMediaUrl(url))) {
    throw new Error("Invalid media URL.");
  }

  const previousBackgrounds = await db
    .select({ url: schema.userBackgrounds.url })
    .from(schema.userBackgrounds)
    .where(eq(schema.userBackgrounds.userId, userId));
  const removedBackgrounds = previousBackgrounds
    .map((row) => row.url)
    .filter((url) => !clean.includes(url));

  await db.transaction(async (tx) => {
    await tx.delete(schema.userBackgrounds).where(eq(schema.userBackgrounds.userId, userId));
    if (clean.length > 0) {
      await tx.insert(schema.userBackgrounds).values(
        clean.map((url, i) => ({ userId, url, position: i }))
      );
    }
  });

  if (removedBackgrounds.length > 0) {
    await storageDeleteOwned(userId, removedBackgrounds).catch(() => {});
  }

  await invalidateLiveStatsCache(userId);

  revalidatePath("/dashboard/customize/profile/general");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

async function updateAppearanceProfileImpl(data: {
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
  musicPrimaryFont?: string;
  musicPrimaryFontSize?: number;
  musicPrimaryFontWeight?: number;
  musicPrimaryLetterSpacing?: number;
  musicSecondaryFont?: string;
  musicSecondaryFontSize?: number;
  musicSecondaryFontWeight?: number;
  musicSecondaryLetterSpacing?: number;
  musicLyricsFont?: string;
  musicLyricsFontSize?: number;
  musicLyricsFontWeight?: number;
  musicLyricsLetterSpacing?: number;
  widgetFont?: string;
  widgetFontSize?: number;
  widgetFontWeight?: number;
  widgetLetterSpacing?: number;
  widgetSecondaryFont?: string;
  widgetSecondaryFontSize?: number;
  widgetSecondaryFontWeight?: number;
  widgetSecondaryLetterSpacing?: number;
  linksFont?: string;
  linksFontSize?: number;
  linksFontWeight?: number;
  linksLetterSpacing?: number;
  joinDateEnabled?: boolean;
  joinDateFormat?: string;
  viewsEnabled?: boolean;
  viewsAnimationEnabled?: boolean;
  viewsAnimationDuration?: number;
  viewsAnimationStyle?: "none" | "countup" | "digitalroll" | "slotroll" | "speeding";
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
  showLinksTooltip?: boolean;
  showBadgesTooltip?: boolean;
  iconsGlowEnabled?: boolean;
  joinDateIconGlow?: boolean;
  locationIconGlow?: boolean;
  occupationIconGlow?: boolean;
  uidIconGlow?: boolean;
  viewsIconGlow?: boolean;
  feedbackIconGlow?: boolean;
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
  if (data.musicPrimaryFont !== undefined) setData.musicPrimaryFont = data.musicPrimaryFont.slice(0, 50);
  if (data.musicPrimaryFontSize !== undefined) setData.musicPrimaryFontSize = data.musicPrimaryFontSize;
  if (data.musicPrimaryFontWeight !== undefined) setData.musicPrimaryFontWeight = data.musicPrimaryFontWeight;
  if (data.musicPrimaryLetterSpacing !== undefined) setData.musicPrimaryLetterSpacing = data.musicPrimaryLetterSpacing;
  if (data.musicSecondaryFont !== undefined) setData.musicSecondaryFont = data.musicSecondaryFont.slice(0, 50);
  if (data.musicSecondaryFontSize !== undefined) setData.musicSecondaryFontSize = data.musicSecondaryFontSize;
  if (data.musicSecondaryFontWeight !== undefined) setData.musicSecondaryFontWeight = data.musicSecondaryFontWeight;
  if (data.musicSecondaryLetterSpacing !== undefined) setData.musicSecondaryLetterSpacing = data.musicSecondaryLetterSpacing;
  if (data.musicLyricsFont !== undefined) setData.musicLyricsFont = data.musicLyricsFont.slice(0, 50);
  if (data.musicLyricsFontSize !== undefined) setData.musicLyricsFontSize = data.musicLyricsFontSize;
  if (data.musicLyricsFontWeight !== undefined) setData.musicLyricsFontWeight = data.musicLyricsFontWeight;
  if (data.musicLyricsLetterSpacing !== undefined) setData.musicLyricsLetterSpacing = data.musicLyricsLetterSpacing;
  if (data.widgetFont !== undefined) setData.widgetFont = data.widgetFont.slice(0, 50);
  if (data.widgetFontSize !== undefined) setData.widgetFontSize = data.widgetFontSize;
  if (data.widgetFontWeight !== undefined) setData.widgetFontWeight = data.widgetFontWeight;
  if (data.widgetLetterSpacing !== undefined) setData.widgetLetterSpacing = data.widgetLetterSpacing;
  if (data.widgetSecondaryFont !== undefined) setData.widgetSecondaryFont = data.widgetSecondaryFont.slice(0, 50);
  if (data.widgetSecondaryFontSize !== undefined) setData.widgetSecondaryFontSize = data.widgetSecondaryFontSize;
  if (data.widgetSecondaryFontWeight !== undefined) setData.widgetSecondaryFontWeight = data.widgetSecondaryFontWeight;
  if (data.widgetSecondaryLetterSpacing !== undefined) setData.widgetSecondaryLetterSpacing = data.widgetSecondaryLetterSpacing;
  if (data.linksFont !== undefined) setData.linksFont = data.linksFont.slice(0, 50);
  if (data.linksFontSize !== undefined) setData.linksFontSize = data.linksFontSize;
  if (data.linksFontWeight !== undefined) setData.linksFontWeight = data.linksFontWeight;
  if (data.linksLetterSpacing !== undefined) setData.linksLetterSpacing = data.linksLetterSpacing;
  if (data.joinDateEnabled !== undefined) setData.joinDateEnabled = data.joinDateEnabled;
  if (data.joinDateFormat !== undefined) setData.joinDateFormat = data.joinDateFormat.slice(0, 32);
  if (data.viewsEnabled !== undefined) setData.viewsEnabled = data.viewsEnabled;
  if (data.viewsAnimationEnabled !== undefined) setData.viewsAnimationEnabled = data.viewsAnimationEnabled;
  if (data.viewsAnimationDuration !== undefined) setData.viewsAnimationDuration = data.viewsAnimationDuration;
  if (data.viewsAnimationStyle !== undefined) {
    if (data.viewsAnimationStyle !== "countup" && data.viewsAnimationStyle !== "none") {
      const viewer = await getUserById(userId);
      if (!isPremiumActive(viewer)) {
        throw new Error("That animation style needs Premium.");
      }
    }
    setData.viewsAnimationStyle = data.viewsAnimationStyle;
  }
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
  if (data.showLinksTooltip !== undefined) setData.showLinksTooltip = data.showLinksTooltip;
  if (data.showBadgesTooltip !== undefined) setData.showBadgesTooltip = data.showBadgesTooltip;
  if (data.iconsGlowEnabled !== undefined) setData.iconsGlowEnabled = data.iconsGlowEnabled;
  if (data.joinDateIconGlow !== undefined) setData.joinDateIconGlow = data.joinDateIconGlow;
  if (data.locationIconGlow !== undefined) setData.locationIconGlow = data.locationIconGlow;
  if (data.occupationIconGlow !== undefined) setData.occupationIconGlow = data.occupationIconGlow;
  if (data.uidIconGlow !== undefined) setData.uidIconGlow = data.uidIconGlow;
  if (data.viewsIconGlow !== undefined) setData.viewsIconGlow = data.viewsIconGlow;
  if (data.feedbackIconGlow !== undefined) setData.feedbackIconGlow = data.feedbackIconGlow;

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

async function updateColorsProfileImpl(data: {
  usernameColor?: string | null;
  bioColor?: string | null;
  otherColor?: string | null;
  pageBgColor?: string | null;
  widgetPrimaryTextColor?: string | null;
  widgetSecondaryTextColor?: string | null;
  widgetBorderColor?: string | null;
  sectionTitleColor?: string | null;
  sectionDescColor?: string | null;
  musicPrimaryColor?: string | null;
  musicSecondaryColor?: string | null;
  musicLyricsColor?: string | null;
  badgeMonochromeColor?: string | null;
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
  if (data.sectionTitleColor !== undefined) setData.sectionTitleColor = data.sectionTitleColor?.slice(0, 32) ?? null;
  if (data.sectionDescColor !== undefined) setData.sectionDescColor = data.sectionDescColor?.slice(0, 32) ?? null;
  if (data.musicPrimaryColor !== undefined) setData.musicPrimaryColor = data.musicPrimaryColor?.slice(0, 32) ?? null;
  if (data.musicSecondaryColor !== undefined) setData.musicSecondaryColor = data.musicSecondaryColor?.slice(0, 32) ?? null;
  if (data.musicLyricsColor !== undefined) setData.musicLyricsColor = data.musicLyricsColor?.slice(0, 32) ?? null;
  if (data.badgeMonochromeColor !== undefined) setData.badgeMonochromeColor = data.badgeMonochromeColor?.slice(0, 32) ?? null;

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

const CONTENT_ALIGNMENTS = ["left", "center", "right"] as const;

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

async function updateLayoutProfileImpl(data: {
  profileStructure?: string;
  aboutSectionEnabled?: boolean;
  aboutSectionTitle?: string;
  aboutSectionDescription?: string;
  linksSectionEnabled?: boolean;
  linksSectionTitle?: string;
  linksSectionDescription?: string;
  linksSectionPosition?: string;
  profileSections?: unknown;
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
  detailLayout?: unknown;
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

  if (data.linksSectionEnabled !== undefined) {
    setData.linksSectionEnabled = data.linksSectionEnabled;
  }

  if (data.linksSectionTitle !== undefined) {
    setData.linksSectionTitle = data.linksSectionTitle.trim().slice(0, 60) || "Links";
  }

  if (data.linksSectionDescription !== undefined) {
    setData.linksSectionDescription = data.linksSectionDescription.trim().slice(0, 1000) || null;
  }

  if (data.linksSectionPosition !== undefined) {
    if (data.linksSectionPosition !== "above" && data.linksSectionPosition !== "below") {
      throw new Error("Invalid links section position");
    }
    setData.linksSectionPosition = data.linksSectionPosition;
  }

  if (data.widgetsSectionEnabled !== undefined) {
    setData.widgetsSectionEnabled = data.widgetsSectionEnabled;
  }

  if (data.profileSections !== undefined) {
    setData.profileSections = normalizeProfileSections(data.profileSections);
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

  if (data.detailLayout !== undefined) {
    const prev = await getUserById(userId);
    setData.effectConfig = packEffectConfig(pickEffectConfig(prev), {
      detailLayout: normalizeDetailLayout(data.detailLayout),
    });
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

async function updateMetadataProfileImpl(data: {
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

  const wantsTabPremium =
    (typeof data.faviconUrl === "string" && data.faviconUrl !== "") ||
    (typeof data.cursorUrl === "string" && data.cursorUrl !== "") ||
    (typeof data.tabTitle === "string" && data.tabTitle.trim() !== "") ||
    data.tabTitleAnimated === true;
  if (wantsTabPremium) {
    const me = await getUserById(userId);
    if (!isPremiumActive(me)) {
      throw new Error("Browser tab customization needs Premium.");
    }
  }

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

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/metadata");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true };
}

async function updateEffectsProfileImpl(data: {
  backgroundEffect?: string | null;
  backgroundEffectIntensity?: number | null;
  backgroundEffectColor?: string | null;
  backgroundEffectAboveContainer?: boolean | null;
  borderEffect?: string | null;
  borderEffectColor?: string | null;
  cardEffect?: string | null;
  cardTransition?: string | null;
  usernameEffect?: string | null;
  usernameGlowEnabled?: boolean | null;
  descriptionEffect?: string | null;
  descriptionGlowEnabled?: boolean | null;
  cursorTrail?: string | null;
  cursorTrailColor?: string | null;
  clickEffect?: string | null;
  clickSound?: string | null;
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
  badgeGlowEnabled?: boolean | null;
  badgeGlowStrength?: number | null;
  badgeSize?: number | null;
  badgeMonochromeEnabled?: boolean | null;
  badgeContainerStyle?: string | null;
  badgeSpacing?: number | null;
  badgeScrollStyle?: string | null;
  badgeScrollSpeed?: number | null;
  badgeVisibleCount?: number | null;
  badgeShimmerEnabled?: boolean | null;
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

  const gatedEffects: Array<[unknown, ReadonlySet<string>, string]> = [
    [data.backgroundEffect, PREMIUM_BACKGROUND_EFFECTS, "That background effect needs Premium."],
    [data.borderEffect, PREMIUM_BORDER_EFFECTS, "That border effect needs Premium."],
    [data.cardEffect, PREMIUM_CARD_EFFECTS, "That card effect needs Premium."],
    [data.cardTransition, PREMIUM_CARD_TRANSITIONS, "That card transition needs Premium."],
    [data.usernameEffect, PREMIUM_TEXT_EFFECTS, "That username effect needs Premium."],
    [data.descriptionEffect, PREMIUM_TEXT_EFFECTS, "That description effect needs Premium."],
    [data.cursorTrail, PREMIUM_CURSOR_TRAILS, "That cursor trail needs Premium."],
    [data.clickEffect, PREMIUM_CLICK_EFFECTS, "That click effect needs Premium."],
    [data.clickSound, PREMIUM_CLICK_SOUNDS, "That click sound needs Premium."],
    [data.entryTransition, PREMIUM_ENTRY_TRANSITIONS, "That entry transition needs Premium."],
  ];
  if (gatedEffects.some(([val, set]) => typeof val === "string" && isPremiumOption(set, val.trim()))) {
    const prevUser = await getUserById(userId);
    for (const [val, set, msg] of gatedEffects) {
      if (typeof val === "string" && isPremiumOption(set, val.trim()) && !isPremiumActive(prevUser)) {
        throw new Error(msg);
      }
    }
  }

  if (data.backgroundEffect !== undefined) setData.backgroundEffect = data.backgroundEffect?.slice(0, 50) ?? null;
  if (data.backgroundEffectIntensity !== undefined) setData.backgroundEffectIntensity = data.backgroundEffectIntensity;
  if (data.backgroundEffectColor !== undefined) setData.backgroundEffectColor = data.backgroundEffectColor?.slice(0, 32) ?? null;
  if (data.backgroundEffectAboveContainer !== undefined) setData.backgroundEffectAboveContainer = data.backgroundEffectAboveContainer ?? false;

  if (data.borderEffect !== undefined) setData.borderEffect = data.borderEffect?.slice(0, 50) ?? null;
  if (data.borderEffectColor !== undefined) setData.borderEffectColor = data.borderEffectColor?.slice(0, 32) ?? null;

  if (data.cardEffect !== undefined) setData.cardEffect = data.cardEffect?.slice(0, 50) ?? null;
  if (data.cardTransition !== undefined) setData.cardTransition = data.cardTransition?.slice(0, 50) ?? null;
  if (data.usernameEffect !== undefined) setData.usernameEffect = data.usernameEffect?.slice(0, 50) ?? null;
  if (data.usernameGlowEnabled !== undefined) setData.usernameGlowEnabled = data.usernameGlowEnabled ?? false;
  if (data.descriptionEffect !== undefined) setData.descriptionEffect = data.descriptionEffect?.slice(0, 50) ?? null;
  if (data.descriptionGlowEnabled !== undefined) setData.descriptionGlowEnabled = data.descriptionGlowEnabled ?? false;
  if (data.cursorTrail !== undefined) setData.cursorTrail = data.cursorTrail?.slice(0, 50) ?? null;
  if (data.cursorTrailColor !== undefined) setData.cursorTrailColor = data.cursorTrailColor?.slice(0, 32) ?? null;
  if (data.clickEffect !== undefined) {
    const id = data.clickEffect?.trim().slice(0, 50) ?? "none";
    setData.clickEffect = CLICK_EFFECTS.some((e) => e.id === id) ? id : "none";
  }
  if (data.clickSound !== undefined) {
    const id = data.clickSound?.trim().slice(0, 50) ?? "none";
    setData.clickSound = CLICK_SOUNDS.some((s) => s.id === id) ? id : "none";
  }
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
  if (data.badgeGlowEnabled !== undefined) setData.badgeGlowEnabled = data.badgeGlowEnabled ?? true;
  if (data.badgeGlowStrength !== undefined) setData.badgeGlowStrength = data.badgeGlowStrength;
  if (data.badgeSize !== undefined) setData.badgeSize = data.badgeSize;
  if (data.badgeMonochromeEnabled !== undefined) setData.badgeMonochromeEnabled = data.badgeMonochromeEnabled ?? false;
  if (data.badgeContainerStyle !== undefined) {
    const style = data.badgeContainerStyle?.trim() ?? "pill";
    setData.badgeContainerStyle = ["pill", "none", "separate"].includes(style) ? style : "pill";
  }
  if (data.badgeSpacing !== undefined) setData.badgeSpacing = data.badgeSpacing;
  if (data.badgeScrollStyle !== undefined) {
    const style = data.badgeScrollStyle?.trim() ?? "none";
    setData.badgeScrollStyle = ["none", "pingpong", "left", "right"].includes(style) ? style : "none";
  }
  if (data.badgeScrollSpeed !== undefined) setData.badgeScrollSpeed = data.badgeScrollSpeed;
  if (data.badgeVisibleCount !== undefined) setData.badgeVisibleCount = data.badgeVisibleCount;
  if (data.badgeShimmerEnabled !== undefined) setData.badgeShimmerEnabled = data.badgeShimmerEnabled ?? false;

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

async function updateProfileWidgetsImpl(data: {
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
    instagramShowFollowers?: boolean;
    instagramShowFollowing?: boolean;
    instagramShowPosts?: boolean;
    instagramShowVerifiedBadge?: boolean;
    instagramShowBackground?: boolean;
    soundcloudShowFollowers?: boolean;
    soundcloudShowTracks?: boolean;
    soundcloudShowVerifiedBadge?: boolean;
    soundcloudShowBackground?: boolean;
    soundcloudShowPlays?: boolean;
    soundcloudShowLikes?: boolean;
    soundcloudShowDuration?: boolean;
    appleMusicShowArtist?: boolean;
    appleMusicShowAlbum?: boolean;
    appleMusicShowReleaseYear?: boolean;
    appleMusicShowTrackCount?: boolean;
    appleMusicShowGenre?: boolean;
    appleMusicShowBackground?: boolean;
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

  const premium = isPremiumActive(user);
  const maxWidgets = premium ? 10 : 3;
  if ((data.widgets || []).length > maxWidgets) {
    throw new Error(`You can only add a maximum of ${maxWidgets} widgets.`);
  }

  const sanitizedWidgets = (data.widgets || []).slice(0, maxWidgets).map((w) => {
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
        : w.platform === "instagram"
        ? "instagram"
        : w.platform === "soundcloud"
        ? "soundcloud"
        : w.platform === "apple-music"
        ? "apple-music"
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
        : w.type === "instagram-profile" || w.platform === "instagram"
        ? "instagram-profile"
        : w.type === "soundcloud-track"
        ? "soundcloud-track"
        : w.type === "soundcloud-profile" || w.platform === "soundcloud"
        ? "soundcloud-profile"
        : w.type === "apple-music-track"
        ? "apple-music-track"
        : w.type === "apple-music-album"
        ? "apple-music-album"
        : w.type === "apple-music-artist"
        ? "apple-music-artist"
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
    } else if (platform === "instagram") {
      targetId = cleanInstagramUsername(String(w.targetId || "")).slice(0, 30);
      if (!targetId || !isValidInstagramUsername(targetId)) {
        throw new Error("Invalid Instagram username format");
      }
    } else if (platform === "soundcloud") {
      if (type === "soundcloud-track") {
        targetId = cleanSoundcloudTrackPath(String(w.targetId || ""));
        if (!targetId || !isValidSoundcloudTrackPath(targetId)) {
          throw new Error("Invalid SoundCloud track link");
        }
      } else {
        targetId = cleanSoundcloudHandle(String(w.targetId || "")).slice(0, 64);
        if (!targetId || !isValidSoundcloudHandle(targetId)) {
          throw new Error("Invalid SoundCloud artist handle format");
        }
      }
    } else if (platform === "apple-music") {
      targetId = cleanAppleMusicInput(String(w.targetId || "")).slice(0, 20);
      if (!targetId || !isValidAppleMusicId(targetId)) {
        throw new Error("Invalid Apple Music link or ID");
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
      badgeOrder: Array.isArray(w.badgeOrder) ? w.badgeOrder.slice(0, 50).map((b) => String(b).slice(0, 64)) : undefined,
      hiddenBadges: Array.isArray(w.hiddenBadges) ? w.hiddenBadges.slice(0, 50).map((b) => String(b).slice(0, 64)) : undefined,
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
      instagramShowFollowers: w.instagramShowFollowers !== undefined ? Boolean(w.instagramShowFollowers) : true,
      instagramShowFollowing: w.instagramShowFollowing !== undefined ? Boolean(w.instagramShowFollowing) : true,
      instagramShowPosts: w.instagramShowPosts !== undefined ? Boolean(w.instagramShowPosts) : true,
      instagramShowVerifiedBadge: w.instagramShowVerifiedBadge !== undefined ? Boolean(w.instagramShowVerifiedBadge) : true,
      instagramShowBackground: w.instagramShowBackground !== undefined ? Boolean(w.instagramShowBackground) : false,
      soundcloudShowFollowers: w.soundcloudShowFollowers !== undefined ? Boolean(w.soundcloudShowFollowers) : true,
      soundcloudShowTracks: w.soundcloudShowTracks !== undefined ? Boolean(w.soundcloudShowTracks) : true,
      soundcloudShowVerifiedBadge: w.soundcloudShowVerifiedBadge !== undefined ? Boolean(w.soundcloudShowVerifiedBadge) : true,
      soundcloudShowBackground: w.soundcloudShowBackground !== undefined ? Boolean(w.soundcloudShowBackground) : false,
      soundcloudShowPlays: w.soundcloudShowPlays !== undefined ? Boolean(w.soundcloudShowPlays) : true,
      soundcloudShowLikes: w.soundcloudShowLikes !== undefined ? Boolean(w.soundcloudShowLikes) : true,
      soundcloudShowDuration: w.soundcloudShowDuration !== undefined ? Boolean(w.soundcloudShowDuration) : true,
      appleMusicShowArtist: w.appleMusicShowArtist !== undefined ? Boolean(w.appleMusicShowArtist) : true,
      appleMusicShowAlbum: w.appleMusicShowAlbum !== undefined ? Boolean(w.appleMusicShowAlbum) : true,
      appleMusicShowReleaseYear: w.appleMusicShowReleaseYear !== undefined ? Boolean(w.appleMusicShowReleaseYear) : true,
      appleMusicShowTrackCount: w.appleMusicShowTrackCount !== undefined ? Boolean(w.appleMusicShowTrackCount) : true,
      appleMusicShowGenre: w.appleMusicShowGenre !== undefined ? Boolean(w.appleMusicShowGenre) : true,
      appleMusicShowBackground: w.appleMusicShowBackground !== undefined ? Boolean(w.appleMusicShowBackground) : false,
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
  revalidateProfile(user.username);
  await purgeCloudflareProfileCache(user.username);

  return { success: true };
}

type LyricLineInput = {
  text: string;
  start: number;
  end: number;
};

type MusicTrackInput = {
  id: string;
  title: string;
  artist: string;
  artwork?: string | null;
  album?: string | null;
  duration?: number | null;
  streamUrl?: string | null;
  lyrics?: LyricLineInput[] | null;
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

async function cacheTrackAudio(userId: number, id: string): Promise<string | null> {
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
    const stored = await storagePut(buf, { userId, ext: "mp3", mime: "audio/mpeg" });
    return stored?.rawUrl ?? null;
  } catch (error) {
    console.error("[Music Cache] audio failed:", error);
    return null;
  }
}

async function cacheTrackArtwork(userId: number, artwork: string | null | undefined): Promise<string | null> {
  if (!artwork) return null;
  if (isStoredMediaUrl(artwork)) return artwork;
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
    const stored = await storagePut(buf, { userId, ext, mime: contentType });
    return stored?.rawUrl ?? null;
  } catch (error) {
    console.error("[Music Cache] artwork failed:", error);
    return null;
  }
}

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

async function updateMusicProfileImpl(data: {
  tracks: MusicTrackInput[];
  playerStyle?: string;
  artBg?: boolean;
  volumeControl?: boolean;
  defaultVolume?: number;
  shuffle?: boolean;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const rate = await musicSaveRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const premium = isPremiumActive(user);
  const maxTracks = premium ? 10 : 1;
  if ((data.tracks || []).length > maxTracks) {
    throw new Error(`You can only add a maximum of ${maxTracks} track${maxTracks === 1 ? "" : "s"}.`);
  }

  const prevTracks = Array.isArray(user?.musicTracks) ? user.musicTracks : [];
  const sanitizedTracks = await Promise.all(
    (data.tracks || []).slice(0, maxTracks).map(async (t) => {
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

      if (id.startsWith("custom-")) {
        if (!isStoredMediaUrl(t.streamUrl)) {
          throw new Error(`Could not save "${title}" — audio upload missing.`);
        }
        if (!isStoredMediaUrl(t.artwork)) {
          throw new Error(`Could not save "${title}" — cover art is required.`);
        }
        const lyrics = Array.isArray(t.lyrics)
          ? t.lyrics
              .slice(0, 300)
              .map((l) => ({
                text: String(l?.text || "").trim().slice(0, 300),
                start: Number.isFinite(l?.start) && (l?.start ?? 0) >= 0 ? Math.round(l.start) : 0,
                end: Number.isFinite(l?.end) && (l?.end ?? 0) >= 0 ? Math.round(l.end) : 0,
              }))
              .filter((l) => l.text !== "")
          : null;
        return {
          id,
          title,
          artist,
          artwork: t.artwork as string,
          album,
          duration,
          streamUrl: t.streamUrl as string,
          lyrics: lyrics && lyrics.length > 0 ? lyrics : null,
        };
      }

      const prev = prevTracks.find((p) => p.id === id);
      if (prev && isStoredMediaUrl(prev.streamUrl)) {
        const artwork = isStoredMediaUrl(t.artwork) ? (t.artwork as string) : (prev.artwork ?? null);
        return {
          id,
          title,
          artist,
          artwork,
          album,
          duration,
          streamUrl: prev.streamUrl ?? null,
          lyrics: prev.lyrics ?? null,
        };
      }

      const [cachedAudio, artwork, lyrics] = await Promise.all([
        isStoredMediaUrl(t.streamUrl) ? (t.streamUrl as string) : cacheTrackAudio(userId, id),
        cacheTrackArtwork(userId, typeof t.artwork === "string" ? t.artwork.slice(0, 500) : null),
        fetchTrackLyrics({ id, title, artist, duration }),
      ]);
      const streamUrl = isStoredMediaUrl(t.streamUrl) ? (t.streamUrl as string) : cachedAudio;
      if (!streamUrl) {
        throw new Error(`Could not save "${title}" — audio upload failed. Try again.`);
      }
      return { id, title, artist, artwork, album, duration, streamUrl, lyrics };
    }),
  );

  if (sanitizedTracks.length > 0 && user.bannerBackgroundSound) {
    throw new Error("Turn off background sound to use the music player.");
  }

  const playerStyle =
    data.playerStyle === "lyrics" ? "lyrics" : data.playerStyle === "waveform" ? "waveform" : "compact";

  const defaultVolume =
    typeof data.defaultVolume === "number" && Number.isFinite(data.defaultVolume)
      ? Math.round(Math.min(100, Math.max(0, data.defaultVolume)))
      : undefined;

  const setData: Record<string, unknown> = {
    musicTracks: sanitizedTracks.length > 0 ? sanitizedTracks : null,
    musicPlayerStyle: playerStyle,
    ...(typeof data.artBg === "boolean" ? { musicPlayerArtBg: data.artBg } : {}),
    ...(typeof data.volumeControl === "boolean" ? { musicPlayerVolume: data.volumeControl } : {}),
    ...(defaultVolume !== undefined ? { musicPlayerDefaultVolume: defaultVolume } : {}),
    ...(typeof data.shuffle === "boolean" ? { musicPlayerShuffle: data.shuffle } : {}),
  };

  sanitizeProfileSettings(setData);

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/music");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return {
    success: true as const,
    tracks: sanitizedTracks,
    artBg: typeof data.artBg === "boolean" ? data.artBg : undefined,
    volumeControl: typeof data.volumeControl === "boolean" ? data.volumeControl : undefined,
    defaultVolume,
    shuffle: typeof data.shuffle === "boolean" ? data.shuffle : undefined,
  };
}

async function saveProfileLinksImpl(data: {
  links: unknown[];
  alignment?: string;
  socialBackground?: boolean;
  borderRadius?: number;
  iconSize?: number;
  iconGap?: number;
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

  const incoming = Array.isArray(data.links) ? data.links : [];
  if (incoming.length > MAX_LINKS) {
    throw new Error(`You can only add a maximum of ${MAX_LINKS} links.`);
  }

  const sanitizedLinks = incoming.slice(0, MAX_LINKS).map((l) => sanitizeProfileLink(l));
  if (sanitizedLinks.some((l) => l === null)) {
    throw new Error("Each link needs a title and a valid URL.");
  }

  const setData: Record<string, unknown> = {
    links: (sanitizedLinks as ProfileLink[]).length > 0 ? sanitizedLinks : null,
  };

  if (data.alignment !== undefined) {
    if (data.alignment !== "left" && data.alignment !== "center" && data.alignment !== "right") {
      throw new Error("Invalid links alignment.");
    }
    setData.linksAlignment = data.alignment;
  }
  if (data.socialBackground !== undefined) {
    setData.linksSocialBackground = Boolean(data.socialBackground);
  }
  if (data.borderRadius !== undefined) {
    const r = Number(data.borderRadius);
    if (!Number.isFinite(r)) throw new Error("Invalid border radius.");
    setData.linksBorderRadius = Math.min(32, Math.max(0, Math.round(r)));
  }
  if (data.iconSize !== undefined) {
    const s = Number(data.iconSize);
    if (!Number.isFinite(s)) throw new Error("Invalid icon size.");
    setData.linksIconSize = Math.min(32, Math.max(12, Math.round(s)));
  }
  if (data.iconGap !== undefined) {
    const g = Number(data.iconGap);
    if (!Number.isFinite(g)) throw new Error("Invalid icon gap.");
    setData.linksIconGap = Math.min(24, Math.max(0, Math.round(g)));
  }

  sanitizeProfileSettings(setData);

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/links");
  revalidatePath("/dashboard", "layout");
  await revalidateOwnProfile(userId);

  return { success: true, links: sanitizedLinks as ProfileLink[] };
}

async function deleteLinkIconFilesImpl(urls: string[]) {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rate = await profileUpdateRateLimit(userId);
  if (!rate.ok) {
    const minutes = Math.ceil(rate.retryAfterSeconds / 60);
    throw new Error(`You're updating too fast. Please wait ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const clean = [...new Set(Array.isArray(urls) ? urls.filter((u) => typeof u === "string") : [])].slice(0, 10);
  if (clean.length === 0) return { success: true };
  await storageDeleteOwned(userId, clean);
  return { success: true };
}

const INVALID_DATA = "Invalid data. Please refresh the page and try again.";

function assertPlainObject<T>(data: T): T {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(INVALID_DATA);
  }
  return data;
}

function assertStringArray(urls: unknown): string[] {
  if (!Array.isArray(urls) || urls.some((u) => typeof u !== "string")) {
    throw new Error(INVALID_DATA);
  }
  return urls;
}

async function runSafely<R>(action: string, fn: () => Promise<R>): Promise<R> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof TypeError || err instanceof RangeError || err instanceof SyntaxError) {
      console.warn(`[profile:${action}] Rejected malformed input:`, err.message);
      throw new Error(INVALID_DATA);
    }
    if (err && typeof err === "object" && "sqlMessage" in err) {
      console.error(`[profile:${action}] Database rejected update:`, err);
      throw new Error("Could not save your changes. Please check your values and try again.");
    }
    throw err;
  }
}

export async function updateGeneralProfile(data: Parameters<typeof updateGeneralProfileImpl>[0]) {
  return runSafely("general", () => updateGeneralProfileImpl(assertPlainObject(data)));
}

export async function updateBackgrounds(urls: string[]) {
  return runSafely("backgrounds", () => updateBackgroundsImpl(assertStringArray(urls)));
}

export async function updateAppearanceProfile(data: Parameters<typeof updateAppearanceProfileImpl>[0]) {
  return runSafely("appearance", () => updateAppearanceProfileImpl(assertPlainObject(data)));
}

export async function updateColorsProfile(data: Parameters<typeof updateColorsProfileImpl>[0]) {
  return runSafely("colors", () => updateColorsProfileImpl(assertPlainObject(data)));
}

export async function updateLayoutProfile(data: Parameters<typeof updateLayoutProfileImpl>[0]) {
  return runSafely("layout", () => updateLayoutProfileImpl(assertPlainObject(data)));
}

export async function updateMetadataProfile(data: Parameters<typeof updateMetadataProfileImpl>[0]) {
  return runSafely("metadata", () => updateMetadataProfileImpl(assertPlainObject(data)));
}

export async function updateEffectsProfile(data: Parameters<typeof updateEffectsProfileImpl>[0]) {
  return runSafely("effects", () => updateEffectsProfileImpl(assertPlainObject(data)));
}

export async function updateProfileWidgets(data: Parameters<typeof updateProfileWidgetsImpl>[0]) {
  return runSafely("widgets", () => updateProfileWidgetsImpl(assertPlainObject(data)));
}

export async function updateMusicProfile(data: Parameters<typeof updateMusicProfileImpl>[0]) {
  try {
    return await runSafely("music", () => updateMusicProfileImpl(assertPlainObject(data)));
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error && err.message ? err.message : "Couldn't save your music. Try again.",
    };
  }
}

export async function saveProfileLinks(data: Parameters<typeof saveProfileLinksImpl>[0]) {
  return runSafely("links", () => saveProfileLinksImpl(assertPlainObject(data)));
}

export async function deleteLinkIconFiles(urls: string[]) {
  return runSafely("link-icons", () => deleteLinkIconFilesImpl(assertStringArray(urls)));
}
