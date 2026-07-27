"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateColorsProfile } from "@/actions/profile";
import { type User } from "@/lib/db/schema";
import ColorCustomization from "@/components/dashboard/customize/colors/ColorCustomization";

export default function ColorsProfileClient({ user }: { user: Omit<User, "password"> | null }) {
  const router = useRouter();

  const initialUsernameColor = user?.usernameColor ?? "#ffffff";
  const initialBioColor = user?.bioColor ?? "#ffffff";
  const initialOtherColor = user?.otherColor ?? "#ffffff";
  const initialHighlightColor = user?.highlightColor ?? "#ffffff";
  const initialPageBgColor = user?.pageBgColor ?? "#050505";

  const [openSection, setOpenSection] = useState<string | null>(null);

  const [usernameColor, setUsernameColor] = useState(initialUsernameColor);
  const [bioColor, setBioColor] = useState(initialBioColor);
  const [otherColor, setOtherColor] = useState(initialOtherColor);
  const [highlightColor, setHighlightColor] = useState(initialHighlightColor);
  const [pageBgColor, setPageBgColor] = useState(initialPageBgColor);

  const hasChanges =
    usernameColor !== initialUsernameColor ||
    bioColor !== initialBioColor ||
    otherColor !== initialOtherColor ||
    highlightColor !== initialHighlightColor ||
    pageBgColor !== initialPageBgColor;

  const handleRevert = () => {
    setUsernameColor(initialUsernameColor);
    setBioColor(initialBioColor);
    setOtherColor(initialOtherColor);
    setHighlightColor(initialHighlightColor);
    setPageBgColor(initialPageBgColor);
  };

  return (
    <>
      {/* Settings Content */}
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <ColorCustomization
          openSection={openSection}
          setOpenSection={setOpenSection}
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

      <ProfilePreview
        userId={user?.id}
        username={user?.username ?? undefined}
        displayName={user?.displayName ?? undefined}
        bio={user?.bio ?? undefined}
        location={user?.location ?? undefined}
        occupation={user?.occupation ?? undefined}
        avatarUrl={user?.avatarUrl || undefined}
        avatarShape={(user?.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "rounded"}
        selectedDecoration={user?.avatarDecorationUrl ? { id: "custom", name: "Custom Decoration", url: user.avatarDecorationUrl } as any : null}
        decorationHue={user?.avatarDecorationHue ?? 0}
        bannerImageUrl={user?.bannerImageUrl || undefined}
        bannerBackgroundUrl={user?.bannerBackgroundUrl || undefined}
        pageBgColor={pageBgColor}
        profileBgColor={user?.profileBgColor ?? "#ffffff"}
        profileBgOpacity={user?.profileBgOpacity ?? 10}
        profileBorderColor={user?.profileBorderColor ?? "#ffffff"}
        profileBorderOpacity={user?.profileBorderOpacity ?? 10}
        profileBorderWidth={user?.profileBorderWidth ?? 1}
        profileBorderRadius={user?.profileBorderRadius ?? 24}
        profileCardBlur={user?.profileCardBlur ?? 20}
        profileBackgroundBlur={user?.profileBackgroundBlur ?? 0}
        profileShadowColor={user?.profileShadowColor ?? "#000000"}
        profileShadowOpacity={user?.profileShadowOpacity ?? 20}
        profileOpacity={user?.profileOpacity ?? 100}
        views={user?.views ?? 0}
        usernameFont={user?.usernameFont ?? "inter"}
        usernameFontSize={user?.usernameFontSize ?? 24}
        usernameFontWeight={user?.usernameFontWeight ?? 700}
        usernameLetterSpacing={user?.usernameLetterSpacing ?? 0}
        usernameColor={usernameColor}
        bioFont={user?.bioFont ?? "inter"}
        bioFontSize={user?.bioFontSize ?? 15}
        bioFontWeight={user?.bioFontWeight ?? 400}
        bioLetterSpacing={user?.bioLetterSpacing ?? 0}
        bioColor={bioColor}
        otherFont={user?.otherFont ?? "inter"}
        otherFontSize={user?.otherFontSize ?? 13}
        otherFontWeight={user?.otherFontWeight ?? 400}
        otherLetterSpacing={user?.otherLetterSpacing ?? 0}
        otherColor={otherColor}
        highlightColor={highlightColor}
        joinDateEnabled={user?.joinDateEnabled ?? true}
        joinDateFormat={user?.joinDateFormat ?? "standard"}
        viewsEnabled={user?.viewsEnabled ?? true}
        viewsAnimationEnabled={user?.viewsAnimationEnabled ?? true}
        viewsAnimationDuration={user?.viewsAnimationDuration ?? 1000}
        commentsEnabled={user?.commentsEnabled ?? true}
        feedbackEnabled={user?.feedbackEnabled ?? true}
        showUidTooltip={user?.showUidTooltip ?? true}
        showLocationTooltip={user?.showLocationTooltip ?? true}
        showOccupationTooltip={user?.showOccupationTooltip ?? true}
        showLikesTooltip={user?.showLikesTooltip ?? true}
        showDislikesTooltip={user?.showDislikesTooltip ?? true}
        showJoinDateTooltip={user?.showJoinDateTooltip ?? true}
        showViewsTooltip={user?.showViewsTooltip ?? true}
        createdAt={user?.createdAt}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          await updateColorsProfile({
            username: user?.username || "",
            usernameColor,
            bioColor,
            otherColor,
            highlightColor,
            pageBgColor,
          });
          router.refresh();
        }}
        onRevert={handleRevert}
      />
    </>
  );
}
