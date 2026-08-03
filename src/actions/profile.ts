"use server";

import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { profileUpdateRateLimit } from "@/lib/rate-limit";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
  profileFrameUrl?: string | null;
  profileFrameHue?: number;
  bannerImageUrl?: string | null;
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
  if (data.profileFrameUrl && !data.profileFrameUrl.startsWith("frame:")) {
    urlFields.push(data.profileFrameUrl);
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
    if (bioVal.split('\n').length > 10) {
      bioVal = bioVal.split('\n').slice(0, 10).join('\n');
    }
    setData.bio = bioVal.slice(0, 200);
  }
  if (avatarUrlVal !== undefined) setData.avatarUrl = avatarUrlVal;
  if (data.avatarShape !== undefined) setData.avatarShape = data.avatarShape;
  if (data.avatarDecorationUrl !== undefined) setData.avatarDecorationUrl = data.avatarDecorationUrl;
  if (data.avatarDecorationHue !== undefined) setData.avatarDecorationHue = data.avatarDecorationHue;
  
  if (data.profileFrameUrl !== undefined) {
    if (data.profileFrameUrl === "" || data.profileFrameUrl === null) {
      setData.profileFrameUrl = null;
    } else {
      setData.profileFrameUrl = data.profileFrameUrl;
    }
  }
  if (data.profileFrameHue !== undefined) setData.profileFrameHue = data.profileFrameHue;

  if (bannerImageUrlVal !== undefined) setData.bannerImageUrl = bannerImageUrlVal;
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
