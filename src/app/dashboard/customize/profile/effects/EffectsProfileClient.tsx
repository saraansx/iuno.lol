"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateEffectsProfile } from "@/actions/profile";
import { type FullUser } from "@/lib/features/users/db";
import EffectsCustomization from "@/components/dashboard/customize/effects/EffectsCustomization";
import { toast } from "@/components/ui/toast";
import { useCustomizeProfile } from '../CustomizeProfileProvider';

export default function EffectsProfileClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();

  const initialBackgroundEffect = user?.backgroundEffect ?? "none";
  const initialBackgroundEffectIntensity = user?.backgroundEffectIntensity ?? 50;
  const initialBackgroundEffectColor = user?.backgroundEffectColor ?? "#ffffff";
  const backgroundEffect = overrides.backgroundEffect ?? initialBackgroundEffect;
  const setBackgroundEffect = (val: string) => updateOverrides({ backgroundEffect: val === initialBackgroundEffect ? undefined : val });
  const backgroundEffectIntensity = overrides.backgroundEffectIntensity ?? initialBackgroundEffectIntensity;
  const setBackgroundEffectIntensity = (val: number) => updateOverrides({ backgroundEffectIntensity: val === initialBackgroundEffectIntensity ? undefined : val });
  const backgroundEffectColor = overrides.backgroundEffectColor ?? initialBackgroundEffectColor;
  const setBackgroundEffectColor = (val: string) => updateOverrides({ backgroundEffectColor: val === initialBackgroundEffectColor ? undefined : val });
  const initialBackgroundEffectAboveContainer = user?.backgroundEffectAboveContainer ?? false;
  const backgroundEffectAboveContainer = overrides.backgroundEffectAboveContainer ?? initialBackgroundEffectAboveContainer;
  const setBackgroundEffectAboveContainer = (val: boolean) => updateOverrides({ backgroundEffectAboveContainer: val === initialBackgroundEffectAboveContainer ? undefined : val });

  const hasChanges = Object.keys(overrides).length > 0;

  const handleRevert = () => {
    clearOverrides();
  };

  return (
    <>
      {/* Settings Content */}
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <EffectsCustomization
          backgroundEffect={backgroundEffect}
          setBackgroundEffect={setBackgroundEffect}
          backgroundEffectIntensity={backgroundEffectIntensity}
          setBackgroundEffectIntensity={setBackgroundEffectIntensity}
          backgroundEffectColor={backgroundEffectColor}
          setBackgroundEffectColor={setBackgroundEffectColor}
          backgroundEffectAboveContainer={backgroundEffectAboveContainer}
          setBackgroundEffectAboveContainer={setBackgroundEffectAboveContainer}
        />
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          backgroundEffect,
          backgroundEffectIntensity,
          backgroundEffectColor,
          backgroundEffectAboveContainer,
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateEffectsProfile({
              username: user?.username || "",
              ...overrides
            });
            toast.success("Profile Saved Sucessfully");
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error("Failed to save effects");
          }
        }}
        onRevert={handleRevert}
      />
    </>
  );
}
