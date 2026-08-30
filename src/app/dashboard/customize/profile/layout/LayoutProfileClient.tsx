"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SectionedProfileSection from "@/components/dashboard/customize/layout/SectionedProfileSection";
import StandardProfileSection, {
  type ProfilePreset,
} from "@/components/dashboard/customize/layout/StandardProfileSection";
import HeaderSection from "@/components/dashboard/customize/layout/HeaderSection";
import ProfileDetailsSection, {
  type DetailPlacementMap,
} from "@/components/dashboard/customize/layout/ProfileDetailsSection";
import {
  type AvatarPlacement,
  type ContentAlignment,
  DEFAULT_DETAILS,
  DEFAULT_FRAME,
  DEFAULT_PRESET,
  type DetailKey,
  type DetailPlacement,
  getDetailDefaults,
  getFrameDefaults,
  normalizeAlignment,
  normalizeAvatarPlacement,
  normalizePlacement,
} from "@/components/profile/layouts/ProfilePresetLayout";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { useCustomizeProfile } from "../CustomizeProfileProvider";
import { type FullUser } from "@/lib/features/users/db";

const DETAIL_FIELDS = {
  joinDate: ["joinDatePlacement", DEFAULT_DETAILS.joinDate],
  location: ["locationPlacement", DEFAULT_DETAILS.location],
  occupation: ["occupationPlacement", DEFAULT_DETAILS.occupation],
  uid: ["uidPlacement", DEFAULT_DETAILS.uid],
  views: ["viewsPlacement", DEFAULT_DETAILS.views],
  feedback: ["feedbackPlacement", DEFAULT_DETAILS.feedback],
} as const;

export default function LayoutProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const router = useRouter();

  const initialStructure = user?.profileStructure ?? "standard";
  const structure = overrides.profileStructure ?? initialStructure;
  const sectioned = structure === "sectioned";
  const setSectioned = (val: boolean) => {
    const next = val ? "sectioned" : "standard";
    updateOverrides({ profileStructure: next === initialStructure ? undefined : next });
  };

  const initialPreset = (user?.profilePreset ?? DEFAULT_PRESET) as ProfilePreset;

  const preset = (overrides.profilePreset ?? initialPreset) as ProfilePreset;

  const setPreset = (val: ProfilePreset) => {
    const defaults = getDetailDefaults(val);
    const frame = getFrameDefaults(val);
    updateOverrides({
      profilePreset: val === initialPreset ? undefined : val,
      contentAlignment: frame.contentAlignment,
      avatarPlacement: frame.avatarPlacement,
      contentWidth: frame.contentWidth,
      wrapInCard: frame.wrapInCard,
      ...Object.fromEntries(
        Object.entries(DETAIL_FIELDS).map(([key, [field]]) => [
          field,
          defaults[key as DetailKey],
        ])
      ),
    });
  };

  const initialWrapInCard = user?.wrapInCard ?? DEFAULT_FRAME.wrapInCard;

  const wrapInCard = overrides.wrapInCard ?? initialWrapInCard;
  const setWrapInCard = (val: boolean) =>
    updateOverrides({ wrapInCard: val === initialWrapInCard ? undefined : val });

  const initialContentWidth = user?.contentWidth ?? DEFAULT_FRAME.contentWidth;

  const contentWidth = overrides.contentWidth ?? initialContentWidth;
  const setContentWidth = (val: number) =>
    updateOverrides({ contentWidth: val === initialContentWidth ? undefined : val });

  const initialAlignment = normalizeAlignment(user?.contentAlignment);
  const alignment = normalizeAlignment(overrides.contentAlignment, initialAlignment);
  const setAlignment = (val: ContentAlignment) =>
    updateOverrides({ contentAlignment: val === initialAlignment ? undefined : val });

  const initialAvatarPlacement = normalizeAvatarPlacement(user?.avatarPlacement);
  const avatarPlacement = normalizeAvatarPlacement(
    overrides.avatarPlacement,
    initialAvatarPlacement
  );
  const setAvatarPlacement = (val: AvatarPlacement) =>
    updateOverrides({ avatarPlacement: val === initialAvatarPlacement ? undefined : val });

  const placements = Object.fromEntries(
    Object.entries(DETAIL_FIELDS).map(([key, [field, fallback]]) => [
      key,
      normalizePlacement(
        (overrides[field] as string | undefined) ?? (user?.[field] as string | undefined),
        fallback
      ),
    ])
  ) as DetailPlacementMap;

  const setPlacement = (key: DetailKey, value: DetailPlacement) => {
    const [field, fallback] = DETAIL_FIELDS[key];
    const initial = normalizePlacement(user?.[field] as string | undefined, fallback);
    updateOverrides({ [field]: value === initial ? undefined : value });
  };

  const presetDefaults = getDetailDefaults(preset);
  const presetFrame = getFrameDefaults(preset);
  const isCustom =
    (Object.keys(presetDefaults) as DetailKey[]).some(
      (key) => placements[key] !== presetDefaults[key]
    ) ||
    alignment !== presetFrame.contentAlignment ||
    avatarPlacement !== presetFrame.avatarPlacement ||
    contentWidth !== presetFrame.contentWidth ||
    wrapInCard !== presetFrame.wrapInCard;

  const hasChanges = Object.keys(overrides).length > 0;

  return (
    <React.Fragment>
      <div
        className="w-full pb-10 flex flex-col gap-8"
        style={{ paddingRight: "calc(var(--preview-width, 380px) + 2rem)" }}
      >
        <SectionedProfileSection enabled={sectioned} setEnabled={setSectioned} />

        <StandardProfileSection
          preset={preset}
          setPreset={setPreset}
          wrapInCard={wrapInCard}
          setWrapInCard={setWrapInCard}
          contentWidth={contentWidth}
          setContentWidth={setContentWidth}
          isCustom={isCustom}
          alignment={alignment}
          setAlignment={setAlignment}
        />
        <HeaderSection avatarPlacement={avatarPlacement} setAvatarPlacement={setAvatarPlacement} />

        <ProfileDetailsSection placements={placements} setPlacement={setPlacement} />
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{ ...overrides, profileStructure: structure, profilePreset: preset,
          wrapInCard,
          contentWidth,
          contentAlignment: alignment,
          avatarPlacement,
          joinDatePlacement: placements.joinDate,
          locationPlacement: placements.location,
          occupationPlacement: placements.occupation,
          uidPlacement: placements.uid,
          viewsPlacement: placements.views,
          feedbackPlacement: placements.feedback,
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateLayoutProfile({
              username: user?.username || "",
              profileStructure: structure,
              profilePreset: preset,
              wrapInCard,
              contentWidth,
              contentAlignment: alignment,
              avatarPlacement,
              joinDatePlacement: placements.joinDate,
              locationPlacement: placements.location,
              occupationPlacement: placements.occupation,
              uidPlacement: placements.uid,
              viewsPlacement: placements.views,
              feedbackPlacement: placements.feedback,
            });
            toast.success("Profile Saved Sucessfully");
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save layout");
          }
        }}
        onRevert={clearOverrides}
      />
    </React.Fragment>
  );
}
