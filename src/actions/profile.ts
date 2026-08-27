"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserById } from "@/lib/features/users/db";
import { revalidatePath } from "next/cache";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { invalidateLiveStatsCache } from "@/app/api/profile/live/route";
import { cleanYouTubeInput } from "@/lib/youtube";
import { cleanTelegramUsername, isValidTelegramUsername } from "@/lib/telegram";
import { cleanRobloxInput, isValidRobloxInput } from "@/lib/roblox";
import { cleanWeatherLocation, isValidWeatherLocation } from "@/lib/weather";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function emptyS3Directory(userId: number, assetType: string) {
  try {
    const prefix = `${userId}/${assetType}/`;
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Prefix: prefix,
      })
    );
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;
    for (const item of listedObjects.Contents) {
      if (item.Key) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: item.Key,
          })
        );
      }
    }
  } catch (error) {
    console.error(`Failed to empty S3 directory for ${assetType}:`, error);
  }
}

const STORAGE_BASE = `https://storage.iuno.lol/`;

function isValidMediaUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.startsWith(STORAGE_BASE) ||
         url.startsWith("https://cdn.discordapp.com/") || 
         url.startsWith("https://discord-decoration.art/");
}

export async function updateGeneralProfile(data: {
  username: string;
  displayName?: string;
  location?: string;
  timezone?: string;
  occupation?: string;
  bio?: string;
  avatarUrl?: string | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle";
  avatarDecorationUrl?: string | null;
  avatarDecorationHue?: number;
  bioAlign?: "left" | "center" | "right";
  profileEffectUrl?: string | null;
  profileEffectHue?: number;
  bannerImageUrl?: string | null;
  bannerBlend?: boolean;
  bannerBackgroundUrl?: string | null;
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

  // Validate that all image URLs point to our own S3 bucket
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
  // Checked against the allowed set rather than passed through, since the value
  // reaches a CSS `text-align` and the column is an enum.
  if (data.bioAlign !== undefined && ["left", "center", "right"].includes(data.bioAlign)) {
    setData.bioAlign = data.bioAlign;
  }
  

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

  const promises = [];

  if (avatarUrlVal === null) promises.push(emptyS3Directory(userId, "avatar"));
  if (bannerImageUrlVal === null) promises.push(emptyS3Directory(userId, "banner"));
  if (bannerBackgroundUrlVal === null) promises.push(emptyS3Directory(userId, "background"));

  if (Object.keys(setData).length > 0) {
    promises.push(
      db
        .insert(schema.userSettings)
        .values({ userId, ...setData })
        .onDuplicateKeyUpdate({ set: setData })
    );
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }

  await invalidateLiveStatsCache(userId);

  revalidatePath("/dashboard/customize/profile/general");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${data.username}`);

  return { success: true };
}

export async function updateAppearanceProfile(data: {
  username: string;
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
  otherFont?: string;
  otherFontSize?: number;
  otherFontWeight?: number;
  otherLetterSpacing?: number;
  otherColor?: string;
  highlightFont?: string;
  highlightFontSize?: number;
  highlightFontWeight?: number;
  highlightLetterSpacing?: number;
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
  if (data.otherFont !== undefined) setData.otherFont = data.otherFont.slice(0, 50);
  if (data.otherFontSize !== undefined) setData.otherFontSize = data.otherFontSize;
  if (data.otherFontWeight !== undefined) setData.otherFontWeight = data.otherFontWeight;
  if (data.otherLetterSpacing !== undefined) setData.otherLetterSpacing = data.otherLetterSpacing;
  if (data.otherColor !== undefined) setData.otherColor = data.otherColor.slice(0, 32);
  if (data.highlightFont !== undefined) setData.highlightFont = data.highlightFont.slice(0, 50);
  if (data.highlightFontSize !== undefined) setData.highlightFontSize = data.highlightFontSize;
  if (data.highlightFontWeight !== undefined) setData.highlightFontWeight = data.highlightFontWeight;
  if (data.highlightLetterSpacing !== undefined) setData.highlightLetterSpacing = data.highlightLetterSpacing;
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

  if (Object.keys(setData).length === 0) return { success: true };

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  // Invalidate live stats cache (views/likes/dislikes toggles affect live stats)
  await invalidateLiveStatsCache(userId);

  revalidatePath("/dashboard/customize/profile/appearance");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${data.username}`);

  return { success: true };
}

export async function updateColorsProfile(data: {
  username: string;
  usernameColor?: string | null;
  bioColor?: string | null;
  otherColor?: string | null;
  highlightColor?: string | null;
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
  if (data.highlightColor !== undefined) setData.highlightColor = data.highlightColor?.slice(0, 32) ?? null;
  if (data.pageBgColor !== undefined) setData.pageBgColor = data.pageBgColor?.slice(0, 7) ?? null;
  if (data.widgetPrimaryTextColor !== undefined) setData.widgetPrimaryTextColor = data.widgetPrimaryTextColor?.slice(0, 32) ?? null;
  if (data.widgetSecondaryTextColor !== undefined) setData.widgetSecondaryTextColor = data.widgetSecondaryTextColor?.slice(0, 32) ?? null;
  if (data.widgetBorderColor !== undefined) setData.widgetBorderColor = data.widgetBorderColor?.slice(0, 32) ?? null;
  // Clamp rather than trust the client — this drives a CSS alpha.

  if (Object.keys(setData).length === 0) return { success: true };
  
  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/colors");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${data.username}`);
  
  return { success: true };
}

export async function updateEffectsProfile(data: {
  username: string;
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

  if (Object.keys(setData).length === 0) return { success: true };
  
  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/effects");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${data.username}`);

  return { success: true };
}

export async function updateProfileWidgets(data: {
  username?: string;
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
    instagramShowFollowers?: boolean;
    instagramShowFollowing?: boolean;
    instagramShowPosts?: boolean;
    instagramShowBackground?: boolean;
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

  // Validate max 1 presence, max 1 server, max 1 github user, max 1 github repo, max 1 pinterest profile, max 1 pinterest board, max 1 valorant, max 1 steam, max 1 genshin, max 1 twitch
  let presenceCount = 0;
  let serverCount = 0;
  let githubUserCount = 0;
  let githubRepoCount = 0;
  let pinterestProfileCount = 0;
  let pinterestBoardCount = 0;
  let valorantCount = 0;
  let steamCount = 0;
  let genshinCount = 0;
  let twitchCount = 0;
  let spotifyCount = 0;
  let instagramCount = 0;
  let tiktokCount = 0;
  let youtubeCount = 0;
  let telegramCount = 0;
  let robloxCount = 0;
  let weatherCount = 0;
  for (const w of data.widgets || []) {
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
        : w.platform === "spotify" || w.type?.startsWith("spotify-")
        ? "spotify"
        : w.type === "instagram-profile" || w.platform === "instagram"
        ? "instagram"
        : w.type === "tiktok-profile" || w.platform === "tiktok"
        ? "tiktok"
        : w.type === "youtube-profile" || w.platform === "youtube"
        ? "youtube"
        : w.type === "telegram-profile" || w.platform === "telegram"
        ? "telegram"
        : w.type === "roblox-profile" || w.platform === "roblox"
        ? "roblox"
        : w.type === "weather-current" || w.platform === "weather"
        ? "weather"
        : "presence";
    if (type === "presence") presenceCount++;
    if (type === "server") serverCount++;
    if (type === "github-user") githubUserCount++;
    if (type === "github-repo") githubRepoCount++;
    if (type === "pinterest-profile") pinterestProfileCount++;
    if (type === "pinterest-board") pinterestBoardCount++;
    if (type === "valorant-profile") valorantCount++;
    if (type === "steam-profile") steamCount++;
    if (type === "genshin-profile") genshinCount++;
    if (type === "twitch-channel") twitchCount++;
    if (type === "spotify") spotifyCount++;
    if (type === "instagram") instagramCount++;
    if (type === "tiktok") tiktokCount++;
    if (type === "youtube") youtubeCount++;
    if (type === "telegram") telegramCount++;
    if (type === "roblox") robloxCount++;
    if (type === "weather") weatherCount++;
  }
  if (presenceCount > 1) {
    throw new Error("You can only add 1 Discord Presence widget.");
  }
  if (serverCount > 1) {
    throw new Error("You can only add 1 Discord Server widget.");
  }
  if (githubUserCount > 1) {
    throw new Error("You can only add 1 GitHub User widget.");
  }
  if (githubRepoCount > 1) {
    throw new Error("You can only add 1 GitHub Repository widget.");
  }
  if (pinterestProfileCount > 1) {
    throw new Error("You can only add 1 Pinterest Profile widget.");
  }
  if (pinterestBoardCount > 1) {
    throw new Error("You can only add 1 Pinterest Board widget.");
  }
  if (valorantCount > 1) {
    throw new Error("You can only add 1 Valorant Profile widget.");
  }
  if (steamCount > 1) {
    throw new Error("You can only add 1 Steam Profile widget.");
  }
  if (genshinCount > 1) {
    throw new Error("You can only add 1 Genshin Impact widget.");
  }
  if (twitchCount > 1) {
    throw new Error("You can only add 1 Twitch Channel widget.");
  }
  if (spotifyCount > 1) {
    throw new Error("You can only add 1 Spotify widget.");
  }
  if (instagramCount > 1) {
    throw new Error("You can only add 1 Instagram widget.");
  }
  if (tiktokCount > 1) {
    throw new Error("You can only add 1 TikTok widget.");
  }
  if (youtubeCount > 1) {
    throw new Error("You can only add 1 YouTube widget.");
  }
  if (telegramCount > 1) {
    throw new Error("You can only add 1 Telegram widget.");
  }
  if (robloxCount > 1) {
    throw new Error("You can only add 1 Roblox widget.");
  }
  if (weatherCount > 1) {
    throw new Error("You can only add 1 Weather widget.");
  }
  if ((data.widgets || []).length > 4) {
    throw new Error("You can only add a maximum of 4 widgets.");
  }

  const sanitizedWidgets = (data.widgets || []).slice(0, 6).map((w) => {
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
        : w.platform === "instagram"
        ? "instagram"
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
        : w.type === "instagram-profile" || w.platform === "instagram"
        ? "instagram-profile"
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
    } else if (platform === "instagram") {
      targetId = String(w.targetId || "")
        .trim()
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/^@/, "")
        .replace(/\/$/, "")
        .slice(0, 30);
      if (!targetId || !/^[a-zA-Z0-9_.-]{1,30}$/.test(targetId)) {
        throw new Error("Invalid Instagram username format");
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

    // Steam and Genshin each expose two mutually exclusive backdrop sources.
    // The blurred-avatar "background image" wins, so the artwork source is
    // forced off whenever it is enabled — a crafted payload cannot set both.
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
      id: String(w.id || `widget_${Date.now()}`).slice(0, 50),
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
      instagramShowFollowers: w.instagramShowFollowers !== undefined ? Boolean(w.instagramShowFollowers) : true,
      instagramShowFollowing: w.instagramShowFollowing !== undefined ? Boolean(w.instagramShowFollowing) : true,
      instagramShowPosts: w.instagramShowPosts !== undefined ? Boolean(w.instagramShowPosts) : true,
      instagramShowBackground: w.instagramShowBackground !== undefined ? Boolean(w.instagramShowBackground) : true,
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
      // The banner and the blurred background image are mutually exclusive
      // backdrops; the banner wins if a record somehow arrives with both set.
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

  // The widget border settings live on this page too, so they save alongside the
  // widgets array. Each is clamped rather than trusted, since all three drive CSS.
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

  await db
    .insert(schema.userSettings)
    .values({ userId, ...setData })
    .onDuplicateKeyUpdate({ set: setData });

  revalidatePath("/dashboard/customize/profile/widgets");
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/${user.username}`);

  return { success: true };
}

