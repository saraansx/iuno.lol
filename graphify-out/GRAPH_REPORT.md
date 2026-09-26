# Graph Report - iuno.lol  (2026-09-26)

## Corpus Check
- Large corpus: 607 files · ~389,907 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2605 nodes · 6961 edges · 136 communities (124 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.85)
- Token cost: 315,875 input · 0 output

## Community Hubs (Navigation)
- Dashboard Nav & Session
- Profile Customize Context
- Username Effects
- Comments & Analytics
- Background Particles
- Profile Links & Icons
- Loading States
- Route Pages & Checkout
- Home & Root Layout
- Widget API Routes
- Metadata & View Tracking
- Profile Preview & Sections
- Auth Forms & UI Shell
- Music API & Lyrics
- GitHub & TikTok Widgets
- Background & Banner Settings
- Overlay Effects & Color Utils
- Genshin & Roblox Settings
- Transition & Effect Sections
- Weather Widget
- NPM Dependencies
- Pinterest & Discord Widgets
- Card Transitions
- Widget API Data Types
- Style Customization Sections
- Valorant Rank Settings
- Click & Cursor Effect Settings
- Redis Live Stats Cache
- Discord Presence Settings
- Package Manifest
- Widget Data Hooks
- GitHub Repo Widget Settings
- TikTok Widget Settings
- Music Player Settings
- Add Widget & Roblox
- Card Hover Effects
- Click Effects & Sounds
- Feedback & Text Formatting
- Spotify Widget
- GitHub User Widget Settings
- Music Track Caching
- Discord Bot & Invites
- File Upload (Catbox)
- Badges & Milestones
- Badge & Presence Data
- Actions: Resend
- Dashboard Customize: Steam
- Actions: User
- Components Ui: Sidebar
- Api Cron: Embed
- Lib: Rate
- Dashboard Uploads: Upload
- Profile Layouts: Detail
- Profile Layouts: Border
- Lib Db: Relations
- Module
- App Checkout: Razorpay
- Auth New Verification: New
- Api Cron: Cleanup
- Lib Payments: Polar
- Api Widgets: Genshin
- Dashboard Customize: Count
- Profile Layouts: Description
- Profile Music: Music
- Components Ui: Toast
- Dashboard Customize: Handle
- Api Widgets: Roblox
- Lib: General
- Profile Layouts: Transition
- Api Widgets: Discord
- Server Security: Route
- Api Widgets: You
- Components Ui: Morphing
- Dashboard Customize: Milestone
- Features Users: User
- App Pricing: Pricing
- Auth New Password: Tsx
- Profile Layouts: Color
- Api Widgets: Telegram
- Api Widgets: Tik
- Dashboard Customize: Font
- Components Dashboard: Picker
- Dashboard Customize: Pinterest
- Types
- Lib Auth: Otp
- App Register: Tsx
- Components Effects: Dither
- Lib Hooks: Twitch
- Lib Payments: Razorpay
- Api Widgets: Spotify
- Lib: Valorant
- Profile Widgets: Weather
- Profile Widgets: You
- Components Dashboard: Upload
- Dashboard Customize: Row
- Dashboard Customize: Profile
- Profile Layouts: Reveal
- Deploy
- Lib Payments: Method
- Api Widgets: Steam
- Profile Layouts: Liquid
- Profile Widgets: Telegram
- Dashboard Customize: Animated
- Profile Layouts: Pixel
- Profile Layouts: Scramble
- Components Ui: Glyph
- Public: Iuno
- Dashboard Customize: Steam
- Admin
- Api Auth: User
- Profile Layouts: Aurora
- Profile Layouts: Light
- Dashboard Customize: Background
- Dashboard Customize: Border
- Profile Layouts: Dark
- Profile Layouts: Views
- Scripts
- Profile Layouts: Sparkle
- Public: Iuno
- Profile Layouts: Lockon
- Profile Layouts: Sakura
- Drizzle
- Eslint
- Public: Iuno
- Public: Oneko
- Profile Layouts: Flames
- Profile Layouts: Flip
- Profile Layouts: Float
- Profile Layouts: Glitch
- Profile Layouts: Shimmer
- App: Not
- Dashboard Customize: Image
- Markdown
- Next
- Config

## God Nodes (most connected - your core abstractions)
1. `react` - 232 edges
2. `next` - 196 edges
3. `getSessionUserId()` - 144 edges
4. `getUserById` - 94 edges
5. `widgetRateLimit()` - 72 edges
6. `updateProfileWidgets()` - 48 edges
7. `WidgetItem` - 37 edges
8. `framer-motion` - 35 edges
9. `useDebouncedValue()` - 35 edges
10. `widgetCacheKey()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Deploy Concurrency Control` --semantically_similar_to--> `Profile Stats Cache Invalidation Flow`  [INFERRED] [semantically similar]
  .github/workflows/deploy.yml → CLAUDE.md
- `Deploy to EC2 Workflow` --references--> `Core npm Commands`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `ISR Cache Seeding` --shares_data_with--> `Client Live Hydration (ISR 30-day)`  [INFERRED]
  .github/workflows/deploy.yml → CLAUDE.md
- `DashboardProfilePreviewProps` --references--> `FullUser`  [EXTRACTED]
  src/components/dashboard/DashboardProfilePreview.tsx → src/lib/features/users/db.ts
- `ProfilePreviewProps` --references--> `Decoration`  [EXTRACTED]
  src/components/dashboard/ProfilePreview.tsx → src/components/dashboard/DecorationPicker.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Zero-Downtime Production Deploy Flow** — github_workflows_deploy_deployworkflow, github_workflows_deploy_concurrencycontrol, github_workflows_deploy_atomicbuildswap, github_workflows_deploy_isrcacheseeding, github_workflows_deploy_healthcheck [EXTRACTED 1.00]
- **Profile Stats Live Update & Hydration Flow** — claude_cacheinvalidation, claude_clientlivehydration, claude_techstack [INFERRED 0.85]
- **Architecture & Layout Customization System** — claude_previewpanelsync, claude_modularentrytransitions, claude_markdownemojiparser, claude_designsystem [INFERRED 0.85]

## Communities (136 total, 12 thin omitted)

### Community 0 - "Dashboard Nav & Session"
Cohesion: 0.12
Nodes (41): next, metadata, metadata, metadata, metadata, metadata, metadata, metadata (+33 more)

### Community 1 - "Profile Customize Context"
Cohesion: 0.07
Nodes (55): BadgeEntry, equipBadge(), findBadge(), getMyBadges(), isLocked(), LevelEntry, LikeEntry, revalidateOwnProfile() (+47 more)

### Community 2 - "Username Effects"
Cohesion: 0.05
Nodes (25): extractText(), cornerStyle(), LockonUsernameEffect(), replaceText(), WithChildren, PETALS, ShuffleUsernameEffect(), Sparkle (+17 more)

### Community 3 - "Comments & Analytics"
Cohesion: 0.08
Nodes (38): date-fns, recharts, addComment(), commentAuthorRelation, CommentAuthorRow, deleteComment(), editComment(), getComments() (+30 more)

### Community 4 - "Background Particles"
Cohesion: 0.07
Nodes (36): FirefliesEffect(), ParticlesEffect(), ShootingStarsEffect(), Bubble, BubblesTrail(), FluidLineTrail(), PASSES, drawCursor() (+28 more)

### Community 5 - "Profile Links & Icons"
Cohesion: 0.07
Nodes (39): GET(), toSvg(), IconifyPickerModal(), IconifyPickerModalProps, LinkModal(), LinkModalProps, toLink(), uploadLinkIcon() (+31 more)

### Community 7 - "Route Pages & Checkout"
Cohesion: 0.09
Nodes (41): GET(), CheckoutPage(), metadata, EARLY_CUTOFF_UID, metadata, Page(), Page(), Page() (+33 more)

### Community 8 - "Home & Root Layout"
Cohesion: 0.05
Nodes (36): ColorBends, Home(), HomeProps, caveat, caviarDreams, chillax, comfortaa, dancingScript (+28 more)

### Community 9 - "Widget API Routes"
Cohesion: 0.09
Nodes (30): ref_node_dns, ref_node_https, ref_node_net, ref_node_stream, GET(), GET(), GET(), GET() (+22 more)

### Community 10 - "Metadata & View Tracking"
Cohesion: 0.08
Nodes (31): @fingerprintjs/fingerprintjs, ref_node_fs, ref_node_path, GET(), runtime, dynamicParams, generateMetadata(), generateViewport() (+23 more)

### Community 11 - "Profile Preview & Sections"
Cohesion: 0.08
Nodes (31): DETAIL_FIELDS, LayoutProfileClient(), AVATAR_OPTIONS, HeaderSection(), HeaderSectionProps, SectionedProfileSection(), SectionedProfileSectionProps, DashboardProfilePreviewProps (+23 more)

### Community 12 - "Auth Forms & UI Shell"
Cohesion: 0.09
Nodes (24): framer-motion, ForgotPasswordClient(), metadata, ForgotPasswordForm(), LoginForm(), LoginMethod, NewPasswordForm(), RegisterForm() (+16 more)

### Community 13 - "Music API & Lyrics"
Cohesion: 0.10
Nodes (26): dynamic, GET(), revalidate, dynamic, EviLine, EviWord, GET(), revalidate (+18 more)

### Community 14 - "GitHub & TikTok Widgets"
Cohesion: 0.11
Nodes (27): GitHubRepoClient(), LANGUAGE_COLORS, TikTokClient(), GitHubRepoWidget(), LANGUAGE_COLORS, TikTokWidget(), GitHubForkIcon(), GitHubIssuesIcon() (+19 more)

### Community 15 - "Background & Banner Settings"
Cohesion: 0.07
Nodes (24): ImageSourceSetting(), ImageSourceSettingProps, ModeSetting(), ModeSettingProps, ShowBackgroundSetting(), ShowBackgroundSettingProps, ShowBannerSetting(), ShowBannerSettingProps (+16 more)

### Community 16 - "Overlay Effects & Color Utils"
Cohesion: 0.07
Nodes (21): HeartsEffect(), hexToHue(), LightningEffect(), ctxMap, hexToRgb(), LightTunnelCtx, LightTunnelEffect(), MeteorsEffect() (+13 more)

### Community 17 - "Genshin & Roblox Settings"
Cohesion: 0.09
Nodes (23): ImageShapeSetting(), ImageShapeSettingProps, PlacementSetting(), PlacementSettingProps, GenshinCustomization(), GenshinCustomizationProps, GenshinToggleSetting(), ToggleSettingProps (+15 more)

### Community 18 - "Transition & Effect Sections"
Cohesion: 0.09
Nodes (25): VIEWS_ANIMATION_STYLES, ViewsAnimationStyle, ViewsSection(), ViewsSectionProps, CARD_EFFECTS, CARD_TRANSITIONS, CardTransitionSectionProps, ClickEffectSectionProps (+17 more)

### Community 19 - "Weather Widget"
Cohesion: 0.12
Nodes (26): buildLocationQuery(), fetchWeatherData(), GET(), OpenWeatherResponse, REQUEST_HEADERS, POST(), TemperatureUnitSetting(), TemperatureUnitSettingProps (+18 more)

### Community 20 - "NPM Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, @base-ui/react, bcrypt, clsx, date-fns, drizzle-orm, @fingerprintjs/fingerprintjs, framer-motion (+23 more)

### Community 21 - "Pinterest & Discord Widgets"
Cohesion: 0.16
Nodes (18): GenshinClient(), PinterestBoardClient(), PinterestProfileClient(), WidgetItem, DiscordServerWidget(), GenshinWidget(), PinterestBoardWidget(), PinterestProfileWidget() (+10 more)

### Community 22 - "Card Transitions"
Cohesion: 0.08
Nodes (16): BlurCardTransitionProps, BounceCardTransitionProps, FadeCardTransitionProps, FlipCardTransitionProps, SlideDownCardTransitionProps, SlideUpCardTransitionProps, ZoomInCardTransitionProps, BlurCardTransition (+8 more)

### Community 23 - "Widget API Data Types"
Cohesion: 0.16
Nodes (22): DiscordServerData, dynamic, GET(), ContributionsPayload, GET(), GET(), GitHubRepoData, GET() (+14 more)

### Community 24 - "Style Customization Sections"
Cohesion: 0.13
Nodes (20): BadgeStyleCustomization(), BadgeStyleCustomizationProps, ColorCustomization(), ColorCustomizationProps, MusicStyleCustomization(), MusicStyleCustomizationProps, SectionStyleCustomization(), SectionStyleCustomizationProps (+12 more)

### Community 25 - "Valorant Rank Settings"
Cohesion: 0.09
Nodes (20): MatchSourceSetting(), MatchSourceSettingProps, RankModeSetting(), RankModeSettingProps, RankStyleSetting(), RankStyleSettingProps, ShowLevelSetting(), ShowLevelSettingProps (+12 more)

### Community 26 - "Click & Cursor Effect Settings"
Cohesion: 0.10
Nodes (17): CardTransitionSection(), ClickEffectSection(), ClickSoundSection(), ClickSoundSectionProps, CURSOR_TRAILS, CursorTrailSection(), CursorTrailSectionProps, DescriptionEffectSection() (+9 more)

### Community 27 - "Redis Live Stats Cache"
Cohesion: 0.14
Nodes (18): drizzle-orm, ioredis, mysql2, dynamic, GET(), getLiveStatsByUsername(), dynamic, NO_STORE (+10 more)

### Community 28 - "Discord Presence Settings"
Cohesion: 0.10
Nodes (17): PresenceCustomizationProps, FallbackTextSetting(), FallbackTextSettingProps, ShowActivityImageSetting(), ShowActivityImageSettingProps, ShowActivitySetting(), ShowActivitySettingProps, ShowAvatarDecorationSetting() (+9 more)

### Community 29 - "Package Manifest"
Cohesion: 0.08
Nodes (24): author, description, keywords, license, name, private, version, babel-plugin-react-compiler (+16 more)

### Community 30 - "Widget Data Hooks"
Cohesion: 0.15
Nodes (14): SteamUserData, DiscordServerClient(), GitHubUserClient(), LEVEL_COLORS, GitHubUserWidget(), LEVEL_COLORS, useDebouncedValue(), WIDGET_DEBOUNCE_MS (+6 more)

### Community 31 - "GitHub Repo Widget Settings"
Cohesion: 0.11
Nodes (16): GitHubRepoCustomization(), GitHubRepoCustomizationProps, ShowBackgroundOverlaySetting(), ShowBackgroundOverlaySettingProps, ShowForksSetting(), ShowForksSettingProps, ShowOpenIssuesSetting(), ShowOpenIssuesSettingProps (+8 more)

### Community 32 - "TikTok Widget Settings"
Cohesion: 0.11
Nodes (16): ShowBackgroundSetting(), ShowBackgroundSettingProps, ShowFollowersSetting(), ShowFollowersSettingProps, ShowFollowingSetting(), ShowFollowingSettingProps, ShowLikesSetting(), ShowLikesSettingProps (+8 more)

### Community 33 - "Music Player Settings"
Cohesion: 0.12
Nodes (17): MusicProfileClient(), sanitizeStyle(), toTrack(), Track, MusicPlayerStyle, PLAYER_STYLES, PlayerStyleOption, PlayerStyleSection() (+9 more)

### Community 34 - "Add Widget & Roblox"
Cohesion: 0.15
Nodes (17): RobloxClient(), AddWidgetModal(), AddWidgetModalProps, PLATFORMS, SPOTIFY_TYPES, WidgetsCustomizationProps, RobloxWidget(), GenshinLogoIcon() (+9 more)

### Community 35 - "Card Hover Effects"
Cohesion: 0.11
Nodes (12): DiveCardEffectProps, ElasticCardEffectProps, MagnetCardEffectProps, SkewCardEffectProps, ZoomCardEffectProps, CardEffect(), CardEffectProps, DiveCardEffect (+4 more)

### Community 36 - "Click Effects & Sounds"
Cohesion: 0.12
Nodes (21): BUBBLE_COLORS, ClickEffects(), ClickEffectsProps, CONFETTI_COLORS, drawHeart(), drawStar(), EMBER_COLORS, FIREWORK_COLORS (+13 more)

### Community 37 - "Feedback & Text Formatting"
Cohesion: 0.19
Nodes (17): submitFeedbackAction(), FeedbackButtons(), FeedbackButtonsProps, hexToRgba(), DescriptionEffect(), FORMAT_RULES, parseInlineFormatting(), EntryTransition() (+9 more)

### Community 38 - "Spotify Widget"
Cohesion: 0.15
Nodes (15): SpotifyClient(), SpotifyCustomization(), IconProps, SpotifyAlbumIcon(), SpotifyArtistIcon(), SpotifyCalendarIcon(), SpotifyFollowersIcon(), SpotifyListenersIcon() (+7 more)

### Community 39 - "GitHub User Widget Settings"
Cohesion: 0.12
Nodes (14): GitHubUserCustomization(), GitHubUserCustomizationProps, ShowBackgroundOverlaySetting(), ShowBackgroundOverlaySettingProps, ShowContributionHeatmapSetting(), ShowContributionHeatmapSettingProps, ShowFollowersSetting(), ShowFollowersSettingProps (+6 more)

### Community 40 - "Music Track Caching"
Cohesion: 0.13
Nodes (18): AVATAR_PLACEMENTS, CachedTrackMedia, cacheTrackArtwork(), cacheTrackAudio(), CONTENT_ALIGNMENTS, DETAIL_PLACEMENT_FIELDS, DETAIL_PLACEMENTS, eviHeaders() (+10 more)

### Community 41 - "Discord Bot & Invites"
Cohesion: 0.24
Nodes (16): hasInviteCode(), botFetch(), DiscordError, fetchInvite(), grantGuildRole(), botConfig(), botFetch(), getOrCreateInvite() (+8 more)

### Community 42 - "File Upload (Catbox)"
Cohesion: 0.22
Nodes (16): getAudioExtension(), getRealFileExtension(), maxDuration, POST(), catboxFileId(), deleteFromCatbox(), recordUploadedFile(), CATBOX_BASE (+8 more)

### Community 43 - "Badges & Milestones"
Cohesion: 0.13
Nodes (17): AnyBadge, APPLY_BADGE_IDS, Badge, BadgeIcon(), ContainerStyle, CTA_BUTTONS, formatViews(), LevelsCard() (+9 more)

### Community 44 - "Badge & Presence Data"
Cohesion: 0.17
Nodes (14): DiscordPresenceClient(), formatLastSeen(), BadgeItemData, BadgesOrderCustomization(), BadgesOrderCustomizationProps, PresenceCustomization(), DiscordPresenceWidget(), formatLastSeen() (+6 more)

### Community 45 - "Actions: Resend"
Cohesion: 0.21
Nodes (13): resend, forgotPassword(), resendVerification(), sendOTP(), createPasswordResetToken(), createVerificationToken(), sendPasswordResetEmail(), sendTwoFactorTokenEmail() (+5 more)

### Community 46 - "Dashboard Customize: Steam"
Cohesion: 0.18
Nodes (12): sonner, SteamClient(), areWidgetsEqual(), WidgetsProfileClient(), WidgetBorderCustomization(), WidgetBorderCustomizationProps, WidgetsCustomization(), SaveBar() (+4 more)

### Community 47 - "Actions: User"
Cohesion: 0.25
Nodes (14): checkAvailability(), register(), RegisterInput, deleteVerificationTokens(), UserFacingError, assertEmailAvailable(), assertUsernameAvailable(), createUser() (+6 more)

### Community 48 - "Components Ui: Sidebar"
Cohesion: 0.16
Nodes (15): logout(), NavGroup, NavItem, SidebarContent(), SidebarContentProps, SidebarProps, SubItem, DesktopSidebar() (+7 more)

### Community 49 - "Api Cron: Embed"
Cohesion: 0.17
Nodes (14): fetchAllMemberRoles(), GET(), handleSync(), isComingSoon(), MAPPED_BADGE_IDS, maxDuration, POST(), purgeProfiles() (+6 more)

### Community 50 - "Lib: Rate"
Cohesion: 0.24
Nodes (17): GET(), svgResponse(), normalizeColorParam(), checkAvailabilityRateLimit(), checkRateLimit(), commentLikeRateLimit(), commentRateLimit(), discordOAuthRateLimit() (+9 more)

### Community 51 - "Dashboard Uploads: Upload"
Cohesion: 0.22
Nodes (10): uploadAsset(), CursorUpload(), EmbedImageUpload(), FaviconUpload(), MediaUploadModal(), MediaUploadModalProps, Props, shrinkToCursorSize() (+2 more)

### Community 52 - "Profile Layouts: Detail"
Cohesion: 0.16
Nodes (16): DetailPlacementMap, DetailRow, DETAILS, PLACEMENTS, placementSummary(), ProfileDetailsSection(), ProfileDetailsSectionProps, DetailIconGlow (+8 more)

### Community 53 - "Profile Layouts: Border"
Cohesion: 0.13
Nodes (12): ElectricBorderEffectProps, ShineBorderEffectProps, BorderEffect(), BorderEffectProps, ElectricBorderEffect, parseBorderColors(), ShineBorderEffect, ElectricBorder() (+4 more)

### Community 54 - "Lib Db: Relations"
Cohesion: 0.11
Nodes (18): affiliateCodes, commentLikes, commentLikesRelations, otpTokens, passwordResetTokens, profileComments, profileCommentsRelations, profileFeedbackRelations (+10 more)

### Community 55 - "Module"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "App Checkout: Razorpay"
Cohesion: 0.13
Nodes (14): react-dom, BUY_OPTIONS, BuyFor, CheckoutClient(), CheckoutClientProps, loadRazorpay(), PREMIUM_FEATURES, RazorpayInstance (+6 more)

### Community 57 - "Auth New Verification: New"
Cohesion: 0.19
Nodes (12): newPassword(), newVerification(), NewVerificationClient(), NewVerificationForm(), metadata, consumePasswordResetToken(), consumeVerificationToken(), hashToken() (+4 more)

### Community 58 - "Api Cron: Cleanup"
Cohesion: 0.20
Nodes (14): GET(), handleCleanup(), POST(), GET(), handleCleanup(), POST(), dynamic, GET() (+6 more)

### Community 59 - "Lib Payments: Polar"
Cohesion: 0.18
Nodes (15): PolarOrderData, POST(), userIdFrom(), schema, Gateway, notifyPremiumPurchase(), PurchaseNotification, webhookFor() (+7 more)

### Community 60 - "Api Widgets: Genshin"
Cohesion: 0.19
Nodes (15): CharacterEntry, EnkaMaps, fetchGenshinPlayerData(), fetchStoreJson(), GET(), loadEnkaMaps(), NamecardEntry, PfpEntry (+7 more)

### Community 61 - "Dashboard Customize: Count"
Cohesion: 0.14
Nodes (12): ShowViewButtonSetting(), ShowViewButtonSettingProps, ServerCustomization(), ServerCustomizationProps, ShowBackgroundOverlaySetting(), ShowBackgroundOverlaySettingProps, ShowBannerSetting(), ShowBannerSettingProps (+4 more)

### Community 62 - "Profile Layouts: Description"
Cohesion: 0.14
Nodes (9): WithStyle, WithStyle, WithStyle, WithStyle, BlurDescriptionEffect, DescriptionEffectProps, DistortDescriptionEffect, FlickerDescriptionEffect (+1 more)

### Community 63 - "Profile Music: Music"
Cohesion: 0.25
Nodes (12): CompactMusicPlayer(), formatTime(), formatTime(), LyricsMusicPlayer(), useVolume(), VolumeButton(), formatTime(), WaveformMusicPlayer() (+4 more)

### Community 64 - "Components Ui: Toast"
Cohesion: 0.16
Nodes (11): @base-ui/react, FloatingInput, FloatingInputProps, baseToastManager, ToastClose(), ToastContent(), ToastDescription(), Toaster() (+3 more)

### Community 65 - "Dashboard Customize: Handle"
Cohesion: 0.15
Nodes (11): checkRecruiterProgress(), getMyInvite(), requireLinkedUser(), badgeById(), BadgesTabs(), handleInviteRefresh(), isBadgeLocked(), openDiscordApply() (+3 more)

### Community 66 - "Api Widgets: Roblox"
Cohesion: 0.23
Nodes (14): fetchAvatarUrl(), fetchCount(), fetchRobloxUserData(), GET(), REQUEST_HEADERS, resolveUsernameToId(), RobloxUserRecord, POST() (+6 more)

### Community 67 - "Lib: General"
Cohesion: 0.17
Nodes (14): GeneralInfoSection(), GeneralInfoSectionProps, BackgroundUpload(), BannerUpload(), ANIMATED_BACKGROUND_PREFIX, AURORA_DEFAULTS, COLORBENDS_DEFAULTS, CRTWARP_DEFAULTS (+6 more)

### Community 68 - "Profile Layouts: Transition"
Cohesion: 0.41
Nodes (9): BlurDissolveTransition(), CurtainTransition(), FadeBlackTransition(), FadeTransition(), IrisTransition(), TransitionRendererProps, getBlurOverlayOpacity(), EntryTransitionProps (+1 more)

### Community 69 - "Api Widgets: Discord"
Cohesion: 0.18
Nodes (13): ref_crypto, GET(), DiscordClan, DiscordMemberData, DiscordUserFields, GET(), NO_STORE, PresenceResponse (+5 more)

### Community 70 - "Server Security: Route"
Cohesion: 0.22
Nodes (11): GET(), POST(), GET(), POST(), shortHash(), polarConfigured(), getClientIp(), isValidIp() (+3 more)

### Community 71 - "Api Widgets: You"
Cohesion: 0.26
Nodes (12): fetchYouTubeData(), GET(), parseIsoDurationSeconds(), pickThumbnail(), Thumbnail, ThumbnailSet, ytFetch(), POST() (+4 more)

### Community 72 - "Components Ui: Morphing"
Cohesion: 0.16
Nodes (11): Countdown(), LAUNCH_AT, MORPH_WORDS, remainingParts(), UNITS, Highlighter(), HighlighterProps, MorphingText() (+3 more)

### Community 73 - "Dashboard Customize: Milestone"
Cohesion: 0.17
Nodes (14): BADGES, LEVELS, LevelStage, LIKE_MILESTONES, LikeMilestone, VIEW_MILESTONES, ViewMilestone, Badge (+6 more)

### Community 74 - "Features Users: User"
Cohesion: 0.13
Nodes (12): metadata, Page(), SectionBuilderClient(), WidgetsNotice(), verifySession(), AnalyticsRow, CreateUserInput, getUserForSession() (+4 more)

### Community 75 - "App Pricing: Pricing"
Cohesion: 0.16
Nodes (11): gsap, FREE_FEATURES, PREMIUM_FEATURES, PricingClient(), PricingProps, PRODUCTS, Navbar(), NavbarProps (+3 more)

### Community 76 - "Auth New Password: Tsx"
Cohesion: 0.15
Nodes (4): react, NewPasswordClient(), metadata, ActivityImageShapeSettingProps

### Community 77 - "Profile Layouts: Color"
Cohesion: 0.21
Nodes (12): three, AuroraSettings, AuroraColors, ColorBendsEffect(), ColorBendsSettings, DEFAULTS, hexToVec3(), MAX_COLORS (+4 more)

### Community 78 - "Api Widgets: Telegram"
Cohesion: 0.31
Nodes (11): decodeHtmlEntities(), fetchTelegramUserData(), GET(), readHtmlHead(), readOgTag(), POST(), UseTelegramUserReturn, cleanTelegramUsername() (+3 more)

### Community 79 - "Api Widgets: Tik"
Cohesion: 0.29
Nodes (12): BROWSER_HEADERS, CRAWLER_HEADERS, extractLikesFromHtml(), fetchLikesFromCrawler(), fetchTikTokUserData(), GET(), parseCompactStat(), resolveHeartCount() (+4 more)

### Community 80 - "Dashboard Customize: Font"
Cohesion: 0.20
Nodes (10): TapToEnterSectionProps, FONT_OPTIONS, FontGroupSection(), FontGroupSectionProps, fontVariables, NumberDraftInput(), NumberDraftInputProps, DEFAULT_FONT_VAR (+2 more)

### Community 81 - "Components Dashboard: Picker"
Cohesion: 0.15
Nodes (13): AssetsSectionProps, Decoration, DecorationPicker(), DecorationPickerProps, typedDecorations, EffectsPicker(), EffectsPickerProps, ProfileEffect (+5 more)

### Community 82 - "Dashboard Customize: Pinterest"
Cohesion: 0.21
Nodes (10): PinterestBoardCustomization(), PinterestBoardCustomizationProps, PinterestProfileCustomization(), PinterestProfileCustomizationProps, ShowBackgroundOverlaySetting(), ShowBackgroundOverlaySettingProps, ShowPinCountSetting(), ShowPinCountSettingProps (+2 more)

### Community 83 - "Types"
Cohesion: 0.14
Nodes (14): devDependencies, babel-plugin-react-compiler, cross-env, drizzle-kit, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss (+6 more)

### Community 84 - "Lib Auth: Otp"
Cohesion: 0.25
Nodes (11): bcrypt, login(), LoginInput, createOTPToken(), generateOTP(), hashOTP(), isOTPCorrect(), verifyOTPToken() (+3 more)

### Community 85 - "App Register: Tsx"
Cohesion: 0.20
Nodes (7): lucide-react, metadata, Register(), metadata, SignIn(), BackToHome(), SwapForm()

### Community 86 - "Components Effects: Dither"
Cohesion: 0.16
Nodes (8): postprocessing, CustomBadgePromo(), Dither, THEME_WAVE_COLOR, Dither(), DitherProps, RetroEffectImpl, toast

### Community 87 - "Lib Hooks: Twitch"
Cohesion: 0.29
Nodes (9): updateProfileWidgets(), TwitchClient(), TwitchWidget(), TwitchLogoIcon(), TwitchPartnerBadgeIcon(), useTwitchChannel(), UseTwitchChannelReturn, formatNumber() (+1 more)

### Community 88 - "Lib Payments: Razorpay"
Cohesion: 0.29
Nodes (12): POST(), bodySchema, POST(), isCurrency(), authHeader(), createRazorpayOrder(), credentials(), fetchRazorpayOrder() (+4 more)

### Community 89 - "Api Widgets: Spotify"
Cohesion: 0.20
Nodes (12): fetchSpotifyItem(), GET(), getSpotifyAccessToken(), SpotifyAlbumResponse, SpotifyArtistRef, SpotifyArtistResponse, SpotifyImage, SpotifyPlaylistResponse (+4 more)

### Community 90 - "Lib: Valorant"
Cohesion: 0.33
Nodes (10): ValorantPlayerData, ValorantClient(), ValorantWidget(), ValorantFlameIcon(), ValorantUserIcon(), useValorantPlayer(), getAgentIconUrl(), getMapSplashUrl() (+2 more)

### Community 91 - "Profile Widgets: Weather"
Cohesion: 0.29
Nodes (10): SKY_GRADIENTS, WeatherClient(), SKY_GRADIENTS, WeatherWidget(), WeatherConditionIcon(), WeatherConditionMarkerIcon(), WeatherTemperatureIcon(), useWeather() (+2 more)

### Community 92 - "Profile Widgets: You"
Cohesion: 0.30
Nodes (11): YouTubeClient(), YouTubeCalendarIcon(), YouTubeLikesIcon(), YouTubeLogoIcon(), YouTubeSubscribersIcon(), YouTubeVideoIcon(), YouTubeViewsIcon(), YouTubeWidget() (+3 more)

### Community 93 - "Components Dashboard: Upload"
Cohesion: 0.19
Nodes (10): react-dropzone, react-easy-crop, AvatarUploadModal(), AvatarUploadModalProps, MediaCropModal(), MediaCropModalProps, cn(), FileUpload() (+2 more)

### Community 94 - "Dashboard Customize: Row"
Cohesion: 0.27
Nodes (9): AboutSectionData, AboutSectionRow(), AboutSectionRowProps, LinksSectionData, LinksSectionRow(), LinksSectionRowProps, SectionBuilderClientProps, SectionVisibilityButton() (+1 more)

### Community 95 - "Dashboard Customize: Profile"
Cohesion: 0.17
Nodes (10): CARD_OPACITY_MAX, CARD_OPACITY_MIN, CONTENT_WIDTH_MAX, CONTENT_WIDTH_MIN, PresetOption, PRESETS, ProfilePreset, StandardProfileSection() (+2 more)

### Community 96 - "Profile Layouts: Reveal"
Cohesion: 0.24
Nodes (10): countRichText(), ElementProps, HIDDEN, hide(), revealRichText(), RevealState, splitHtml(), Phase (+2 more)

### Community 97 - "Deploy"
Cohesion: 0.23
Nodes (12): Profile Stats Cache Invalidation Flow, Client Live Hydration (ISR 30-day), Core npm Commands, Design System & UI Rules, Preview Panel Sync, Repo Subagents (ui-designer, code-reviewer), iuno.lol Tech Stack (Next.js 15, MySQL/Drizzle, Redis), Atomic Side-Folder Build Swap (+4 more)

### Community 98 - "Lib Payments: Method"
Cohesion: 0.25
Nodes (9): zod, bodySchema, CURRENCIES, Currency, isAllowedMethod(), PAYMENT_METHODS, PaymentMethod, PREMIUM_PLAN (+1 more)

### Community 99 - "Api Widgets: Steam"
Cohesion: 0.33
Nodes (9): animatedItemUrl(), callSteamApi(), EquippedItem, fetchSteamUserData(), GET(), itemPath(), PlayerSummary, resolveSteamId() (+1 more)

### Community 100 - "Profile Layouts: Liquid"
Cohesion: 0.27
Nodes (8): ogl, DEFAULTS, hexToRgb01(), LiquidChromeEffect(), handleMouseMove(), handleTouchMove(), setMouse(), LiquidChromeSettings

### Community 101 - "Profile Widgets: Telegram"
Cohesion: 0.33
Nodes (6): TelegramClient(), OverflowPingPong(), OverflowPingPongProps, TelegramWidget(), TelegramBioIcon(), useTelegramUser()

### Community 102 - "Dashboard Customize: Animated"
Cohesion: 0.27
Nodes (7): AssetsSection(), fileNameOf(), SettingSelect(), AnimatedBackground(), ANIMATED_BACKGROUNDS, animatedBackgroundId, animatedBackgroundUrl()

### Community 103 - "Profile Layouts: Pixel"
Cohesion: 0.24
Nodes (9): createLiquidEffect(), createTouchTexture(), DEFAULTS, PixelBlastEffect(), PixelBlastSettings, PixelBlastVariant, SHAPE_MAP, TouchPoint (+1 more)

### Community 104 - "Profile Layouts: Scramble"
Cohesion: 0.31
Nodes (8): ElementProps, escapeGlyph(), scrambleHtml(), scrambleRichText(), ScrambleState, randomGlyph(), ShuffleDescriptionEffect(), ShuffleDescriptionEffect

### Community 105 - "Components Ui: Glyph"
Cohesion: 0.31
Nodes (9): clamp(), GlyphPortal(), GlyphPortalProps, GlyphPortalStyle, Ink, interior(), Letter, scrollParent() (+1 more)

### Community 106 - "Public: Iuno"
Cohesion: 0.33
Nodes (9): iuno.lol OpenGraph Banner, Dreamy Ethereal Aesthetic, Floral Silhouette Motif, iuno.lol (brand/site), Floating Petals and Leaves, Curved White Light Trails, Social Sharing Preview (OpenGraph), Periwinkle-on-Navy Palette (+1 more)

### Community 107 - "Dashboard Customize: Steam"
Cohesion: 0.28
Nodes (6): SteamBackgroundSetting(), SteamBackgroundSettingProps, SteamToggleSetting(), ToggleSettingProps, SteamCustomization(), SteamCustomizationProps

### Community 108 - "Admin"
Cohesion: 0.39
Nodes (7): jose, config, jwtSecretKey(), middleware(), RESERVED_PATHS, signAdminToken(), verifyAdminToken()

### Community 109 - "Api Auth: User"
Cohesion: 0.50
Nodes (7): addUserToGuild(), exchangeCode(), fetchDiscordUser(), GET(), createSession(), getUserByDiscordId(), upsertDiscordUser()

### Community 110 - "Profile Layouts: Aurora"
Cohesion: 0.32
Nodes (6): AuroraEffect(), NumUniform, resolveStops(), stopsFor(), UniformsMap, AuroraEffect

### Community 111 - "Profile Layouts: Light"
Cohesion: 0.32
Nodes (7): getAnchorAndDir(), hexToRgb(), LightRaysEffect(), Uniforms, Vec2, Vec3, LightRaysEffect

### Community 112 - "Dashboard Customize: Background"
Cohesion: 0.33
Nodes (5): BACKGROUND_EFFECTS, BackgroundEffectSection(), BackgroundEffectSectionProps, EFFECTS_WITH_COLOR, isPremiumBackgroundEffect()

### Community 113 - "Dashboard Customize: Border"
Cohesion: 0.33
Nodes (5): BORDER_EFFECTS, BorderEffectSection(), BorderEffectSectionProps, parseBorderColors(), PREMIUM_BORDER_EFFECTS

### Community 114 - "Profile Layouts: Dark"
Cohesion: 0.29
Nodes (5): DarkVeilEffect(), DarkVeilSettings, DEFAULTS, NumUniform, Vec2Uniform

### Community 115 - "Profile Layouts: Views"
Cohesion: 0.33
Nodes (4): easeOutQuad(), ViewsAnimationStyle, ViewsCounterAnimation(), ViewsCounterAnimationProps

### Community 116 - "Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, seed:test, start

### Community 117 - "Profile Layouts: Sparkle"
Cohesion: 0.33
Nodes (3): Sparkle, WithStyleChildren, SparkleDescriptionEffect

### Community 118 - "Public: Iuno"
Cohesion: 0.50
Nodes (5): iuno.lol Brand Identity, Flat Minimalist Silhouette Design (transparent background), Stylized Five-Petal Hibiscus Flower Motif, iuno.lol Favicon (Blue Hibiscus Flower), Periwinkle / Cornflower Blue Color (brand accent ~#5b6cf5)

### Community 119 - "Profile Layouts: Lockon"
Cohesion: 0.50
Nodes (4): cornerStyle(), LockonDescriptionEffect(), WithStyleChildren, LockonDescriptionEffect

### Community 120 - "Profile Layouts: Sakura"
Cohesion: 0.40
Nodes (3): PETALS, WithStyleChildren, SakuraDescriptionEffect

### Community 121 - "Drizzle"
Cohesion: 0.50
Nodes (3): drizzle-kit, ref_fs, ref_path

### Community 122 - "Eslint"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 123 - "Public: Iuno"
Cohesion: 0.83
Nodes (4): iuno.lol Brand, Stylized Hibiscus Flower Logo Mark, iuno.lol OpenGraph Social Share Image, Periwinkle Blue Accent on Dark Navy

### Community 124 - "Public: Oneko"
Cohesion: 0.67
Nodes (4): UI Easter Egg, Oneko Cursor-Chasing Cat, Oneko Cat Sprite Sheet, Sprite Sheet Frame Animation

## Knowledge Gaps
- **682 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+677 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 857 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Auth New Password: Tsx` to `Dashboard Nav & Session`, `Profile Customize Context`, `Username Effects`, `Comments & Analytics`, `Background Particles`, `Profile Links & Icons`, `Home & Root Layout`, `Metadata & View Tracking`, `Profile Preview & Sections`, `Auth Forms & UI Shell`, `GitHub & TikTok Widgets`, `Background & Banner Settings`, `Overlay Effects & Color Utils`, `Genshin & Roblox Settings`, `Transition & Effect Sections`, `Weather Widget`, `Pinterest & Discord Widgets`, `Card Transitions`, `Style Customization Sections`, `Valorant Rank Settings`, `Click & Cursor Effect Settings`, `Package Manifest`, `Widget Data Hooks`, `Music Player Settings`, `Add Widget & Roblox`, `Card Hover Effects`, `Click Effects & Sounds`, `Feedback & Text Formatting`, `Spotify Widget`, `Badges & Milestones`, `Badge & Presence Data`, `Dashboard Customize: Steam`, `Components Ui: Sidebar`, `Dashboard Uploads: Upload`, `Profile Layouts: Detail`, `Profile Layouts: Border`, `App Checkout: Razorpay`, `Auth New Verification: New`, `Profile Layouts: Description`, `Profile Music: Music`, `Components Ui: Toast`, `Lib: General`, `Profile Layouts: Transition`, `Api Widgets: You`, `Components Ui: Morphing`, `Dashboard Customize: Milestone`, `Features Users: User`, `App Pricing: Pricing`, `Profile Layouts: Color`, `Api Widgets: Telegram`, `Dashboard Customize: Font`, `Components Dashboard: Picker`, `App Register: Tsx`, `Components Effects: Dither`, `Lib Hooks: Twitch`, `Lib: Valorant`, `Profile Widgets: Weather`, `Profile Widgets: You`, `Components Dashboard: Upload`, `Dashboard Customize: Row`, `Dashboard Customize: Profile`, `Profile Layouts: Reveal`, `Profile Layouts: Liquid`, `Profile Widgets: Telegram`, `Dashboard Customize: Animated`, `Profile Layouts: Pixel`, `Profile Layouts: Scramble`, `Components Ui: Glyph`, `Dashboard Customize: Steam`, `Profile Layouts: Aurora`, `Profile Layouts: Light`, `Dashboard Customize: Background`, `Dashboard Customize: Border`, `Profile Layouts: Dark`, `Profile Layouts: Views`, `Profile Layouts: Sparkle`, `Profile Layouts: Lockon`, `Profile Layouts: Sakura`, `Profile Layouts: Flames`, `Profile Layouts: Flip`, `Profile Layouts: Float`, `Profile Layouts: Glitch`, `Profile Layouts: Shimmer`?**
  _High betweenness centrality (0.347) - this node is a cross-community bridge._
- **Why does `next` connect `Dashboard Nav & Session` to `Profile Customize Context`, `App: Not`, `Comments & Analytics`, `Background Particles`, `Next`, `Profile Links & Icons`, `Route Pages & Checkout`, `Api Upload: Sign`, `Widget API Routes`, `Metadata & View Tracking`, `Profile Preview & Sections`, `Auth Forms & UI Shell`, `Music API & Lyrics`, `GitHub & TikTok Widgets`, `Home & Root Layout`, `Overlay Effects & Color Utils`, `Username Effects`, `Weather Widget`, `Pinterest & Discord Widgets`, `Card Transitions`, `Widget API Data Types`, `Style Customization Sections`, `Redis Live Stats Cache`, `Package Manifest`, `Widget Data Hooks`, `Music Player Settings`, `Add Widget & Roblox`, `Card Hover Effects`, `Feedback & Text Formatting`, `Spotify Widget`, `Music Track Caching`, `Discord Bot & Invites`, `File Upload (Catbox)`, `Badges & Milestones`, `Badge & Presence Data`, `Dashboard Customize: Steam`, `Actions: User`, `Components Ui: Sidebar`, `Api Cron: Embed`, `Lib: Rate`, `Dashboard Uploads: Upload`, `Profile Layouts: Border`, `App Checkout: Razorpay`, `Auth New Verification: New`, `Api Cron: Cleanup`, `Lib Payments: Polar`, `Api Widgets: Genshin`, `Profile Layouts: Description`, `Api Widgets: Roblox`, `Lib: General`, `Api Widgets: Discord`, `Server Security: Route`, `Api Widgets: You`, `Components Ui: Morphing`, `Features Users: User`, `App Pricing: Pricing`, `Auth New Password: Tsx`, `Api Widgets: Telegram`, `Api Widgets: Tik`, `Components Dashboard: Picker`, `Lib Auth: Otp`, `App Register: Tsx`, `Components Effects: Dither`, `Lib Hooks: Twitch`, `Lib Payments: Razorpay`, `Api Widgets: Spotify`, `Lib: Valorant`, `Profile Widgets: Weather`, `Profile Widgets: You`, `Dashboard Customize: Row`, `Lib Payments: Method`, `Api Widgets: Steam`, `Profile Widgets: Telegram`, `Dashboard Customize: Animated`, `Admin`, `Api Auth: User`?**
  _High betweenness centrality (0.320) - this node is a cross-community bridge._
- **Why does `getSessionUserId()` connect `Route Pages & Checkout` to `Dashboard Nav & Session`, `Profile Customize Context`, `Comments & Analytics`, `Profile Links & Icons`, `Music API & Lyrics`, `Weather Widget`, `Widget API Data Types`, `Feedback & Text Formatting`, `Music Track Caching`, `Discord Bot & Invites`, `File Upload (Catbox)`, `Api Widgets: Genshin`, `Dashboard Customize: Handle`, `Api Widgets: Roblox`, `Server Security: Route`, `Api Widgets: You`, `Features Users: User`, `Api Widgets: Telegram`, `Api Widgets: Tik`, `Lib Hooks: Twitch`, `Lib Payments: Razorpay`, `Api Widgets: Spotify`, `Lib Payments: Method`, `Api Widgets: Steam`, `Api Auth: User`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _682 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard Nav & Session` be split into smaller, more focused modules?**
  _Cohesion score 0.12476860422065901 - nodes in this community are weakly interconnected._
- **Should `Profile Customize Context` be split into smaller, more focused modules?**
  _Cohesion score 0.068997668997669 - nodes in this community are weakly interconnected._
- **Should `Username Effects` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._