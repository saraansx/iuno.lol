import {
  boolean,
  date,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
  uniqueIndex,
  float,
  AnyMySqlColumn,
} from 'drizzle-orm/mysql-core'

import { relations } from 'drizzle-orm'

// ── Users ──────────────────────────────────────────────────────────────────

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 32 }).notNull().unique(),
  displayName: varchar('display_name', { length: 32 }),
  location: varchar('location', { length: 50 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  occupation: varchar('occupation', { length: 50 }),
  bio: varchar('bio', { length: 1000 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  ip: varchar('ip', { length: 64 }),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  avatarDecorationUrl: varchar('avatar_decoration_url', { length: 500 }),
  avatarDecorationHue: int('avatar_decoration_hue').default(0),
  avatarShape: mysqlEnum('avatar_shape', ['square', 'soft', 'rounded', 'circle']).default('rounded'),
  bannerImageUrl: varchar('banner_image_url', { length: 500 }),
  bannerBackgroundUrl: varchar('banner_background_url', { length: 500 }),
  profileBgColor: varchar('profile_bg_color', { length: 7 }).default('#050505'),
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
  role: mysqlEnum('role', ['user', 'admin', 'moderator']).default('user').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  discordId: varchar('discord_id', { length: 32 }).unique(),
  discordUsername: varchar('discord_username', { length: 64 }),
  views: int('views').default(0).notNull(),
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
  otherFont: varchar('other_font', { length: 50 }).default('Inter'),
  otherFontSize: int('other_font_size').default(13),
  otherFontWeight: int('other_font_weight').default(400),
  otherLetterSpacing: float('other_letter_spacing').default(0),
  otherColor: varchar('other_color', { length: 32 }).default('#FFFFFF'),
  joinDateEnabled: boolean('join_date_enabled').default(false),
  joinDateFormat: varchar('join_date_format', { length: 32 }).default('Absolute (July 14, 2026)'),
  viewsEnabled: boolean('views_enabled').default(true),
  viewsAnimationEnabled: boolean('views_animation_enabled').default(false),
  viewsAnimationDuration: int('views_animation_duration').default(1000),
  commentsEnabled: boolean('comments_enabled').default(false),
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
  likesCount: int('likes_count').default(0).notNull(),
  dislikesCount: int('dislikes_count').default(0).notNull(),
  passwordChangedAt: timestamp('password_changed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── OTP / Verification tokens ──────────────────────────────────────────────

export const otpTokens = mysqlTable('otp_tokens', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Email verification tokens ──────────────────────────────────────────────

export const verificationTokens = mysqlTable('verification_tokens', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Password reset tokens ──────────────────────────────────────────────────

export const passwordResetTokens = mysqlTable('password_reset_tokens', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Profile views (per-day tracking) ───────────────────────────────────────

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
}))



// ── Affiliate codes ────────────────────────────────────────────────────────

export const affiliateCodes = mysqlTable('affiliate_codes', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Comments ───────────────────────────────────────────────────────────────

export const profileComments = mysqlTable('profile_comments', {
  id: int('id').primaryKey().autoincrement(),
  profileId: int('profile_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  authorId: int('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: varchar('content', { length: 2000 }).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  likesCount: int('likes_count').default(0).notNull(),
  replyToId: int('reply_to_id').references((): AnyMySqlColumn => profileComments.id, { onDelete: 'cascade' }), // optional parent comment ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

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


// ── Profile Feedback ───────────────────────────────────────────────────────

export const profileFeedback = mysqlTable('profile_feedback', {
  id: int('id').primaryKey().autoincrement(),
  receiverId: int('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  giverId: int('giver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  feedbackIdx: uniqueIndex('feedback_idx').on(table.receiverId, table.giverId),
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


// ── Re-export as schema object for Drizzle relational queries ──────────────

export const schema = {
  users,
  otpTokens,
  verificationTokens,
  passwordResetTokens,
  profileViews,
  affiliateCodes,
  profileComments,
  commentLikes,
  profileFeedback,
  profileCommentsRelations,
  commentLikesRelations,
  profileFeedbackRelations,
}
