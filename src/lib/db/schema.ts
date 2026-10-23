import {
  bigint,
  boolean,
  date,
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
  uniqueIndex,
  index,
  float,
  json,
  text,
  AnyMySqlColumn,
} from 'drizzle-orm/mysql-core'

import { relations } from 'drizzle-orm'
import type { EffectConfig } from '@/lib/effect-config'

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 32 }).notNull().unique(),
  needsUsername: boolean('needs_username').default(false).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  ip: varchar('ip', { length: 45 }),
  role: mysqlEnum('role', ['user', 'admin', 'moderator']).default('user').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  hasImageHost: boolean('is_image_host').default(false).notNull(),
  hasVerified: boolean('is_verified').default(false).notNull(),
  hasDonator: boolean('is_donator').default(false).notNull(),
  badgeTokens: int('badge_tokens').default(0).notNull(),
  aliasTokens: int('alias_tokens').default(0).notNull(),
  discordId: varchar('discord_id', { length: 32 }).unique(),
  discordUsername: varchar('discord_username', { length: 32 }),
  views: int('views').default(0).notNull(),
  likesCount: int('likes_count').default(0).notNull(),
  dislikesCount: int('dislikes_count').default(0).notNull(),
  usernameLoginEnabled: boolean('username_login_enabled').default(false).notNull(),
  passwordChangedAt: timestamp('password_changed_at'),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  twoFactorEnabledAt: timestamp('two_factor_enabled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  unverifiedCleanupIdx: index('unverified_cleanup_idx').on(table.emailVerified, table.createdAt),
  unverifiedIpIdx: index('unverified_ip_idx').on(table.ip, table.emailVerified, table.createdAt),
}))

export const userSettings = mysqlTable('user_settings', {
  userId: int('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  location: text('location'),
  timezone: text('timezone'),
  occupation: text('occupation'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  avatarDecorationUrl: text('avatar_decoration_url'),
  avatarDecorationHue: int('avatar_decoration_hue').default(0),
  profileEffectUrl: text('profile_effect_url'),
  profileEffectHue: int('profile_effect_hue').default(0),
  avatarShape: mysqlEnum('avatar_shape', ['square', 'soft', 'rounded', 'circle']).default('circle'),
  bannerImageUrl: text('banner_image_url'),
  bannerBlend: boolean('banner_blend').default(false),
  bannerBackgroundShuffle: boolean('banner_background_shuffle').default(false),
  bannerBackgroundAutoplay: boolean('banner_background_autoplay').default(true),
  bannerBackgroundSound: boolean('banner_background_sound').default(false),
  profileBgColor: text('profile_bg_color'),
  pageBgColor: text('page_bg_color'),
  backgroundEffect: text('background_effect'),
  backgroundEffectIntensity: int('background_effect_intensity').default(50),
  backgroundEffectColor: text('background_effect_color'),
  backgroundEffectAboveContainer: boolean('background_effect_above_container').default(false),
  effectConfig: json('effect_config').$type<EffectConfig>(),
  borderEffect: text('border_effect'),
  borderEffectColor: text('border_effect_color'),
  cardEffect: text('card_effect'),
  cardTransition: text('card_transition'),
  usernameEffect: text('username_effect'),
  usernameGlowEnabled: boolean('username_glow_enabled').default(false),
  descriptionEffect: text('description_effect'),
  descriptionGlowEnabled: boolean('description_glow_enabled').default(false),
  cursorTrail: text('cursor_trail'),
  cursorTrailColor: text('cursor_trail_color'),
  clickEffect: text('click_effect'),
  clickSound: text('click_sound'),
  badgeGlowEnabled: boolean('badge_glow_enabled').default(true),
  badgeGlowStrength: int('badge_glow_strength').default(50),
  badgeSize: int('badge_size').default(18),
  badgeMonochromeEnabled: boolean('badge_monochrome_enabled').default(false),
  badgeMonochromeColor: text('badge_monochrome_color'),
  badgeContainerStyle: mysqlEnum('badge_container_style', ['pill', 'none', 'separate']).default('pill'),
  badgeSpacing: int('badge_spacing').default(6),
  badgeScrollStyle: mysqlEnum('badge_scroll_style', ['none', 'pingpong', 'left', 'right']).default('none'),
  badgeScrollSpeed: int('badge_scroll_speed').default(40),
  badgeVisibleCount: int('badge_visible_count').default(5),
  badgeShimmerEnabled: boolean('badge_shimmer_enabled').default(false),
  entryTransition: text('entry_transition'),
  enterScreenEnabled: boolean('enter_screen_enabled').default(false),
  enterScreenText: text('enter_screen_text'),
  enterScreenFont: text('enter_screen_font'),
  enterScreenFontSize: int('enter_screen_font_size').default(14),
  enterScreenFontWeight: int('enter_screen_font_weight').default(500),
  enterScreenLetterSpacing: float('enter_screen_letter_spacing').default(2),
  enterScreenColor: text('enter_screen_color'),
  enterScreenOpacity: float('enter_screen_opacity').default(80),
  enterScreenBlur: float('enter_screen_blur').default(16),
  enterScreenBlurColor: text('enter_screen_blur_color'),
  profileBgOpacity: float('profile_bg_opacity').default(10),
  profileBorderColor: text('profile_border_color'),
  profileBorderOpacity: float('profile_border_opacity').default(10),
  profileBorderWidth: float('profile_border_width').default(0),
  profileBorderRadius: float('profile_border_radius').default(24),
  profileCardBlur: float('profile_card_blur').default(0),
  profileBackgroundBlur: float('profile_background_blur').default(0),
  profileShadowColor: text('profile_shadow_color'),
  profileShadowOpacity: float('profile_shadow_opacity').default(0),
  profileOpacity: float('profile_opacity').default(100),
  usernameFont: text('username_font'),
  usernameFontSize: int('username_font_size').default(24),
  usernameFontWeight: int('username_font_weight').default(700),
  usernameLetterSpacing: float('username_letter_spacing').default(0),
  usernameColor: text('username_color'),
  usernameMarginBottom: int('username_margin_bottom').default(8),
  bioFont: text('bio_font'),
  bioFontSize: int('bio_font_size').default(15),
  bioFontWeight: int('bio_font_weight').default(400),
  bioLetterSpacing: float('bio_letter_spacing').default(0),
  bioColor: text('bio_color'),
  sectionTitleFont: text('section_title_font'),
  sectionTitleFontSize: int('section_title_font_size').default(15),
  sectionTitleFontWeight: int('section_title_font_weight').default(500),
  sectionTitleLetterSpacing: float('section_title_letter_spacing').default(0),
  sectionDescFont: text('section_desc_font'),
  sectionDescFontSize: float('section_desc_font_size').default(12.5),
  sectionDescFontWeight: int('section_desc_font_weight').default(400),
  sectionDescLetterSpacing: float('section_desc_letter_spacing').default(0),
  sectionTitleColor: text('section_title_color'),
  sectionDescColor: text('section_desc_color'),
  musicPrimaryFont: text('music_primary_font'),
  musicPrimaryFontSize: int('music_primary_font_size').default(15),
  musicPrimaryFontWeight: int('music_primary_font_weight').default(400),
  musicPrimaryLetterSpacing: float('music_primary_letter_spacing').default(0),
  musicSecondaryFont: text('music_secondary_font'),
  musicSecondaryFontSize: float('music_secondary_font_size').default(12.5),
  musicSecondaryFontWeight: int('music_secondary_font_weight').default(400),
  musicSecondaryLetterSpacing: float('music_secondary_letter_spacing').default(0),
  musicLyricsFont: text('music_lyrics_font'),
  musicLyricsFontSize: int('music_lyrics_font_size').default(14),
  musicLyricsFontWeight: int('music_lyrics_font_weight').default(400),
  musicLyricsLetterSpacing: float('music_lyrics_letter_spacing').default(0),
  musicPrimaryColor: text('music_primary_color'),
  musicSecondaryColor: text('music_secondary_color'),
  musicLyricsColor: text('music_lyrics_color'),
  otherFont: text('other_font'),
  otherFontSize: int('other_font_size').default(13),
  otherFontWeight: int('other_font_weight').default(400),
  highlightFont: text('highlight_font'),
  highlightFontSize: int('highlight_font_size').default(13),
  highlightFontWeight: int('highlight_font_weight').default(400),
  highlightLetterSpacing: float('highlight_letter_spacing').default(0),
  otherLetterSpacing: float('other_letter_spacing').default(0),
  otherColor: text('other_color'),
  widgetPrimaryTextColor: text('widget_primary_text_color'),
  widgetSecondaryTextColor: text('widget_secondary_text_color'),
  widgetBorderColor: text('widget_border_color'),
  widgetBorderOpacity: int('widget_border_opacity').default(10),
  widgetBorderWidth: float('widget_border_width').default(1),
  widgetBorderRadius: float('widget_border_radius').default(24),
  widgetFont: text('widget_font'),
  widgetFontSize: float('widget_font_size').default(12.5),
  widgetFontWeight: int('widget_font_weight').default(400),
  widgetLetterSpacing: float('widget_letter_spacing').default(0),
  widgetSecondaryFont: text('widget_secondary_font'),
  widgetSecondaryFontSize: float('widget_secondary_font_size').default(12.5),
  widgetSecondaryFontWeight: int('widget_secondary_font_weight').default(400),
  widgetSecondaryLetterSpacing: float('widget_secondary_letter_spacing').default(0),
  profileStructure: text('profile_structure'),
  aboutSectionEnabled: boolean('about_section_enabled').default(true),
  aboutSectionTitle: text('about_section_title'),
  aboutSectionDescription: text('about_section_description'),
  widgetsSectionEnabled: boolean('widgets_section_enabled').default(true),
  profilePreset: text('profile_preset'),
  wrapInCard: boolean('wrap_in_card').default(true),
  contentWidth: int('content_width').default(700),
  contentAlignment: text('content_alignment'),
  avatarPlacement: text('avatar_placement'),
  joinDatePlacement: text('join_date_placement'),
  locationPlacement: text('location_placement'),
  occupationPlacement: text('occupation_placement'),
  uidPlacement: text('uid_placement'),
  viewsPlacement: text('views_placement'),
  feedbackPlacement: text('feedback_placement'),
  joinDateEnabled: boolean('join_date_enabled').default(false),
  joinDateFormat: text('join_date_format'),
  viewsEnabled: boolean('views_enabled').default(true),
  viewsAnimationEnabled: boolean('views_animation_enabled').default(false),
  viewsAnimationDuration: int('views_animation_duration').default(1000),
  viewsAnimationStyle: mysqlEnum('views_animation_style', ['none', 'countup', 'digitalroll', 'slotroll', 'speeding']).default('countup'),
  embedTitle: text('embed_title'),
  embedDescription: text('embed_description'),
  embedColor: text('embed_color'),
  embedBackgroundUrl: text('embed_background_url'),
  embedIconUrl: text('embed_icon_url'),
  faviconUrl: text('favicon_url'),
  cursorUrl: text('cursor_url'),
  tabTitle: text('tab_title'),
  tabTitleAnimated: boolean('tab_title_animated').default(false),
  commentsEnabled: boolean('comments_enabled').default(false),
  showCommentsPublicly: boolean('show_comments_publicly').default(false),
  musicTracks: json('music_tracks').$type<Array<{
    id: string;
    title: string;
    artist: string;
    artwork: string | null;
    album?: string | null;
    duration?: number | null;
    streamUrl?: string | null;
    lyrics?: Array<{ text: string; start: number; end: number }> | null;
  }>>(),
  musicPlayerStyle: text('music_player_style'),
  musicPlayerArtBg: boolean('music_player_art_bg').default(false),
  musicPlayerVolume: boolean('music_player_volume').default(true),
  musicPlayerDefaultVolume: int('music_player_default_volume').default(100),
  musicPlayerShuffle: boolean('music_player_shuffle').default(false),
  allowNewComments: boolean('allow_new_comments').default(false),
  feedbackEnabled: boolean('feedback_enabled').default(true),
  showFeedbackPublicly: boolean('show_feedback_publicly').default(true),
  showUidTooltip: boolean('show_uid_tooltip').default(false),
  showLocationTooltip: boolean('show_location_tooltip').default(false),
  showOccupationTooltip: boolean('show_occupation_tooltip').default(false),
  showLikesTooltip: boolean('show_likes_tooltip').default(false),
  showDislikesTooltip: boolean('show_dislikes_tooltip').default(false),
  showJoinDateTooltip: boolean('show_join_date_tooltip').default(false),
  showViewsTooltip: boolean('show_views_tooltip').default(false),
  showLinksTooltip: boolean('show_links_tooltip').default(false),
  showBadgesTooltip: boolean('show_badges_tooltip').default(false),
  iconsGlowEnabled: boolean('icons_glow_enabled').default(false),
  joinDateIconGlow: boolean('join_date_icon_glow').default(false),
  locationIconGlow: boolean('location_icon_glow').default(false),
  occupationIconGlow: boolean('occupation_icon_glow').default(false),
  uidIconGlow: boolean('uid_icon_glow').default(false),
  viewsIconGlow: boolean('views_icon_glow').default(false),
  feedbackIconGlow: boolean('feedback_icon_glow').default(false),
  linksSectionEnabled: boolean('links_section_enabled').default(true),
  linksSectionTitle: text('links_section_title'),
  linksSectionDescription: text('links_section_description'),
  linksSectionPosition: mysqlEnum('links_section_position', ['above', 'below']).default('below'),
  profileSections: json('profile_sections').$type<Array<{
    id: string;
    title: string;
    description?: string;
    bio?: string;
    categories: Array<'bio' | 'links' | 'widgets' | 'music'>;
  }>>(),
  linksFont: text('links_font'),
  linksFontSize: float('links_font_size').default(13.5),
  linksFontWeight: int('links_font_weight').default(400),
  linksLetterSpacing: float('links_letter_spacing').default(0),
  linksAlignment: mysqlEnum('links_alignment', ['left', 'center', 'right']).default('center'),
  linksSocialBackground: boolean('links_social_background').default(true),
  linksBorderRadius: int('links_border_radius').default(16),
  linksIconSize: int('links_icon_size').default(17),
  linksIconGap: int('links_icon_gap').default(10),
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
  links: json('links').$type<Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
    variant: 'small' | 'big';
    color: string | null;
  }>>().default([]),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  backgrounds: many(userBackgrounds),
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
  token: varchar('token', { length: 60 }).notNull(),
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

export const profileViewsHourly = mysqlTable('profile_views_hourly', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewHour: datetime('view_hour').notNull(),
  count: int('count').default(1).notNull(),
}, (table) => ({
  userHourIdx: uniqueIndex('user_hour_idx').on(table.userId, table.viewHour),
  viewHourIdx: index('view_hour_idx').on(table.viewHour),
}))

export const profileViewCountries = mysqlTable('profile_view_countries', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  country: varchar('country', { length: 2 }).notNull(),
  count: int('count').default(0).notNull(),
}, (table) => ({
  userCountryIdx: uniqueIndex('user_country_idx').on(table.userId, table.country),
}))

export const profileComments = mysqlTable('profile_comments', {
  id: int('id').primaryKey().autoincrement(),
  profileId: int('profile_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  authorId: int('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: varchar('content', { length: 200 }).notNull(),
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
  type: mysqlEnum('type', ['like', 'dislike']).notNull(),
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

export const userBadges = mysqlTable('user_badges', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: varchar('badge_id', { length: 32 }).notNull(),
  equipped: boolean('equipped').default(false).notNull(),
  equippedAt: timestamp('equipped_at'),
  sortOrder: int('sort_order').default(0).notNull(),
  customName: varchar('custom_name', { length: 32 }),
  customIconUrl: varchar('custom_icon_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userBadgeIdx: uniqueIndex('user_badge_idx').on(table.userId, table.badgeId),
  userEquippedIdx: index('user_equipped_idx').on(table.userId, table.equipped),
}))

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}))

export const userPasskeys = mysqlTable('user_passkeys', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  credentialId: varchar('credential_id', { length: 512 }).notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: bigint('counter', { mode: 'number' }).default(0).notNull(),
  transports: varchar('transports', { length: 255 }),
  name: varchar('name', { length: 64 }).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_passkeys_user_idx').on(table.userId),
}))

export const userAliases = mysqlTable('user_aliases', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  alias: varchar('alias', { length: 32 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_aliases_user_idx').on(table.userId),
}))

export const userBackgrounds = mysqlTable('user_backgrounds', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  position: int('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userPositionIdx: index('user_position_idx').on(table.userId, table.position),
}))

export const userBackgroundsRelations = relations(userBackgrounds, ({ one }) => ({
  user: one(users, {
    fields: [userBackgrounds.userId],
    references: [users.id],
  }),
}))

export const imageHostFiles = mysqlTable('image_host_files', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 255 }).notNull(),
  storageId: varchar('storage_id', { length: 128 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  kind: mysqlEnum('kind', ['image', 'video']).notNull(),
  favorite: boolean('favorite').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userUrlIdx: uniqueIndex('image_host_files_user_url_unique').on(table.userId, table.url),
  urlIdx: uniqueIndex('image_host_files_url_unique').on(table.url),
  storageIdx: index('image_host_files_storage_idx').on(table.storageId),
  userCreatedIdx: index('image_host_files_user_created_idx').on(table.userId, table.createdAt),
  userFavoriteIdx: index('image_host_files_user_favorite_idx').on(table.userId, table.favorite),
}))

export const imageHostFilesRelations = relations(imageHostFiles, ({ one }) => ({
  user: one(users, {
    fields: [imageHostFiles.userId],
    references: [users.id],
  }),
}))

export const imageHostActivity = mysqlTable('image_host_activity', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: mysqlEnum('action', ['upload', 'delete', 'favorite', 'unfavorite', 'lock', 'unlock']).notNull(),
  kind: mysqlEnum('kind', ['image', 'video']).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  url: varchar('url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index('image_host_activity_user_created_idx').on(table.userId, table.createdAt),
  userActionCreatedIdx: index('image_host_activity_user_action_created_idx').on(table.userId, table.action, table.createdAt),
}))

export const processedPaymentEvents = mysqlTable('processed_payment_events', {
  id: int('id').primaryKey().autoincrement(),
  provider: varchar('provider', { length: 16 }).notNull(),
  eventId: varchar('event_id', { length: 128 }).notNull(),
  userId: int('user_id'),
  plan: varchar('plan', { length: 32 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  providerEventIdx: uniqueIndex('processed_payment_events_provider_event_idx').on(table.provider, table.eventId),
  planCreatedIdx: index('processed_payment_events_plan_created_idx').on(table.plan, table.createdAt),
}))

export const templates = mysqlTable('templates', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 64 }).notNull(),
  thumbnailUrl: text('thumbnail_url'),
  config: json('config').$type<Record<string, unknown>>().notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  useCount: int('use_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index('templates_user_idx').on(table.userId),
  createdIdx: index('templates_created_idx').on(table.createdAt),
}))

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, { fields: [templates.userId], references: [users.id] }),
}))

export const templateFavorites = mysqlTable('template_favorites', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateId: int('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userTemplateIdx: uniqueIndex('template_fav_user_template_idx').on(table.userId, table.templateId),
  templateIdx: index('template_fav_template_idx').on(table.templateId),
}))

export const templateFavoritesRelations = relations(templateFavorites, ({ one }) => ({
  user: one(users, { fields: [templateFavorites.userId], references: [users.id] }),
  template: one(templates, { fields: [templateFavorites.templateId], references: [templates.id] }),
}))

export const schema = {
  users,
  userSettings,
  templates,
  templateFavorites,
  otpTokens,
  verificationTokens,
  passwordResetTokens,
  profileViews,
  profileViewsHourly,
  profileViewCountries,
  profileComments,
  commentLikes,
  profileFeedback,
  userBadges,
  userAliases,
  userPasskeys,
  userBackgrounds,
  imageHostFiles,
  imageHostActivity,
  processedPaymentEvents,
  usersRelations,
  userSettingsRelations,
  templatesRelations,
  templateFavoritesRelations,
  profileCommentsRelations,
  commentLikesRelations,
  profileFeedbackRelations,
  userBadgesRelations,
  userBackgroundsRelations,
  imageHostFilesRelations,
}

export type User = typeof users.$inferSelect;
