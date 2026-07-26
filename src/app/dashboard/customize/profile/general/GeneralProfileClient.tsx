"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import { updateGeneralProfile } from "@/actions/profile";

import AssetsSection from "@/components/dashboard/customize/general/AssetsSection";
import GeneralInfoSection from "@/components/dashboard/customize/general/GeneralInfoSection";
import SaveBar from "@/components/dashboard/SaveBar";
import AvatarUploadModal from "@/components/dashboard/AvatarUploadModal";
import BannerUploadModal from "@/components/dashboard/BannerUploadModal";
import DecorationPicker, { decorationCount, type Decoration } from "@/components/dashboard/DecorationPicker";
import { isVideoUrl } from "@/lib/utils/media";

interface User {
  username?: string | null;
  displayName?: string | null;
  location?: string | null;
  occupation?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  avatarDecorationUrl?: string | null;
  avatarDecorationHue?: number | null;
  avatarShape?: "square" | "soft" | "rounded" | "circle" | null;
  bannerImageUrl?: string | null;
  bannerBackgroundUrl?: string | null;
  profileBgColor?: string | null;
  profileBgOpacity?: number | null;
  profileShadowColor?: string | null;
  profileShadowOpacity?: number | null;
  profileOpacity?: number | null;
  views?: number | null;
  profileBorderColor?: string | null;
  profileBorderOpacity?: number | null;
  profileBorderWidth?: number | null;
  profileBorderRadius?: number | null;
  profileCardBlur?: number | null;
  profileBackgroundBlur?: number | null;
  usernameFont?: string | null;
  usernameFontSize?: number | null;
  usernameFontWeight?: number | null;
  usernameLetterSpacing?: number | null;
  usernameColor?: string | null;
  bioFont?: string | null;
  bioFontSize?: number | null;
  bioFontWeight?: number | null;
  bioLetterSpacing?: number | null;
  bioColor?: string | null;
  otherFont?: string | null;
  otherFontSize?: number | null;
  otherFontWeight?: number | null;
  otherLetterSpacing?: number | null;
  otherColor?: string | null;
}

export default function GeneralProfileClient({ user }: { user: User | null }) {
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

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [location, setLocation] = useState(initialLocation);
  const [occupation, setOccupation] = useState(initialOccupation);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarShape, setAvatarShape] = useState<"square" | "soft" | "rounded" | "circle">(initialAvatarShape);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState(initialBannerImageUrl);
  const [bannerBackgroundUrl, setBannerBackgroundUrl] = useState(initialBannerBackgroundUrl);
  const [bannerImageModalOpen, setBannerImageModalOpen] = useState(false);
  const [bannerBackgroundModalOpen, setBannerBackgroundModalOpen] = useState(false);
  const [decorationModalOpen, setDecorationModalOpen] = useState(false);
  
  // Set the initial decoration if url exists
  const initialDecoration = initialDecorationUrl 
    ? { id: "custom", name: "Custom Decoration", url: initialDecorationUrl } as Decoration 
    : null;
    
  const [selectedDecoration, setSelectedDecoration] = useState<Decoration | null>(initialDecoration);
  const [decorationHue, setDecorationHue] = useState(initialDecorationHue);

  const hasChanges = 
    displayName !== initialDisplayName || 
    location !== initialLocation || 
    occupation !== initialOccupation || 
    bio !== initialBio ||
    avatarUrl !== initialAvatarUrl ||
    avatarShape !== initialAvatarShape ||
    (selectedDecoration?.url ?? null) !== initialDecorationUrl ||
    decorationHue !== initialDecorationHue ||
    bannerImageUrl !== initialBannerImageUrl ||
    bannerBackgroundUrl !== initialBannerBackgroundUrl;

  const handleRevert = () => {
    setDisplayName(initialDisplayName);
    setLocation(initialLocation);
    setOccupation(initialOccupation);
    setBio(initialBio);
    setAvatarUrl(initialAvatarUrl);
    setAvatarShape(initialAvatarShape);
    setSelectedDecoration(initialDecoration);
    setDecorationHue(initialDecorationHue);
    setBannerImageUrl(initialBannerImageUrl);
    setBannerBackgroundUrl(initialBannerBackgroundUrl);
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

      <SaveBar 
        show={hasChanges} 
        onSave={async () => {
          // Automatically capture the user's timezone from their browser
          const autoTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          await updateGeneralProfile({ 
            username: user?.username || "",
            displayName, 
            location, 
            timezone: autoTimezone,
            occupation, 
            bio, 
            avatarUrl, 
            avatarShape,
            avatarDecorationUrl: selectedDecoration?.url ?? null,
            avatarDecorationHue: decorationHue,
            bannerImageUrl,
            bannerBackgroundUrl
          });
          router.refresh();
        }}
        onRevert={handleRevert} 
      />

      <ProfilePreview
        userId={(user as any)?.id}
        username={user?.username ?? undefined}
        displayName={displayName}
        bio={bio}
        location={location}
        occupation={occupation}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedDecoration={selectedDecoration}
        decorationHue={decorationHue}
        bannerImageUrl={bannerImageUrl}
        bannerBackgroundUrl={bannerBackgroundUrl}
        profileBgColor={initialProfileBgColor}
        profileBgOpacity={initialProfileBgOpacity}
        profileShadowColor={initialProfileShadowColor}
        profileShadowOpacity={initialProfileShadowOpacity}
        profileOpacity={initialProfileOpacity}
        profileBorderColor={user?.profileBorderColor ?? undefined}
        profileBorderOpacity={user?.profileBorderOpacity ?? undefined}
        profileBorderWidth={user?.profileBorderWidth ?? undefined}
        profileBorderRadius={user?.profileBorderRadius ?? undefined}
        profileCardBlur={user?.profileCardBlur ?? undefined}
        profileBackgroundBlur={user?.profileBackgroundBlur ?? undefined}
        usernameFont={user?.usernameFont ?? undefined}
        usernameFontSize={user?.usernameFontSize ?? undefined}
        usernameFontWeight={user?.usernameFontWeight ?? undefined}
        usernameLetterSpacing={user?.usernameLetterSpacing ?? undefined}
        usernameColor={user?.usernameColor ?? undefined}
        bioFont={user?.bioFont ?? undefined}
        bioFontSize={user?.bioFontSize ?? undefined}
        bioFontWeight={user?.bioFontWeight ?? undefined}
        bioLetterSpacing={user?.bioLetterSpacing ?? undefined}
        bioColor={user?.bioColor ?? undefined}
        otherFont={user?.otherFont ?? undefined}
        otherFontSize={user?.otherFontSize ?? undefined}
        otherFontWeight={user?.otherFontWeight ?? undefined}
        otherLetterSpacing={user?.otherLetterSpacing ?? undefined}
        otherColor={user?.otherColor ?? undefined}
        views={user?.views ?? 0}
        joinDateEnabled={(user as any)?.joinDateEnabled ?? undefined}
        joinDateFormat={(user as any)?.joinDateFormat ?? undefined}
        viewsEnabled={(user as any)?.viewsEnabled ?? undefined}
        viewsAnimationEnabled={(user as any)?.viewsAnimationEnabled ?? undefined}
        viewsAnimationDuration={(user as any)?.viewsAnimationDuration ?? undefined}
        commentsEnabled={(user as any)?.commentsEnabled ?? undefined}
        feedbackEnabled={(user as any)?.feedbackEnabled ?? false}
        showUidTooltip={(user as any)?.showUidTooltip ?? true}
        showLocationTooltip={(user as any)?.showLocationTooltip ?? true}
        showOccupationTooltip={(user as any)?.showOccupationTooltip ?? true}
        showLikesTooltip={(user as any)?.showLikesTooltip ?? true}
        showDislikesTooltip={(user as any)?.showDislikesTooltip ?? true}
        showJoinDateTooltip={(user as any)?.showJoinDateTooltip ?? true}
        showViewsTooltip={(user as any)?.showViewsTooltip ?? true}
        createdAt={(user as any)?.createdAt ?? undefined}
      />
    </>
  );
}
