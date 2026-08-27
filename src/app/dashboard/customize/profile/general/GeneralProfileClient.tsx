"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateGeneralProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

import AssetsSection from "@/components/dashboard/customize/general/AssetsSection";
import GeneralInfoSection from "@/components/dashboard/customize/general/GeneralInfoSection";
import AvatarUploadModal from "@/components/dashboard/AvatarUploadModal";
import BannerUploadModal from "@/components/dashboard/BannerUploadModal";
import DecorationPicker, { type Decoration } from "@/components/dashboard/DecorationPicker";
import EffectsPicker from "@/components/dashboard/EffectsPicker";
import { isVideoUrl } from "@/lib/utils/media";
import decorations from "@/Deco.json";
import effects from "@/effects.json";

import { type FullUser } from "@/lib/features/users/db";

import { useCustomizeProfile } from '../CustomizeProfileProvider';
import SaveBar from "@/components/dashboard/SaveBar";

export default function GeneralProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear, pendingFiles, setPendingFile, clearPendingFiles } = useCustomizeProfile();
  const router = useRouter();
  const initialDisplayName = user?.displayName ?? "";
  const initialLocation = user?.location ?? "";
  const initialOccupation = user?.occupation ?? "";
  const initialBio = user?.bio ?? "";
  const initialBioAlign = (user?.bioAlign ?? "center") as "left" | "center" | "right";
  const initialAvatarUrl = user?.avatarUrl ?? "";
  const initialAvatarShape = (user?.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "rounded";
  const initialDecorationUrl = user?.avatarDecorationUrl ?? null;
  const initialDecorationHue = user?.avatarDecorationHue ?? 0;
  const initialEffectUrl = user?.profileEffectUrl ?? null;
  const initialEffectHue = user?.profileEffectHue ?? 0;
  const initialBannerImageUrl = user?.bannerImageUrl ?? "";
  const initialBannerBlend = user?.bannerBlend ?? false;
  const initialBannerBackgroundUrl = user?.bannerBackgroundUrl ?? "";
  const displayName = overrides.displayName ?? initialDisplayName;
  const setDisplayName = (val: string) => updateOverrides({ displayName: val === initialDisplayName ? undefined : val });
  const location = overrides.location ?? initialLocation;
  const setLocation = (val: string) => updateOverrides({ location: val === initialLocation ? undefined : val });
  const occupation = overrides.occupation ?? initialOccupation;
  const setOccupation = (val: string) => updateOverrides({ occupation: val === initialOccupation ? undefined : val });
  const bio = overrides.bio ?? initialBio;
  const setBio = (val: string) => updateOverrides({ bio: val === initialBio ? undefined : val });
  const bioAlign = (overrides.bioAlign ?? initialBioAlign) as "left" | "center" | "right";
  const setBioAlign = (val: "left" | "center" | "right") => updateOverrides({ bioAlign: val === initialBioAlign ? undefined : val });
  const avatarUrl = overrides.avatarUrl ?? initialAvatarUrl;
  const setAvatarUrl = (val: string) => updateOverrides({ avatarUrl: val === initialAvatarUrl ? undefined : val });
  const avatarShape = overrides.avatarShape ?? initialAvatarShape;
  const setAvatarShape = (val: "square" | "soft" | "rounded" | "circle") => updateOverrides({ avatarShape: val === initialAvatarShape ? undefined : val });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const bannerImageUrl = overrides.bannerImageUrl ?? initialBannerImageUrl;
  const setBannerImageUrl = (val: string) => updateOverrides({ bannerImageUrl: val === initialBannerImageUrl ? undefined : val });
  const bannerBlend = overrides.bannerBlend !== undefined ? Boolean(overrides.bannerBlend) : Boolean(initialBannerBlend);
  const setBannerBlend = (val: boolean) => updateOverrides({ bannerBlend: val === initialBannerBlend ? undefined : val });
  const bannerBackgroundUrl = overrides.bannerBackgroundUrl ?? initialBannerBackgroundUrl;
  const setBannerBackgroundUrl = (val: string) => updateOverrides({ bannerBackgroundUrl: val === initialBannerBackgroundUrl ? undefined : val });
  const [bannerImageModalOpen, setBannerImageModalOpen] = useState(false);
  const [bannerBackgroundModalOpen, setBannerBackgroundModalOpen] = useState(false);
  const [decorationPickerOpen, setDecorationPickerOpen] = useState(false);
  const [effectsPickerOpen, setEffectsPickerOpen] = useState(false);

  const avatarDecorationUrl = overrides.avatarDecorationUrl !== undefined ? overrides.avatarDecorationUrl : initialDecorationUrl;
  const selectedDecoration = avatarDecorationUrl
    ? {
        id: (decorations as Decoration[]).find(d => d.url === avatarDecorationUrl)?.id || "custom",
        name: (decorations as Decoration[]).find(d => d.url === avatarDecorationUrl)?.name || "Custom Decoration",
        url: avatarDecorationUrl
      } as Decoration
    : null;
  const setSelectedDecoration = (val: Decoration | null) => {
    const newUrl = val ? val.url : null;
    const isSame = newUrl === initialDecorationUrl;
    updateOverrides({ avatarDecorationUrl: isSame ? undefined : newUrl });
  };
  const decorationHue = overrides.avatarDecorationHue ?? initialDecorationHue ?? 0;
  const setDecorationHue = (val: number) => {
    updateOverrides({ avatarDecorationHue: val === initialDecorationHue ? undefined : val });
  };


  const profileEffectUrl = overrides.profileEffectUrl !== undefined ? overrides.profileEffectUrl : initialEffectUrl;
  const selectedEffect = profileEffectUrl
    ? {
        id: "custom",
        name: (effects as { sku_id: string, name: string }[]).find(e => e.sku_id === profileEffectUrl.split("effect:")[1])?.name || "Custom Effect",
        url: profileEffectUrl
      } as Decoration
    : null;
  const setSelectedEffect = (val: Decoration | null) => {
    const newUrl = val ? val.url : null;
    const isSame = newUrl === initialEffectUrl;
    updateOverrides({ profileEffectUrl: isSame ? undefined : newUrl });
  };
  const effectHue = overrides.profileEffectHue ?? initialEffectHue ?? 0;
  const setEffectHue = (val: number) => {
    updateOverrides({ profileEffectHue: val === initialEffectHue ? undefined : val });
  };



  return (
    <>
      <div
        className="w-full pb-10 flex flex-col gap-6"
        style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}
      >
        <AssetsSection
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          avatarShape={avatarShape}
          setAvatarShape={setAvatarShape}
          selectedDecoration={selectedDecoration}
          decorationHue={decorationHue}
          selectedEffect={selectedEffect}
          bannerImageUrl={bannerImageUrl}
          setBannerImageUrl={setBannerImageUrl}
          bannerBlend={bannerBlend}
          setBannerBlend={setBannerBlend}
          bannerBackgroundUrl={bannerBackgroundUrl}
          setBannerBackgroundUrl={setBannerBackgroundUrl}
          setAvatarModalOpen={setAvatarModalOpen}
          setDecorationPickerOpen={setDecorationPickerOpen}
          setEffectsPickerOpen={setEffectsPickerOpen}
          setBannerImageModalOpen={setBannerImageModalOpen}
          setBannerBackgroundModalOpen={setBannerBackgroundModalOpen}
          isVideoUrl={isVideoUrl}
        />

        <GeneralInfoSection
          displayName={displayName}
          setDisplayName={setDisplayName}
          location={location}
          setLocation={setLocation}
          occupation={occupation}
          setOccupation={setOccupation}
          bio={bio}
          setBio={setBio}
          bioAlign={bioAlign}
          setBioAlign={setBioAlign}
        />
      </div>


      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onApply={(url, rawFile) => {
          setAvatarUrl(url);
          if (rawFile) setPendingFile("avatar", rawFile);
        }}
      />

      <BannerUploadModal
        open={bannerImageModalOpen}
        onClose={() => setBannerImageModalOpen(false)}
        onApply={(url, rawFile) => {
          setBannerImageUrl(url);
          if (rawFile) setPendingFile("banner", rawFile);
        }}
        type="image"
      />

      <BannerUploadModal
        open={bannerBackgroundModalOpen}
        onClose={() => setBannerBackgroundModalOpen(false)}
        onApply={(url, rawFile) => {
          setBannerBackgroundUrl(url);
          if (rawFile) setPendingFile("background", rawFile);
        }}
        type="background"
      />

      <DecorationPicker
        open={decorationPickerOpen}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedDecoration={selectedDecoration}
        decorationHue={decorationHue}
        onClose={() => setDecorationPickerOpen(false)}
        onSelectDecoration={setSelectedDecoration}
        onDecorationHueChange={setDecorationHue}
      />


      <EffectsPicker
        open={effectsPickerOpen}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedEffect={selectedEffect}
        effectHue={effectHue}
        onClose={() => setEffectsPickerOpen(false)}
        onSelectEffect={setSelectedEffect}
        onEffectHueChange={setEffectHue}
      />



      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          displayName,
          bio,
          bioAlign,
          location,
          occupation,
          avatarUrl,
          avatarShape,
          bannerImageUrl,
          bannerBlend,
          bannerBackgroundUrl,
        }}
      />

      <SaveBar
        show={Object.keys(overrides).length > 0}
        onSave={async () => {
          try {
            const finalOverrides = { ...overrides };

            const uploadPendingFile = async (file: File, type: "avatar" | "background" | "banner"): Promise<string> => {
              const formData = new FormData();
              formData.append("reqtype", "fileupload");
              formData.append("fileToUpload", file);
              formData.append("assetType", type);
              
              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });
              
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Failed to upload ${type}`);
              }
              const data = await res.json();
              return data.url;
            };

            if (pendingFiles.avatar) {
              finalOverrides.avatarUrl = await uploadPendingFile(pendingFiles.avatar, "avatar");
            }
            if (pendingFiles.banner) {
              finalOverrides.bannerImageUrl = await uploadPendingFile(pendingFiles.banner, "banner");
            }
            if (pendingFiles.background) {
              finalOverrides.bannerBackgroundUrl = await uploadPendingFile(pendingFiles.background, "background");
            }

            await updateGeneralProfile({
              username: user?.username || "",
              ...(finalOverrides as Omit<Parameters<typeof updateGeneralProfile>[0], "username">)
            });
            toast.success("Profile Saved Sucessfully");
            clearPendingFiles();
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save profile");
          }
        }}
        onRevert={() => {
          clearOverrides();
          clearPendingFiles();
        }}
      />
    </>
  );
}
