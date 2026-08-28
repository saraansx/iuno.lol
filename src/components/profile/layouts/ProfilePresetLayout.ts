/**
 * Layout rules for the standard card's arrangement presets.
 *
 * Kept out of Layout1 so each preset's rules live in one readable place rather than
 * as scattered ternaries inside a 1300-line component, and so adding a preset means
 * editing this table instead of hunting through the layout. Mirrors PROFILE_PRESETS
 * in `src/actions/profile.ts` and the picker in StandardProfileSection.
 */

export type ProfilePresetId = "split" | "floating" | "modern" | "classic";

export interface ProfilePresetLayout {
  /**
   * Where the views / join-date badge sits.
   *
   * `card` pins it to the card's own bottom-left corner, which is where it has
   * always been. `page` lifts it out to the bottom of the viewport, so it reads as
   * page furniture rather than part of the card.
   */
  badgePlacement: "card" | "page";
}

const CLASSIC: ProfilePresetLayout = { badgePlacement: "card" };

const PRESET_LAYOUTS: Record<ProfilePresetId, ProfilePresetLayout> = {
  classic: CLASSIC,
  split: CLASSIC,
  modern: CLASSIC,
  // Floating is the only preset that currently moves anything; the others are
  // selectable but still render the classic arrangement.
  floating: { badgePlacement: "page" },
};

/** Falls back to classic for an unknown id, so a stale row still renders. */
export function getPresetLayout(preset: string | undefined): ProfilePresetLayout {
  return PRESET_LAYOUTS[preset as ProfilePresetId] ?? CLASSIC;
}

/** Wrapper classes for the views / join-date badge in each placement. */
export const BADGE_CLASSES: Record<"card" | "cardRight" | "page" | "pageRight", string> = {
  card: "absolute bottom-3.5 left-4.5 flex items-center gap-2 z-[70] select-none",
  // Feedback's corner inside the card, opposite the views/join-date group. Matches
  // where the buttons sat before they became placeable.
  cardRight: "absolute bottom-3.5 right-4.5 flex items-center gap-2 z-[70] select-none",
  // `absolute`, not `fixed`. Layout1's outer wrapper is `relative`, so this anchors
  // to the profile page. `fixed` anchors to the viewport instead, which pinned the
  // badge to the browser's own corner — escaping the dashboard's preview panel and
  // rendering over the settings UI.
  page: "absolute bottom-4 left-5 flex items-center gap-2 z-[70] select-none",
  // Feedback sits opposite the views/join-date group rather than beside it, so the
  // two page-level groups do not collide in the same corner.
  pageRight: "absolute bottom-4 right-5 flex items-center gap-2 z-[70] select-none",
};

/**
 * Where a single profile detail renders.
 *
 * `beside` is the inline row under the username that location and occupation share.
 * `top` sits above the username, `bottom-profile` under the card's content, and
 * `bottom-page` pins to the viewport corner. `hidden` renders nothing.
 */
export type DetailPlacement =
  | "top"
  | "beside"
  | "bottom-profile"
  | "bottom-page"
  | "hidden";

export const DETAIL_PLACEMENTS: DetailPlacement[] = [
  "top",
  "beside",
  "bottom-profile",
  "bottom-page",
  "hidden",
];

/** The details that can be placed. */
export type DetailKey =
  | "joinDate"
  | "location"
  | "occupation"
  | "uid"
  | "views"
  | "feedback";

/** Rejects anything not in the set, falling back to the detail's own default. */
export function normalizePlacement(
  value: string | null | undefined,
  fallback: DetailPlacement
): DetailPlacement {
  return DETAIL_PLACEMENTS.includes(value as DetailPlacement)
    ? (value as DetailPlacement)
    : fallback;
}

/**
 * Where each detail sits by default for a given preset.
 *
 * Picking a preset writes these into the user's own placements, so a preset is a
 * starting arrangement rather than a permanent mode — every row stays editable
 * afterwards from the Profile details section.
 */
export type DetailDefaults = Record<DetailKey, DetailPlacement>;

/** The arrangement these details had before the setting existed. */
export const CLASSIC_DETAIL_DEFAULTS: DetailDefaults = {
  joinDate: "bottom-profile",
  location: "beside",
  occupation: "beside",
  uid: "hidden",
  views: "bottom-profile",
  feedback: "bottom-profile",
};

const PRESET_DETAIL_DEFAULTS: Record<ProfilePresetId, DetailDefaults> = {
  classic: CLASSIC_DETAIL_DEFAULTS,
  split: {
    joinDate: "hidden",
    location: "beside",
    occupation: "beside",
    uid: "hidden",
    views: "bottom-profile",
    feedback: "bottom-profile",
  },
  modern: CLASSIC_DETAIL_DEFAULTS,
  // Floating pushes the counters out to the page edges and drops the two details
  // that would crowd the centred column.
  floating: {
    joinDate: "hidden",
    location: "beside",
    occupation: "beside",
    uid: "hidden",
    views: "bottom-page",
    feedback: "bottom-page",
  },
};

export function getDetailDefaults(preset: string | undefined): DetailDefaults {
  return PRESET_DETAIL_DEFAULTS[preset as ProfilePresetId] ?? CLASSIC_DETAIL_DEFAULTS;
}

/** How the card's content is aligned. */
export type ContentAlignment = "left" | "center";

/** Where the avatar sits relative to the name. */
export type AvatarPlacement = "top" | "left" | "right" | "floating";

const CONTENT_ALIGNMENTS: ContentAlignment[] = ["left", "center"];
const AVATAR_PLACEMENTS: AvatarPlacement[] = ["top", "left", "right", "floating"];

export function normalizeAlignment(
  value: string | null | undefined,
  fallback: ContentAlignment = "center"
): ContentAlignment {
  return CONTENT_ALIGNMENTS.includes(value as ContentAlignment)
    ? (value as ContentAlignment)
    : fallback;
}

export function normalizeAvatarPlacement(
  value: string | null | undefined,
  fallback: AvatarPlacement = "floating"
): AvatarPlacement {
  return AVATAR_PLACEMENTS.includes(value as AvatarPlacement)
    ? (value as AvatarPlacement)
    : fallback;
}

/**
 * The alignment and avatar position each preset starts from. Applied alongside the
 * detail defaults when a preset is picked, and both stay editable afterwards.
 */
export const PRESET_FRAME_DEFAULTS: Record<
  ProfilePresetId,
  {
    contentAlignment: ContentAlignment;
    avatarPlacement: AvatarPlacement;
    contentWidth: number;
  }
> = {
  // 764 is the width the card was originally built at.
  classic: { contentAlignment: "center", avatarPlacement: "top", contentWidth: 764 },
  // Split puts the avatar on the right of the header, with the name and details
  // filling the space to its left.
  split: { contentAlignment: "left", avatarPlacement: "right", contentWidth: 720 },
  modern: { contentAlignment: "left", avatarPlacement: "top", contentWidth: 764 },
  // Floating centres everything, lets the avatar overlap the card edge, and uses the
  // narrowest allowed width so the centred column reads as a single tall card.
  floating: { contentAlignment: "center", avatarPlacement: "floating", contentWidth: 480 },
};

export function getFrameDefaults(preset: string | undefined) {
  return PRESET_FRAME_DEFAULTS[preset as ProfilePresetId] ?? PRESET_FRAME_DEFAULTS.classic;
}
