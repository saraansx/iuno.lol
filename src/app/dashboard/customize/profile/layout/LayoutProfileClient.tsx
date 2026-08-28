"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import ProfileStructureSection, {
  type ProfileStructure,
} from "@/components/dashboard/customize/layout/ProfileStructureSection";
import StandardProfileSection, {
  type ProfilePreset,
} from "@/components/dashboard/customize/layout/StandardProfileSection";
import HeaderSection from "@/components/dashboard/customize/layout/HeaderSection";
import ProfileDetailsSection from "@/components/dashboard/customize/layout/ProfileDetailsSection";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateLayoutProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { useCustomizeProfile } from "../CustomizeProfileProvider";
import { type FullUser } from "@/lib/features/users/db";

export default function LayoutProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const router = useRouter();

  const initialStructure = (user?.profileStructure ?? "standard") as ProfileStructure;

  const structure = (overrides.profileStructure ?? initialStructure) as ProfileStructure;
  const setStructure = (val: ProfileStructure) =>
    updateOverrides({ profileStructure: val === initialStructure ? undefined : val });

  const initialPreset = (user?.profilePreset ?? "classic") as ProfilePreset;

  const preset = (overrides.profilePreset ?? initialPreset) as ProfilePreset;
  const setPreset = (val: ProfilePreset) =>
    updateOverrides({ profilePreset: val === initialPreset ? undefined : val });

  const initialWrapInCard = user?.wrapInCard ?? true;

  const wrapInCard = overrides.wrapInCard ?? initialWrapInCard;
  const setWrapInCard = (val: boolean) =>
    updateOverrides({ wrapInCard: val === initialWrapInCard ? undefined : val });

  const initialContentWidth = user?.contentWidth ?? 764;

  const contentWidth = overrides.contentWidth ?? initialContentWidth;
  const setContentWidth = (val: number) =>
    updateOverrides({ contentWidth: val === initialContentWidth ? undefined : val });

  const hasChanges = Object.keys(overrides).length > 0;

  return (
    <React.Fragment>
      <div
        className="w-full pb-10 flex flex-col gap-8"
        style={{ paddingRight: "calc(var(--preview-width, 380px) + 2rem)" }}
      >
        <ProfileStructureSection structure={structure} setStructure={setStructure} />

        {/* Only the selected structure's settings are shown, so the page never
            offers controls that do not apply to the chosen layout. */}
        {structure === "standard" && (
          <>
            <StandardProfileSection
              preset={preset}
              setPreset={setPreset}
              wrapInCard={wrapInCard}
              setWrapInCard={setWrapInCard}
              contentWidth={contentWidth}
              setContentWidth={setContentWidth}
            />
            <HeaderSection />
            <ProfileDetailsSection />
          </>
        )}
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{ ...overrides, profileStructure: structure, profilePreset: preset, wrapInCard, contentWidth }}
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
