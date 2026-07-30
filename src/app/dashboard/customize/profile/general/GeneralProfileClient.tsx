"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateGeneralProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

import AssetsSection from "@/components/dashboard/customize/general/AssetsSection";
import GeneralInfoSection from "@/components/dashboard/customize/general/GeneralInfoSection";
import AvatarUploadModal from "@/components/dashboard/AvatarUploadModal";
import BannerUploadModal from "@/components/dashboard/BannerUploadModal";
import DecorationPicker, { decorationCount, type Decoration } from "@/components/dashboard/DecorationPicker";
import FramesPicker from "@/components/dashboard/FramesPicker";
import { isVideoUrl } from "@/lib/utils/media";
import decorations from "@/Deco.json";
import frames from "@/Frames.json";

import { type FullUser } from "@/lib/features/users/db";

import { useCustomizeProfile } from '../CustomizeProfileProvider';
import SaveBar from "@/components/dashboard/SaveBar";

export default function GeneralProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const router = useRouter();
  const initialDisplayName = user?.displayName ?? "";
  const initialLocation = user?.location ?? "";
  const initialOccupation = user?.occupation ?? "";
  const initialBio = user?.bio ?? "";
  const initialAvatarUrl = user?.avatarUrl ?? "";
  const initialAvatarShape = (user?.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "rounded";
  const initialDecorationUrl = user?.avatarDecorationUrl ?? null;
  const initialDecorationHue = user?.avatarDecorationHue ?? 0;
  const initialFrameUrl = user?.profileFrameUrl ?? null;
  const initialFrameHue = user?.profileFrameHue ?? 0;
  const initialBannerImageUrl = user?.bannerImageUrl ?? "";
  const initialBannerBackgroundUrl = user?.bannerBackgroundUrl ?? "";
  const initialProfileBgColor = user?.profileBgColor ?? "#050505";
  const initialProfileBgOpacity = user?.profileBgOpacity ?? 100;
  const initialProfileShadowColor = user?.profileShadowColor ?? "#000000";
  const initialProfileShadowOpacity = user?.profileShadowOpacity ?? 0;
  const initialProfileOpacity = user?.profileOpacity ?? 100;

  const displayName = overrides.displayName ?? initialDisplayName;
  const setDisplayName = (val: any) => updateOverrides({ displayName: val === initialDisplayName ? undefined : val });
  const location = overrides.location ?? initialLocation;
  const setLocation = (val: any) => updateOverrides({ location: val === initialLocation ? undefined : val });
  const occupation = overrides.occupation ?? initialOccupation;
  const setOccupation = (val: any) => updateOverrides({ occupation: val === initialOccupation ? undefined : val });
  const bio = overrides.bio ?? initialBio;
  const setBio = (val: any) => updateOverrides({ bio: val === initialBio ? undefined : val });
  const avatarUrl = overrides.avatarUrl ?? initialAvatarUrl;
  const setAvatarUrl = (val: any) => updateOverrides({ avatarUrl: val === initialAvatarUrl ? undefined : val });
  const avatarShape = overrides.avatarShape ?? initialAvatarShape;
  const setAvatarShape = (val: any) => updateOverrides({ avatarShape: val === initialAvatarShape ? undefined : val });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const bannerImageUrl = overrides.bannerImageUrl ?? initialBannerImageUrl;
  const setBannerImageUrl = (val: any) => updateOverrides({ bannerImageUrl: val === initialBannerImageUrl ? undefined : val });
  const bannerBackgroundUrl = overrides.bannerBackgroundUrl ?? initialBannerBackgroundUrl;
  const setBannerBackgroundUrl = (val: any) => updateOverrides({ bannerBackgroundUrl: val === initialBannerBackgroundUrl ? undefined : val });
  const [bannerImageModalOpen, setBannerImageModalOpen] = useState(false);
  const [bannerBackgroundModalOpen, setBannerBackgroundModalOpen] = useState(false);
  const [decorationPickerOpen, setDecorationPickerOpen] = useState(false);
  const [framesPickerOpen, setFramesPickerOpen] = useState(false);

  const initialDecoration = initialDecorationUrl
    ? { 
        id: (decorations as Decoration[]).find(d => d.url === initialDecorationUrl)?.id || "custom", 
        name: (decorations as Decoration[]).find(d => d.url === initialDecorationUrl)?.name || "Custom Decoration", 
        url: initialDecorationUrl 
      } as Decoration
    : null;

  const selectedDecoration = overrides.selectedDecoration !== undefined ? overrides.selectedDecoration : initialDecoration;
  const setSelectedDecoration = (val: any) => {
    const isSame = val ? val.url === initialDecorationUrl : !initialDecorationUrl;
    updateOverrides({ selectedDecoration: isSame ? undefined : val });
  };
  const decorationHue = overrides.decorationHue !== undefined ? overrides.decorationHue : initialDecorationHue;
  const setDecorationHue = (val: any) => {
    updateOverrides({ decorationHue: val === initialDecorationHue ? undefined : val });
  };

  const initialFrame = initialFrameUrl
    ? { 
        id: "custom", 
        name: (frames as any[]).find(f => f.sku_id === initialFrameUrl.split("frame:")[1])?.name || "Custom Frame", 
        url: initialFrameUrl 
      } as Decoration
    : null;

  const selectedFrame = overrides.selectedFrame !== undefined ? overrides.selectedFrame : initialFrame;
  const setSelectedFrame = (val: any) => {
    const isSame = val ? val.url === initialFrameUrl : !initialFrameUrl;
    updateOverrides({ selectedFrame: isSame ? undefined : val });
  };
  const frameHue = overrides.frameHue !== undefined ? overrides.frameHue : initialFrameHue;
  const setFrameHue = (val: any) => {
    updateOverrides({ frameHue: val === initialFrameHue ? undefined : val });
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
          selectedFrame={selectedFrame}
          frameHue={frameHue}
          decorationCount={decorationCount}
          bannerImageUrl={bannerImageUrl}
          setBannerImageUrl={setBannerImageUrl}
          bannerBackgroundUrl={bannerBackgroundUrl}
          setBannerBackgroundUrl={setBannerBackgroundUrl}
          setAvatarModalOpen={setAvatarModalOpen}
          setDecorationPickerOpen={setDecorationPickerOpen}
          setFramesPickerOpen={setFramesPickerOpen}
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
        />
      </div>


      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onApply={(url) => setAvatarUrl(url)}
      />

      <BannerUploadModal
        open={bannerImageModalOpen}
        onClose={() => setBannerImageModalOpen(false)}
        onApply={(url) => setBannerImageUrl(url)}
        type="image"
      />

      <BannerUploadModal
        open={bannerBackgroundModalOpen}
        onClose={() => setBannerBackgroundModalOpen(false)}
        onApply={(url) => setBannerBackgroundUrl(url)}
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

      <FramesPicker
        open={framesPickerOpen}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedFrame={selectedFrame}
        frameHue={frameHue}
        onClose={() => setFramesPickerOpen(false)}
        onSelectFrame={setSelectedFrame}
        onFrameHueChange={setFrameHue}
      />



      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          displayName,
          bio,
          location,
          occupation,
          avatarUrl,
          avatarShape,
          selectedDecoration,
          decorationHue,
          selectedFrame,
          frameHue,
          bannerImageUrl,
          bannerBackgroundUrl,
        }}
      />

      <SaveBar
        show={Object.keys(overrides).length > 0}
        onSave={async () => {
          try {
            const { selectedDecoration: _sd, decorationHue: _dh, selectedFrame: _sf, frameHue: _fh, ...restOverrides } = overrides;
            await updateGeneralProfile({
              username: user?.username || "",
              ...restOverrides,
              ...(overrides.selectedDecoration !== undefined ? { avatarDecorationUrl: overrides.selectedDecoration?.url ?? null } : {}),
              ...(overrides.decorationHue !== undefined ? { avatarDecorationHue: overrides.decorationHue } : {}),
              ...(overrides.selectedFrame !== undefined ? { profileFrameUrl: overrides.selectedFrame?.url ?? null } : {}),
              ...(overrides.frameHue !== undefined ? { profileFrameHue: overrides.frameHue } : {}),
            });
            toast.success("Profile Saved Sucessfully");
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save profile");
          }
        }}
        onRevert={clearOverrides}
      />
    </>
  );
}
