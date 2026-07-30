import { db } from '@/lib/db'
import { users, userSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getSessionUserId } from '@/lib/auth/session'
import Layout1 from '@/components/profile/layouts/Layout1'
import ProfileViewTracker from '@/components/profile/ProfileViewTracker'
import frames from '@/Frames.json'
import { Frame } from '@/components/dashboard/FramesPicker'
export const revalidate = 2592000; // Cache on the CDN for 30 days (flushed instantly when user saves dashboard)

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  await headers()

  const userListPromise = db
    .select({
      id: users.id,
      username: users.username,
      displayName: userSettings.displayName,
      bio: userSettings.bio,
      location: userSettings.location,
      occupation: userSettings.occupation,
      avatarUrl: userSettings.avatarUrl,
      avatarShape: userSettings.avatarShape,
      avatarDecorationUrl: userSettings.avatarDecorationUrl,
      avatarDecorationHue: userSettings.avatarDecorationHue,
      profileFrameUrl: userSettings.profileFrameUrl,
      profileFrameHue: userSettings.profileFrameHue,
      bannerImageUrl: userSettings.bannerImageUrl,
      bannerBackgroundUrl: userSettings.bannerBackgroundUrl,
      profileBgColor: userSettings.profileBgColor,
      profileBgOpacity: userSettings.profileBgOpacity,
      profileBorderColor: userSettings.profileBorderColor,
      profileBorderOpacity: userSettings.profileBorderOpacity,
      profileBorderWidth: userSettings.profileBorderWidth,
      profileBorderRadius: userSettings.profileBorderRadius,
      profileCardBlur: userSettings.profileCardBlur,
      profileBackgroundBlur: userSettings.profileBackgroundBlur,
      profileShadowColor: userSettings.profileShadowColor,
      profileShadowOpacity: userSettings.profileShadowOpacity,
      profileOpacity: userSettings.profileOpacity,
      views: users.views,
      usernameFont: userSettings.usernameFont,
      usernameFontSize: userSettings.usernameFontSize,
      usernameFontWeight: userSettings.usernameFontWeight,
      usernameLetterSpacing: userSettings.usernameLetterSpacing,
      usernameColor: userSettings.usernameColor,
      bioFont: userSettings.bioFont,
      bioFontSize: userSettings.bioFontSize,
      bioFontWeight: userSettings.bioFontWeight,
      bioLetterSpacing: userSettings.bioLetterSpacing,
      bioColor: userSettings.bioColor,
      otherFont: userSettings.otherFont,
      otherFontSize: userSettings.otherFontSize,
      otherFontWeight: userSettings.otherFontWeight,
      otherLetterSpacing: userSettings.otherLetterSpacing,
      otherColor: userSettings.otherColor,
      joinDateEnabled: userSettings.joinDateEnabled,
      joinDateFormat: userSettings.joinDateFormat,
      viewsEnabled: userSettings.viewsEnabled,
      viewsAnimationEnabled: userSettings.viewsAnimationEnabled,
      viewsAnimationDuration: userSettings.viewsAnimationDuration,
      commentsEnabled: userSettings.commentsEnabled,
      feedbackEnabled: userSettings.feedbackEnabled,
      showFeedbackPublicly: userSettings.showFeedbackPublicly,
      showUidTooltip: userSettings.showUidTooltip,
      showLocationTooltip: userSettings.showLocationTooltip,
      showOccupationTooltip: userSettings.showOccupationTooltip,
      showLikesTooltip: userSettings.showLikesTooltip,
      showDislikesTooltip: userSettings.showDislikesTooltip,
      showJoinDateTooltip: userSettings.showJoinDateTooltip,
      showViewsTooltip: userSettings.showViewsTooltip,
      likesCount: users.likesCount,
      dislikesCount: users.dislikesCount,
      createdAt: users.createdAt,
      highlightFont: userSettings.highlightFont,
      highlightFontSize: userSettings.highlightFontSize,
      highlightFontWeight: userSettings.highlightFontWeight,
      highlightLetterSpacing: userSettings.highlightLetterSpacing,
      highlightColor: userSettings.highlightColor,
      pageBgColor: userSettings.pageBgColor,
      backgroundEffect: userSettings.backgroundEffect,
      backgroundEffectIntensity: userSettings.backgroundEffectIntensity,
      backgroundEffectColor: userSettings.backgroundEffectColor,
    })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.username, username))
    .limit(1);

  const viewerIdPromise = getSessionUserId();

  const [userList, viewerIdResult] = await Promise.all([userListPromise, viewerIdPromise]);

  if (userList.length === 0) {
    notFound()
  }

  const user = userList[0]
  const viewerId = viewerIdResult || null;

  const selectedFrame = user.profileFrameUrl ? (frames as Frame[]).find(f => f.sku_id === user.profileFrameUrl!.split("frame:")[1]) : null;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: user.pageBgColor || '#050505' }}
    >
      <Layout1
        username={user.username}
        displayName={user.displayName ?? undefined}
        bio={user.bio ?? undefined}
        location={user.location ?? undefined}
        occupation={user.occupation ?? undefined}
        avatarUrl={user.avatarUrl ?? undefined}
        avatarShape={(user.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "rounded"}
        selectedDecoration={user.avatarDecorationUrl ? { id: "custom", name: "Decoration", url: user.avatarDecorationUrl } : null}
        selectedFrame={selectedFrame}
        decorationHue={user.avatarDecorationHue ?? 0}
        frameHue={user.profileFrameHue ?? 0}
        bannerImageUrl={user.bannerImageUrl ?? undefined}
        bannerBackgroundUrl={user.bannerBackgroundUrl ?? undefined}
        backgroundEffect={user.backgroundEffect ?? undefined}
        backgroundEffectIntensity={user.backgroundEffectIntensity ?? undefined}
        backgroundEffectColor={user.backgroundEffectColor ?? undefined}
        profileBgColor={user.profileBgColor ?? undefined}
        profileBgOpacity={user.profileBgOpacity ?? undefined}
        profileBorderColor={user.profileBorderColor ?? undefined}
        profileBorderOpacity={user.profileBorderOpacity ?? undefined}
        profileBorderWidth={user.profileBorderWidth ?? undefined}
        profileBorderRadius={user.profileBorderRadius ?? undefined}
        profileCardBlur={user.profileCardBlur ?? undefined}
        profileBackgroundBlur={user.profileBackgroundBlur ?? undefined}
        profileShadowColor={user.profileShadowColor ?? undefined}
        profileShadowOpacity={user.profileShadowOpacity ?? undefined}
        profileOpacity={user.profileOpacity ?? undefined}
        views={user.views}
        usernameFont={user.usernameFont ?? undefined}
        usernameFontSize={user.usernameFontSize ?? undefined}
        usernameFontWeight={user.usernameFontWeight ?? undefined}
        usernameLetterSpacing={user.usernameLetterSpacing ?? undefined}
        usernameColor={user.usernameColor ?? undefined}
        bioFont={user.bioFont ?? undefined}
        bioFontSize={user.bioFontSize ?? undefined}
        bioFontWeight={user.bioFontWeight ?? undefined}
        bioLetterSpacing={user.bioLetterSpacing ?? undefined}
        bioColor={user.bioColor ?? undefined}
        otherFont={user.otherFont ?? undefined}
        otherFontSize={user.otherFontSize ?? undefined}
        otherFontWeight={user.otherFontWeight ?? undefined}
        otherLetterSpacing={user.otherLetterSpacing ?? undefined}
        otherColor={user.otherColor ?? undefined}
        joinDateEnabled={user.joinDateEnabled ?? undefined}
        joinDateFormat={user.joinDateFormat ?? undefined}
        viewsEnabled={user.viewsEnabled ?? undefined}
        viewsAnimationEnabled={user.viewsAnimationEnabled ?? undefined}
        viewsAnimationDuration={user.viewsAnimationDuration ?? undefined}
        commentsEnabled={user.commentsEnabled ?? undefined}
        feedbackEnabled={user.feedbackEnabled ?? false}
        showFeedbackPublicly={user.showFeedbackPublicly ?? false}
        showUidTooltip={user.showUidTooltip ?? true}
        showLocationTooltip={user.showLocationTooltip ?? true}
        showOccupationTooltip={user.showOccupationTooltip ?? true}
        showLikesTooltip={user.showLikesTooltip ?? true}
        showDislikesTooltip={user.showDislikesTooltip ?? true}
        showJoinDateTooltip={user.showJoinDateTooltip ?? true}
        showViewsTooltip={user.showViewsTooltip ?? true}
        initialLikes={user.likesCount ?? 0}
        initialDislikes={user.dislikesCount ?? 0}
        createdAt={user.createdAt}
        profileId={user.id}
        viewerId={viewerId}
        highlightFont={user.highlightFont ?? undefined}
        highlightFontSize={user.highlightFontSize ?? undefined}
        highlightFontWeight={user.highlightFontWeight ?? undefined}
        highlightLetterSpacing={user.highlightLetterSpacing ?? undefined}
        highlightColor={user.highlightColor ?? undefined}
      />
      {viewerId !== user.id && <ProfileViewTracker profileId={user.id} />}
    </div>
  )
}
