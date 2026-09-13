import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
  uniqueIndex,
  index,
  float,
  json,
  AnyMySqlColumn,
} from 'drizzle-orm/mysql-core'

import { relations } from 'drizzle-orm'

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 32 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  ip: varchar('ip', { length: 64 }),
  role: mysqlEnum('role', ['user', 'admin', 'moderator']).default('user').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  discordId: varchar('discord_id', { length: 32 }).unique(),
  discordUsername: varchar('discord_username', { length: 64 }),
  views: int('views').default(0).notNull(),
  likesCount: int('likes_count').default(0).notNull(),
  dislikesCount: int('dislikes_count').default(0).notNull(),
  passwordChangedAt: timestamp('password_changed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  unverifiedCleanupIdx: index('unverified_cleanup_idx').on(table.emailVerified, table.createdAt),
}))

export const userSettings = mysqlTable('user_settings', {
  userId: int('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 32 }),
  location: varchar('location', { length: 50 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  occupation: varchar('occupation', { length: 50 }),
  bio: varchar('bio', { length: 1000 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  avatarDecorationUrl: varchar('avatar_decoration_url', { length: 500 }),
  avatarDecorationHue: int('avatar_decoration_hue').default(0),
  profileEffectUrl: varchar('profile_effect_url', { length: 500 }),
  profileEffectHue: int('profile_effect_hue').default(0),
  avatarShape: mysqlEnum('avatar_shape', ['square', 'soft', 'rounded', 'circle']).default('rounded'),
  bannerImageUrl: varchar('banner_image_url', { length: 500 }),
  bannerBlend: boolean('banner_blend').default(false),
  bannerBackgroundUrl: varchar('banner_background_url', { length: 500 }),
  bannerBackgroundSound: boolean('banner_background_sound').default(false),
  profileBgColor: varchar('profile_bg_color', { length: 7 }).default('#050505'),
  pageBgColor: varchar('page_bg_color', { length: 7 }).default('#050505'),
  backgroundEffect: varchar('background_effect', { length: 50 }).default('none'),
  backgroundEffectIntensity: int('background_effect_intensity').default(50),
  backgroundEffectColor: varchar('background_effect_color', { length: 32 }).default('#ffffff'),
  backgroundEffectAboveContainer: boolean('background_effect_above_container').default(false),
  borderEffect: varchar('border_effect', { length: 50 }).default('none'),
  borderEffectColor: varchar('border_effect_color', { length: 32 }).default('#ffffff'),
  cardEffect: varchar('card_effect', { length: 50 }).default('none'),
  cardTransition: varchar('card_transition', { length: 50 }).default('none'),
  usernameEffect: varchar('username_effect', { length: 50 }).default('none'),
  descriptionEffect: varchar('description_effect', { length: 50 }).default('none'),
  cursorTrail: varchar('cursor_trail', { length: 50 }).default('none'),
  cursorTrailColor: varchar('cursor_trail_color', { length: 32 }).default('#ffffff'),
  entryTransition: varchar('entry_transition', { length: 50 }).default('none'),
  enterScreenEnabled: boolean('enter_screen_enabled').default(false),
  enterScreenText: varchar('enter_screen_text', { length: 100 }).default('click to enter'),
  enterScreenFont: varchar('enter_screen_font', { length: 50 }).default('Inter'),
  enterScreenFontSize: int('enter_screen_font_size').default(14),
  enterScreenFontWeight: int('enter_screen_font_weight').default(500),
  enterScreenLetterSpacing: float('enter_screen_letter_spacing').default(2),
  enterScreenColor: varchar('enter_screen_color', { length: 32 }).default('#ffffff'),
  enterScreenOpacity: float('enter_screen_opacity').default(80),
  enterScreenBlur: float('enter_screen_blur').default(16),
  enterScreenBlurColor: varchar('enter_screen_blur_color', { length: 32 }).default('#000000'),
  profileBgOpacity: float('profile_bg_opacity').default(10),
  profileBorderColor: varchar('profile_border_color', { length: 7 }).default('#ffffff'),
  profileBorderOpacity: float('profile_border_opacity').default(100),
  profileBorderWidth: float('profile_border_width').default(0),
  profileBorderRadius: float('profile_border_radius').default(24),
  profileCardBlur: float('profile_card_blur').default(4),
  profileBackgroundBlur: float('profile_background_blur').default(0),
  profileShadowColor: varchar('profile_shadow_color', { length: 7 }).default('#000000'),
  profileShadowOpacity: float('profile_shadow_opacity').default(0),
  profileOpacity: float('profile_opacity').default(100),
  usernameFont: varchar('username_font', { length: 50 }).default('Inter'),
  usernameFontSize: int('username_font_size').default(24),
  usernameFontWeight: int('username_font_weight').default(700),
  usernameLetterSpacing: float('username_letter_spacing').default(0),
  usernameColor: varchar('username_color', { length: 32 }).default('#FFFFFF'),
  usernameMarginBottom: int('username_margin_bottom').default(8),
  bioFont: varchar('bio_font', { length: 50 }).default('Inter'),
  bioFontSize: int('bio_font_size').default(15),
  bioFontWeight: int('bio_font_weight').default(400),
  bioLetterSpacing: float('bio_letter_spacing').default(0),
  bioColor: varchar('bio_color', { length: 32 }).default('#FFFFFF'),
  bioAlign: mysqlEnum('bio_align', ['left', 'center', 'right']).default('center'),
  otherFont: varchar('other_font', { length: 50 }).default('Inter'),
  otherFontSize: int('other_font_size').default(13),
  otherFontWeight: int('other_font_weight').default(400),
  highlightFont: varchar('highlight_font', { length: 50 }).default('Inter'),
  highlightFontSize: int('highlight_font_size').default(13),
  highlightFontWeight: int('highlight_font_weight').default(400),
  highlightLetterSpacing: float('highlight_letter_spacing').default(0),
  otherLetterSpacing: float('other_letter_spacing').default(0),
  otherColor: varchar('other_color', { length: 32 }).default('#5b6cf5'),
  widgetPrimaryTextColor: varchar('widget_primary_text_color', { length: 32 }).default('#FFFFFF'),
  widgetSecondaryTextColor: varchar('widget_secondary_text_color', { length: 32 }).default('#FFFFFF'),
  widgetBorderColor: varchar('widget_border_color', { length: 32 }).default('#FFFFFF'),
  widgetBorderOpacity: int('widget_border_opacity').default(10),
  widgetBorderWidth: float('widget_border_width').default(1),
  widgetBorderRadius: float('widget_border_radius').default(24),
  widgetFont: varchar('widget_font', { length: 50 }).default('Inter'),
  widgetFontSize: float('widget_font_size').default(12.5),
  widgetFontWeight: int('widget_font_weight').default(400),
  widgetLetterSpacing: float('widget_letter_spacing').default(0),
  profileStructure: varchar('profile_structure', { length: 20 }).default('standard'),
  aboutSectionEnabled: boolean('about_section_enabled').default(true),
  aboutSectionTitle: varchar('about_section_title', { length: 60 }).default('About'),
  aboutSectionDescription: varchar('about_section_description', { length: 1000 }),
  widgetsSectionEnabled: boolean('widgets_section_enabled').default(true),
  profilePreset: varchar('profile_preset', { length: 20 }).default('modern'),
  wrapInCard: boolean('wrap_in_card').default(true),
  contentWidth: int('content_width').default(700),
  contentAlignment: varchar('content_alignment', { length: 10 }).default('left'),
  avatarPlacement: varchar('avatar_placement', { length: 20 }).default('left'),
  joinDatePlacement: varchar('join_date_placement', { length: 20 }).default('hidden'),
  locationPlacement: varchar('location_placement', { length: 20 }).default('bottom-profile'),
  occupationPlacement: varchar('occupation_placement', { length: 20 }).default('bottom-profile'),
  uidPlacement: varchar('uid_placement', { length: 20 }).default('hidden'),
  viewsPlacement: varchar('views_placement', { length: 20 }).default('bottom-profile'),
  feedbackPlacement: varchar('feedback_placement', { length: 20 }).default('bottom-profile'),
  joinDateEnabled: boolean('join_date_enabled').default(false),
  joinDateFormat: varchar('join_date_format', { length: 32 }).default('Absolute (July 14, 2026)'),
  viewsEnabled: boolean('views_enabled').default(true),
  viewsAnimationEnabled: boolean('views_animation_enabled').default(false),
  viewsAnimationDuration: int('views_animation_duration').default(1000),
  embedTitle: varchar('embed_title', { length: 100 }),
  embedDescription: varchar('embed_description', { length: 250 }),
  embedColor: varchar('embed_color', { length: 7 }).default('#5b6cf5'),
  embedImageUrl: varchar('embed_image_url', { length: 500 }),
  faviconUrl: varchar('favicon_url', { length: 500 }),
  cursorUrl: varchar('cursor_url', { length: 500 }),
  tabTitle: varchar('tab_title', { length: 60 }),
  tabTitleAnimated: boolean('tab_title_animated').default(false),
  commentsEnabled: boolean('comments_enabled').default(true),
  showCommentsPublicly: boolean('show_comments_publicly').default(true),
  allowNewComments: boolean('allow_new_comments').default(true),
  feedbackEnabled: boolean('feedback_enabled').default(true),
  showFeedbackPublicly: boolean('show_feedback_publicly').default(false),
  showUidTooltip: boolean('show_uid_tooltip').default(true),
  showLocationTooltip: boolean('show_location_tooltip').default(true),
  showOccupationTooltip: boolean('show_occupation_tooltip').default(true),
  showLikesTooltip: boolean('show_likes_tooltip').default(true),
  showDislikesTooltip: boolean('show_dislikes_tooltip').default(true),
  showJoinDateTooltip: boolean('show_join_date_tooltip').default(true),
  showViewsTooltip: boolean('show_views_tooltip').default(true),
  widgets: json('widgets').$type<Array<{
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
  }>>().default([]),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  commentsAuthored: many(profileComments, { relationName: 'comment_author' }),
  profileComments: many(profileComments, { relationName: 'profile_comments' }),
  likes: many(commentLikes),
  feedbackReceived: many(profileFeedback, { relationName: 'feedback_received' }),
  feedbackGiven: many(profileFeedback, { relationName: 'feedback_given' }),
}))

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

export const otpTokens = mysqlTable('otp_tokens', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}))

export const verificationTokens = mysqlTable('verification_tokens', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}))

export const passwordResetTokens = mysqlTable('password_reset_tokens', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}))

export const profileViews = mysqlTable('profile_views', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewDate: date('view_date').notNull(),
  count: int('count').default(1).notNull(),
  iosCount: int('ios_count').default(0).notNull(),
  androidCount: int('android_count').default(0).notNull(),
  windowsCount: int('windows_count').default(0).notNull(),
  macCount: int('mac_count').default(0).notNull(),
  otherCount: int('other_count').default(0).notNull(),
}, (table) => ({
  userDateIdx: uniqueIndex('user_date_idx').on(table.userId, table.viewDate),
  viewDateIdx: index('view_date_idx').on(table.viewDate),
}))

export const affiliateCodes = mysqlTable('affiliate_codes', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const profileComments = mysqlTable('profile_comments', {
  id: int('id').primaryKey().autoincrement(),
  profileId: int('profile_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  authorId: int('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: varchar('content', { length: 2000 }).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  likesCount: int('likes_count').default(0).notNull(),
  replyToId: int('reply_to_id').references((): AnyMySqlColumn => profileComments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  profileIdIdx: index('profile_id_idx').on(table.profileId),
  authorIdIdx: index('author_id_idx').on(table.authorId),
  replyToIdIdx: index('reply_to_id_idx').on(table.replyToId),
  profileDateIdx: index('profile_date_idx').on(table.profileId, table.createdAt),
}))

export const commentLikes = mysqlTable('comment_likes', {
  id: int('id').primaryKey().autoincrement(),
  commentId: int('comment_id').notNull().references(() => profileComments.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userCommentIdx: uniqueIndex('user_comment_idx').on(table.commentId, table.userId),
}))

export const profileCommentsRelations = relations(profileComments, ({ one, many }) => ({
  author: one(users, {
    fields: [profileComments.authorId],
    references: [users.id],
    relationName: 'comment_author',
  }),
  profile: one(users, {
    fields: [profileComments.profileId],
    references: [users.id],
    relationName: 'profile_comments',
  }),
  likes: many(commentLikes),
}))

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(profileComments, {
    fields: [commentLikes.commentId],
    references: [profileComments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}))

export const profileFeedback = mysqlTable('profile_feedback', {
  id: int('id').primaryKey().autoincrement(),
  receiverId: int('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  giverId: int('giver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  feedbackIdx: uniqueIndex('feedback_idx').on(table.receiverId, table.giverId),
  giverIdx: index('giver_idx').on(table.giverId),
}))

export const profileFeedbackRelations = relations(profileFeedback, ({ one }) => ({
  receiver: one(users, {
    fields: [profileFeedback.receiverId],
    references: [users.id],
    relationName: 'feedback_received',
  }),
  giver: one(users, {
    fields: [profileFeedback.giverId],
    references: [users.id],
    relationName: 'feedback_given',
  }),
}))

export const schema = {
  users,
  userSettings,
  otpTokens,
  verificationTokens,
  passwordResetTokens,
  profileViews,
  affiliateCodes,
  profileComments,
  commentLikes,
  profileFeedback,
  usersRelations,
  userSettingsRelations,
  profileCommentsRelations,
  commentLikesRelations,
  profileFeedbackRelations,
}

export type User = typeof users.$inferSelect;
