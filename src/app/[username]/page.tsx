import { db } from '@/lib/db'
import { users, userSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Layout1 from '@/components/profile/layouts/Layout1'
import ProfileViewTracker from '@/components/profile/ProfileViewTracker'
import frames from '@/Frames.json'
import { Frame } from '@/components/dashboard/FramesPicker'

// This page reads no per-request state (no cookies/headers), so Next serves it
// from the CDN as ISR and only regenerates on first view, after the 30-day
// window, or when the owner saves (revalidatePath(`/${username}`) in the
// profile actions). Viewer-specific bits (who's viewing, their own feedback)
// are fetched client-side in Layout1 via /api/profile/me so they never get
// baked into the shared cache.
export const revalidate = 2592000; // 30 days

// Opt this dynamic route into ISR. No usernames are prebuilt at build time
// (empty array), but without this export Next treats the route as fully dynamic
// and ignores `revalidate`. With it, each profile is rendered once on first
// visit, then served from the CDN until the window elapses or the owner saves.
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase().trim()

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
      showCommentsPublicly: userSettings.showCommentsPublicly,
      allowNewComments: userSettings.allowNewComments,
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
      backgroundEffectAboveContainer: userSettings.backgroundEffectAboveContainer,
      borderEffect: userSettings.borderEffect,
      borderEffectColor: userSettings.borderEffectColor,
      cardEffect: userSettings.cardEffect,
      cardTransition: userSettings.cardTransition,
      usernameEffect: userSettings.usernameEffect,
      descriptionEffect: userSettings.descriptionEffect,
      cursorTrail: userSettings.cursorTrail,
      cursorTrailColor: userSettings.cursorTrailColor,
      entryTransition: userSettings.entryTransition,
      enterScreenEnabled: userSettings.enterScreenEnabled,
      enterScreenText: userSettings.enterScreenText,
      enterScreenFont: userSettings.enterScreenFont,
      enterScreenFontSize: userSettings.enterScreenFontSize,
      enterScreenFontWeight: userSettings.enterScreenFontWeight,
      enterScreenLetterSpacing: userSettings.enterScreenLetterSpacing,
      enterScreenColor: userSettings.enterScreenColor,
      enterScreenOpacity: userSettings.enterScreenOpacity,
      enterScreenBlur: userSettings.enterScreenBlur,
      enterScreenBlurColor: userSettings.enterScreenBlurColor,
      widgets: userSettings.widgets,
    })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.username, username))
    .limit(1);

  const userList = await userListPromise;

  if (userList.length === 0) {
    notFound()
  }

  const user = userList[0]

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
        backgroundEffectAboveContainer={user.backgroundEffectAboveContainer ?? undefined}
        borderEffect={user.borderEffect ?? undefined}
        borderEffectColor={user.borderEffectColor ?? undefined}
        cardEffect={user.cardEffect ?? undefined}
        cardTransition={user.cardTransition ?? undefined}
        usernameEffect={user.usernameEffect ?? undefined}
        descriptionEffect={user.descriptionEffect ?? undefined}
        cursorTrail={user.cursorTrail ?? undefined}
        cursorTrailColor={user.cursorTrailColor ?? undefined}
        entryTransition={user.entryTransition ?? undefined}
        enterScreenEnabled={user.enterScreenEnabled ?? undefined}
        enterScreenText={user.enterScreenText ?? undefined}
        enterScreenFont={user.enterScreenFont ?? undefined}
        enterScreenFontSize={user.enterScreenFontSize ?? undefined}
        enterScreenFontWeight={user.enterScreenFontWeight ?? undefined}
        enterScreenLetterSpacing={user.enterScreenLetterSpacing ?? undefined}
        enterScreenColor={user.enterScreenColor ?? undefined}
        enterScreenOpacity={user.enterScreenOpacity ?? undefined}
        enterScreenBlur={user.enterScreenBlur ?? undefined}
        enterScreenBlurColor={user.enterScreenBlurColor ?? undefined}
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
        showCommentsPublicly={user.showCommentsPublicly ?? true}
        allowNewComments={user.allowNewComments ?? true}
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
        viewerId={null}
        highlightFont={user.highlightFont ?? undefined}
        highlightFontSize={user.highlightFontSize ?? undefined}
        highlightFontWeight={user.highlightFontWeight ?? undefined}
        highlightLetterSpacing={user.highlightLetterSpacing ?? undefined}
        highlightColor={user.highlightColor ?? undefined}
        widgets={user.widgets ?? undefined}
      />
      <ProfileViewTracker profileId={user.id} />
    </div>
  )
}
