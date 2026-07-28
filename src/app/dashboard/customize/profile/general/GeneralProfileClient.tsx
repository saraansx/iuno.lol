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
import { isVideoUrl } from "@/lib/utils/media";

import { type User } from "@/lib/db/schema";

import { useCustomizeProfile } from '../CustomizeProfileProvider';
import SaveBar from "@/components/dashboard/SaveBar";

export default function GeneralProfileClient({ user }: { user: Omit<User, "password"> | null }) {
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
  const initialBannerImageUrl = user?.bannerImageUrl ?? "";
  const initialBannerBackgroundUrl = user?.bannerBackgroundUrl ?? "";
  const initialProfileBgColor = user?.profileBgColor ?? "#050505";
  const initialProfileBgOpacity = user?.profileBgOpacity ?? 100;
  const initialProfileShadowColor = user?.profileShadowColor ?? "#000000";
  const initialProfileShadowOpacity = user?.profileShadowOpacity ?? 0;
  const initialProfileOpacity = user?.profileOpacity ?? 100;

  const displayName = overrides.displayName ?? initialDisplayName;
  const setDisplayName = (val: any) => updateOverrides({ displayName: val });
  const location = overrides.location ?? initialLocation;
  const setLocation = (val: any) => updateOverrides({ location: val });
  const occupation = overrides.occupation ?? initialOccupation;
  const setOccupation = (val: any) => updateOverrides({ occupation: val });
  const bio = overrides.bio ?? initialBio;
  const setBio = (val: any) => updateOverrides({ bio: val });
  const avatarUrl = overrides.avatarUrl ?? initialAvatarUrl;
  const setAvatarUrl = (val: any) => updateOverrides({ avatarUrl: val });
  const avatarShape = overrides.avatarShape ?? initialAvatarShape;
  const setAvatarShape = (val: any) => updateOverrides({ avatarShape: val });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const bannerImageUrl = overrides.bannerImageUrl ?? initialBannerImageUrl;
  const setBannerImageUrl = (val: any) => updateOverrides({ bannerImageUrl: val });
  const bannerBackgroundUrl = overrides.bannerBackgroundUrl ?? initialBannerBackgroundUrl;
  const setBannerBackgroundUrl = (val: any) => updateOverrides({ bannerBackgroundUrl: val });
  const [bannerImageModalOpen, setBannerImageModalOpen] = useState(false);
  const [bannerBackgroundModalOpen, setBannerBackgroundModalOpen] = useState(false);
  const [decorationModalOpen, setDecorationModalOpen] = useState(false);

  // Set the initial decoration if url exists
  const initialDecoration = initialDecorationUrl
    ? { id: "custom", name: "Custom Decoration", url: initialDecorationUrl } as Decoration
    : null;

  const selectedDecoration = overrides.selectedDecoration ?? initialDecoration;
  const setSelectedDecoration = (val: any) => updateOverrides({ selectedDecoration: val });
  const decorationHue = overrides.decorationHue ?? initialDecorationHue;
  const setDecorationHue = (val: any) => updateOverrides({ decorationHue: val });



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
          decorationCount={decorationCount}
          bannerImageUrl={bannerImageUrl}
          setBannerImageUrl={setBannerImageUrl}
          bannerBackgroundUrl={bannerBackgroundUrl}
          setBannerBackgroundUrl={setBannerBackgroundUrl}
          setAvatarModalOpen={setAvatarModalOpen}
          setDecorationModalOpen={setDecorationModalOpen}
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
        open={decorationModalOpen}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedDecoration={selectedDecoration}
        hueRotation={decorationHue}
        onClose={() => setDecorationModalOpen(false)}
        onSelect={setSelectedDecoration}
        onHueRotationChange={setDecorationHue}
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
          bannerImageUrl,
          bannerBackgroundUrl,
        }}
      />

      <SaveBar
        show={Object.keys(overrides).length > 0}
        onSave={async () => {
          try {
            await updateGeneralProfile({
              username: user?.username || "",
              ...overrides
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
