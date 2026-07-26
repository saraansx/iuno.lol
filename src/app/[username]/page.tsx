import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getSessionUserId } from '@/lib/auth/session'
import Layout1 from '@/components/profile/layouts/Layout1'
import ProfileViewTracker from '@/components/profile/ProfileViewTracker'

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache on the CDN for 1 hour (flushed instantly when user saves dashboard)

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  await headers()

  const userList = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      location: users.location,
      occupation: users.occupation,
      avatarUrl: users.avatarUrl,
      avatarShape: users.avatarShape,
      avatarDecorationUrl: users.avatarDecorationUrl,
      avatarDecorationHue: users.avatarDecorationHue,
      bannerImageUrl: users.bannerImageUrl,
      bannerBackgroundUrl: users.bannerBackgroundUrl,
      profileBgColor: users.profileBgColor,
      profileBgOpacity: users.profileBgOpacity,
      profileBorderColor: users.profileBorderColor,
      profileBorderOpacity: users.profileBorderOpacity,
      profileBorderWidth: users.profileBorderWidth,
      profileBorderRadius: users.profileBorderRadius,
      profileCardBlur: users.profileCardBlur,
      profileBackgroundBlur: users.profileBackgroundBlur,
      profileShadowColor: users.profileShadowColor,
      profileShadowOpacity: users.profileShadowOpacity,
      profileOpacity: users.profileOpacity,
      views: users.views,
      usernameFont: users.usernameFont,
      usernameFontSize: users.usernameFontSize,
      usernameFontWeight: users.usernameFontWeight,
      usernameLetterSpacing: users.usernameLetterSpacing,
      usernameColor: users.usernameColor,
      bioFont: users.bioFont,
      bioFontSize: users.bioFontSize,
      bioFontWeight: users.bioFontWeight,
      bioLetterSpacing: users.bioLetterSpacing,
      bioColor: users.bioColor,
      otherFont: users.otherFont,
      otherFontSize: users.otherFontSize,
      otherFontWeight: users.otherFontWeight,
      otherLetterSpacing: users.otherLetterSpacing,
      otherColor: users.otherColor,
      joinDateEnabled: users.joinDateEnabled,
      joinDateFormat: users.joinDateFormat,
      viewsEnabled: users.viewsEnabled,
      viewsAnimationEnabled: users.viewsAnimationEnabled,
      viewsAnimationDuration: users.viewsAnimationDuration,
      commentsEnabled: users.commentsEnabled,
      feedbackEnabled: users.feedbackEnabled,
      showFeedbackPublicly: users.showFeedbackPublicly,
      showUidTooltip: users.showUidTooltip,
      showLocationTooltip: users.showLocationTooltip,
      showOccupationTooltip: users.showOccupationTooltip,
      showLikesTooltip: users.showLikesTooltip,
      showDislikesTooltip: users.showDislikesTooltip,
      showJoinDateTooltip: users.showJoinDateTooltip,
      showViewsTooltip: users.showViewsTooltip,
      likesCount: users.likesCount,
      dislikesCount: users.dislikesCount,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (userList.length === 0) {
    notFound()
  }

  const user = userList[0]
  const viewerId = await getSessionUserId() || null;
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      <Layout1
        username={user.username}
        displayName={user.displayName ?? undefined}
        bio={user.bio ?? undefined}
        location={user.location ?? undefined}
        occupation={user.occupation ?? undefined}
        avatarUrl={user.avatarUrl ?? undefined}
        avatarShape={(user.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "rounded"}
        selectedDecoration={user.avatarDecorationUrl ? { id: "custom", name: "Decoration", url: user.avatarDecorationUrl } : null}
        decorationHue={user.avatarDecorationHue ?? 0}
        bannerImageUrl={user.bannerImageUrl ?? undefined}
        bannerBackgroundUrl={user.bannerBackgroundUrl ?? undefined}
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
      />
      <ProfileViewTracker profileId={user.id} />
    </div>
  )
}
