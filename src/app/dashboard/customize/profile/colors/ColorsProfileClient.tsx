"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateColorsProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";
import ColorCustomization from "@/components/dashboard/customize/colors/ColorCustomization";

import { useCustomizeProfile } from '../CustomizeProfileProvider';

export default function ColorsProfileClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();

  const initialUsernameColor = user?.usernameColor ?? "#ffffff";
  const initialBioColor = user?.bioColor ?? "#ffffff";
  const initialOtherColor = user?.otherColor ?? "#ffffff";
  const initialHighlightColor = user?.highlightColor ?? "#ffffff";
  const initialPageBgColor = user?.pageBgColor ?? "#050505";

  const usernameColor = overrides.usernameColor ?? initialUsernameColor;
  const setUsernameColor = (val: string) => updateOverrides({ usernameColor: val === initialUsernameColor ? undefined : val });
  const bioColor = overrides.bioColor ?? initialBioColor;
  const setBioColor = (val: string) => updateOverrides({ bioColor: val === initialBioColor ? undefined : val });
  const otherColor = overrides.otherColor ?? initialOtherColor;
  const setOtherColor = (val: string) => updateOverrides({ otherColor: val === initialOtherColor ? undefined : val });
  const highlightColor = overrides.highlightColor ?? initialHighlightColor;
  const setHighlightColor = (val: string) => updateOverrides({ highlightColor: val === initialHighlightColor ? undefined : val });
  const pageBgColor = overrides.pageBgColor ?? initialPageBgColor;
  const setPageBgColor = (val: string) => updateOverrides({ pageBgColor: val === initialPageBgColor ? undefined : val });

  const hasChanges = Object.keys(overrides).length > 0;

  const handleRevert = () => {
    clearOverrides();
  };

  return (
    <>
      {/* Settings Content */}
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <ColorCustomization
          usernameColor={usernameColor}
          setUsernameColor={setUsernameColor}
          bioColor={bioColor}
          setBioColor={setBioColor}
          otherColor={otherColor}
          setOtherColor={setOtherColor}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          pageBgColor={pageBgColor}
          setPageBgColor={setPageBgColor}
        />
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          usernameColor,
          bioColor,
          otherColor,
          highlightColor,
          pageBgColor,
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateColorsProfile({
              username: user?.username || "",
              ...overrides
            });
            toast.success("Profile Saved Sucessfully");
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error("Failed to save colors");
          }
        }}
        onRevert={handleRevert}
      />
    </>
  );
}
