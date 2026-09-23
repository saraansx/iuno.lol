"use client";

import React, {  useState  } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateAppearanceProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

import JoinDateSection from "@/components/dashboard/customize/appearance/JoinDateSection";
import ViewsSection from "@/components/dashboard/customize/appearance/ViewsSection";
import CommentsSection from "@/components/dashboard/customize/appearance/CommentsSection";
import IconsGlowSection from "@/components/dashboard/customize/appearance/IconsGlowSection";
import FeedbackSection from "@/components/dashboard/customize/appearance/FeedbackSection";
import TooltipsSection from "@/components/dashboard/customize/appearance/TooltipsSection";
import ColorPickerInput from "@/components/ui/color-picker";
import NumberDraftInput from "@/components/ui/number-draft-input";

import { type FullUser } from "@/lib/features/users/db";
import { isPremiumActive } from "@/lib/premium";

type SectionKey =
  | "profile-bg"
  | "profile-border"
  | "profile-shadow"
  | "profile-blur";

import { useCustomizeProfile } from '../CustomizeProfileProvider';
import SaveBar from "@/components/dashboard/SaveBar";


export default function AppearanceProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const router = useRouter();

  const initialProfileBgColor = user?.profileBgColor ?? "#050505";
  const initialProfileBgOpacity = user?.profileBgOpacity ?? 10;
  const initialProfileBorderColor = user?.profileBorderColor ?? "#ffffff";
  const initialProfileBorderOpacity = user?.profileBorderOpacity ?? 10;
  const initialProfileBorderWidth = user?.profileBorderWidth ?? 0;
  const initialProfileBorderRadius = user?.profileBorderRadius ?? 24;
  const initialProfileCardBlur = user?.profileCardBlur ?? 0;
  const initialProfileBackgroundBlur = user?.profileBackgroundBlur ?? 0;
  const initialProfileShadowColor = user?.profileShadowColor ?? "#000000";
  const initialProfileShadowOpacity = user?.profileShadowOpacity ?? 0;
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const profileBgOpacity = overrides.profileBgOpacity ?? initialProfileBgOpacity;
  const setProfileBgOpacity = (val: number) => updateOverrides({ profileBgOpacity: val === initialProfileBgOpacity ? undefined : val });
  const profileBgColor = overrides.profileBgColor ?? initialProfileBgColor;
  const setProfileBgColor = (val: string) => updateOverrides({ profileBgColor: val === initialProfileBgColor ? undefined : val });
  const profileBorderColor = overrides.profileBorderColor ?? initialProfileBorderColor;
  const setProfileBorderColor = (val: string) => updateOverrides({ profileBorderColor: val === initialProfileBorderColor ? undefined : val });
  const profileBorderOpacity = overrides.profileBorderOpacity ?? initialProfileBorderOpacity;
  const setProfileBorderOpacity = (val: number) => updateOverrides({ profileBorderOpacity: val === initialProfileBorderOpacity ? undefined : val });
  const profileBorderWidth = overrides.profileBorderWidth ?? initialProfileBorderWidth;
  const setProfileBorderWidth = (val: number) => updateOverrides({ profileBorderWidth: val === initialProfileBorderWidth ? undefined : val });
  const profileBorderRadius = overrides.profileBorderRadius ?? initialProfileBorderRadius;
  const setProfileBorderRadius = (val: number) => updateOverrides({ profileBorderRadius: val === initialProfileBorderRadius ? undefined : val });
  const profileCardBlur = overrides.profileCardBlur ?? initialProfileCardBlur;
  const setProfileCardBlur = (val: number) => updateOverrides({ profileCardBlur: val === initialProfileCardBlur ? undefined : val });
  const profileBackgroundBlur = overrides.profileBackgroundBlur ?? initialProfileBackgroundBlur;
  const setProfileBackgroundBlur = (val: number) => updateOverrides({ profileBackgroundBlur: val === initialProfileBackgroundBlur ? undefined : val });
  const profileShadowOpacity = overrides.profileShadowOpacity ?? initialProfileShadowOpacity;
  const setProfileShadowOpacity = (val: number) => updateOverrides({ profileShadowOpacity: val === initialProfileShadowOpacity ? undefined : val });
  const profileShadowColor = overrides.profileShadowColor ?? initialProfileShadowColor;
  const setProfileShadowColor = (val: string) => updateOverrides({ profileShadowColor: val === initialProfileShadowColor ? undefined : val });
  const initialJoinDateEnabled = user?.joinDateEnabled ?? false;
  const rawJoinDateFormat = user?.joinDateFormat ?? "Absolute";
  const initialJoinDateFormat = rawJoinDateFormat.includes(" (") ? rawJoinDateFormat.split(" (")[0] : rawJoinDateFormat;

  const isJoinDateEnabled = overrides.joinDateEnabled ?? initialJoinDateEnabled;
  const setIsJoinDateEnabled = (val: boolean) => updateOverrides({ joinDateEnabled: val === initialJoinDateEnabled ? undefined : val });
  const [isJoinDateFormatDropdownOpen, setIsJoinDateFormatDropdownOpen] = useState(false);
  const joinDateFormat = overrides.joinDateFormat ?? initialJoinDateFormat;
  const setJoinDateFormat = (val: string) => updateOverrides({ joinDateFormat: val === initialJoinDateFormat ? undefined : val });

  const initialViewsEnabled = user?.viewsEnabled ?? true;
  const initialViewsAnimationEnabled = user?.viewsAnimationEnabled ?? false;
  const initialViewsAnimationDuration = user?.viewsAnimationDuration ?? 1000;
  const initialViewsAnimationStyle = (user?.viewsAnimationStyle ?? "none") as "none" | "countup" | "digitalroll" | "slotroll" | "speeding";

  const isViewsEnabled = overrides.viewsEnabled ?? initialViewsEnabled;
  const setIsViewsEnabled = (val: boolean) => updateOverrides({ viewsEnabled: val === initialViewsEnabled ? undefined : val });
  const isViewsAnimationEnabled = overrides.viewsAnimationEnabled ?? initialViewsAnimationEnabled;
  const setIsViewsAnimationEnabled = (val: boolean) => updateOverrides({ viewsAnimationEnabled: val === initialViewsAnimationEnabled ? undefined : val });
  const viewsAnimationDuration = overrides.viewsAnimationDuration ?? initialViewsAnimationDuration;
  const setViewsAnimationDuration = (val: number) => updateOverrides({ viewsAnimationDuration: val === initialViewsAnimationDuration ? undefined : val });
  const viewsAnimationStyle = (overrides.viewsAnimationStyle ?? initialViewsAnimationStyle) as "none" | "countup" | "digitalroll" | "slotroll" | "speeding";
  const setViewsAnimationStyle = (val: "none" | "countup" | "digitalroll" | "slotroll" | "speeding") =>
    updateOverrides({ viewsAnimationStyle: val === initialViewsAnimationStyle ? undefined : val });

  const initialCommentsEnabled = user?.commentsEnabled ?? false;
  const initialShowCommentsPublicly = user?.showCommentsPublicly ?? false;
  const initialAllowNewComments = user?.allowNewComments ?? false;

  const isCommentsEnabled = overrides.commentsEnabled ?? initialCommentsEnabled;
  const setIsCommentsEnabled = (val: boolean) => updateOverrides({ commentsEnabled: val === initialCommentsEnabled ? undefined : val });
  const isShowCommentsPublicly = overrides.showCommentsPublicly ?? initialShowCommentsPublicly;
  const setIsShowCommentsPublicly = (val: boolean) => updateOverrides({ showCommentsPublicly: val === initialShowCommentsPublicly ? undefined : val });
  const isAllowNewComments = overrides.allowNewComments ?? initialAllowNewComments;
  const setIsAllowNewComments = (val: boolean) => updateOverrides({ allowNewComments: val === initialAllowNewComments ? undefined : val });

  const initialFeedbackEnabled = user?.feedbackEnabled ?? true;
  const isFeedbackEnabled = overrides.feedbackEnabled ?? initialFeedbackEnabled;
  const setIsFeedbackEnabled = (val: boolean) => updateOverrides({ feedbackEnabled: val === initialFeedbackEnabled ? undefined : val });
  const initialShowFeedbackPublicly = user?.showFeedbackPublicly ?? true;
  const isShowFeedbackPublicly = overrides.showFeedbackPublicly ?? initialShowFeedbackPublicly;
  const setIsShowFeedbackPublicly = (val: boolean) => updateOverrides({ showFeedbackPublicly: val === initialShowFeedbackPublicly ? undefined : val });

  const initialUidTooltipEnabled = user?.showUidTooltip ?? false;
  const isUidTooltipEnabled = overrides.showUidTooltip ?? initialUidTooltipEnabled;
  const setIsUidTooltipEnabled = (val: boolean) => updateOverrides({ showUidTooltip: val === initialUidTooltipEnabled ? undefined : val });

  const initialLocationTooltipEnabled = user?.showLocationTooltip ?? false;
  const isLocationTooltipEnabled = overrides.showLocationTooltip ?? initialLocationTooltipEnabled;
  const setIsLocationTooltipEnabled = (val: boolean) => updateOverrides({ showLocationTooltip: val === initialLocationTooltipEnabled ? undefined : val });

  const initialOccupationTooltipEnabled = user?.showOccupationTooltip ?? false;
  const isOccupationTooltipEnabled = overrides.showOccupationTooltip ?? initialOccupationTooltipEnabled;
  const setIsOccupationTooltipEnabled = (val: boolean) => updateOverrides({ showOccupationTooltip: val === initialOccupationTooltipEnabled ? undefined : val });

  const initialLikesTooltipEnabled = user?.showLikesTooltip ?? false;
  const isLikesTooltipEnabled = overrides.showLikesTooltip ?? initialLikesTooltipEnabled;
  const setIsLikesTooltipEnabled = (val: boolean) => updateOverrides({ showLikesTooltip: val === initialLikesTooltipEnabled ? undefined : val });

  const initialDislikesTooltipEnabled = user?.showDislikesTooltip ?? false;
  const isDislikesTooltipEnabled = overrides.showDislikesTooltip ?? initialDislikesTooltipEnabled;
  const setIsDislikesTooltipEnabled = (val: boolean) => updateOverrides({ showDislikesTooltip: val === initialDislikesTooltipEnabled ? undefined : val });

  const initialJoinDateTooltipEnabled = user?.showJoinDateTooltip ?? false;
  const isJoinDateTooltipEnabled = overrides.showJoinDateTooltip ?? initialJoinDateTooltipEnabled;
  const setIsJoinDateTooltipEnabled = (val: boolean) => updateOverrides({ showJoinDateTooltip: val === initialJoinDateTooltipEnabled ? undefined : val });

  const initialViewsTooltipEnabled = user?.showViewsTooltip ?? false;
  const isViewsTooltipEnabled = overrides.showViewsTooltip ?? initialViewsTooltipEnabled;
  const setIsViewsTooltipEnabled = (val: boolean) => updateOverrides({ showViewsTooltip: val === initialViewsTooltipEnabled ? undefined : val });

  const initialLinksTooltipEnabled = user?.showLinksTooltip ?? false;
  const isLinksTooltipEnabled = overrides.showLinksTooltip ?? initialLinksTooltipEnabled;
  const setIsLinksTooltipEnabled = (val: boolean) => updateOverrides({ showLinksTooltip: val === initialLinksTooltipEnabled ? undefined : val });

  const initialBadgesTooltipEnabled = user?.showBadgesTooltip ?? false;
  const isBadgesTooltipEnabled = overrides.showBadgesTooltip ?? initialBadgesTooltipEnabled;
  const setIsBadgesTooltipEnabled = (val: boolean) => updateOverrides({ showBadgesTooltip: val === initialBadgesTooltipEnabled ? undefined : val });

  const initialIconsGlowEnabled = user?.iconsGlowEnabled ?? false;
  const isIconsGlowEnabled = overrides.iconsGlowEnabled ?? initialIconsGlowEnabled;
  const setIsIconsGlowEnabled = (val: boolean) => updateOverrides({ iconsGlowEnabled: val === initialIconsGlowEnabled ? undefined : val });
  const initialJoinDateIconGlow = user?.joinDateIconGlow ?? false;
  const isJoinDateIconGlow = overrides.joinDateIconGlow ?? initialJoinDateIconGlow;
  const setIsJoinDateIconGlow = (val: boolean) => updateOverrides({ joinDateIconGlow: val === initialJoinDateIconGlow ? undefined : val });
  const initialLocationIconGlow = user?.locationIconGlow ?? false;
  const isLocationIconGlow = overrides.locationIconGlow ?? initialLocationIconGlow;
  const setIsLocationIconGlow = (val: boolean) => updateOverrides({ locationIconGlow: val === initialLocationIconGlow ? undefined : val });
  const initialOccupationIconGlow = user?.occupationIconGlow ?? false;
  const isOccupationIconGlow = overrides.occupationIconGlow ?? initialOccupationIconGlow;
  const setIsOccupationIconGlow = (val: boolean) => updateOverrides({ occupationIconGlow: val === initialOccupationIconGlow ? undefined : val });
  const initialUidIconGlow = user?.uidIconGlow ?? false;
  const isUidIconGlow = overrides.uidIconGlow ?? initialUidIconGlow;
  const setIsUidIconGlow = (val: boolean) => updateOverrides({ uidIconGlow: val === initialUidIconGlow ? undefined : val });
  const initialViewsIconGlow = user?.viewsIconGlow ?? false;
  const isViewsIconGlow = overrides.viewsIconGlow ?? initialViewsIconGlow;
  const setIsViewsIconGlow = (val: boolean) => updateOverrides({ viewsIconGlow: val === initialViewsIconGlow ? undefined : val });
  const initialFeedbackIconGlow = user?.feedbackIconGlow ?? false;
  const isFeedbackIconGlow = overrides.feedbackIconGlow ?? initialFeedbackIconGlow;
  const setIsFeedbackIconGlow = (val: boolean) => updateOverrides({ feedbackIconGlow: val === initialFeedbackIconGlow ? undefined : val });

  const joinDateFormatOptions = [
    "Absolute",
    "Short",
    "Long",
    "Month Year",
    "Year Only",
    "Compact"
  ];

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const profileCardItems: {
    key: SectionKey;
    label: string;
    icon: React.ReactNode;
  }[] = [
      {
        key: "profile-bg",
        label: "Background",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        ),
      },
      {
        key: "profile-border",
        label: "Border",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          </svg>
        ),
      },
      {
        key: "profile-shadow",
        label: "Shadow",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 2v4" />
            <path d="M19 2v4" />
            <path d="M21 13h-4" />
          </svg>
        ),
      },
      {
        key: "profile-blur",
        label: "Blur",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        ),
      },
    ];

  const renderSectionRow = (item: (typeof profileCardItems)[number], children?: React.ReactNode) => {
    const isOpen = openSection === item.key;
    return (
      <div key={item.key} className="bg-[#111111] border border-white/5 rounded-xl flex flex-col transition-all duration-200">
        <button
          onClick={() => toggleSection(item.key)}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer text-left focus:outline-none"
        >
          <div className="text-white/50">{item.icon}</div>
          <span className="text-[13px] font-medium text-white/90 flex-1">
            {item.label}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-0.5">
            {children ?? (
              <div className="h-24 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                <span className="text-[13px] text-white/30">
                  {item.label} settings coming soon
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <div
        className="w-full pb-10 flex flex-col gap-6"
        style={{ paddingRight: 'calc(var(--preview-width, 380px) + 2rem)' }}
      >
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-8 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5b6cf5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 15h4"/>
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">
                Profile Card
              </h2>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-3 flex-1">
                {renderSectionRow(profileCardItems[0], (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Background Opacity
                      </label>
                      <NumberDraftInput
                        prefix="%"
                        min={0}
                        max={100}
                        step={0.1}
                        value={profileBgOpacity}
                        onCommit={setProfileBgOpacity}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Background Color
                      </label>
                      <ColorPickerInput
                        value={profileBgColor}
                        onChange={setProfileBgColor}
                      />
                    </div>
                  </div>
                ))}
                {renderSectionRow(profileCardItems[2], (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Shadow Opacity
                      </label>
                      <NumberDraftInput
                        prefix="%"
                        min={0}
                        max={100}
                        step={0.1}
                        value={profileShadowOpacity}
                        onCommit={setProfileShadowOpacity}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Shadow Color
                      </label>
                      <ColorPickerInput
                        value={profileShadowColor}
                        onChange={setProfileShadowColor}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {renderSectionRow(profileCardItems[1], (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Width
                      </label>
                      <NumberDraftInput
                        min={0}
                        max={20}
                        step={0.1}
                        suffix="px"
                        value={profileBorderWidth}
                        onCommit={setProfileBorderWidth}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Radius
                      </label>
                      <NumberDraftInput
                        min={0}
                        max={100}
                        step={0.1}
                        suffix="px"
                        value={profileBorderRadius}
                        onCommit={setProfileBorderRadius}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Color
                      </label>
                      <ColorPickerInput
                        value={profileBorderColor}
                        onChange={setProfileBorderColor}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Opacity
                      </label>
                      <NumberDraftInput
                        prefix="%"
                        min={0}
                        max={100}
                        step={0.1}
                        value={profileBorderOpacity}
                        onCommit={setProfileBorderOpacity}
                      />
                    </div>
                  </div>
                ))}
                {renderSectionRow(profileCardItems[3], (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Card Blur
                      </label>
                      <NumberDraftInput
                        min={0}
                        max={100}
                        step={0.1}
                        suffix="px"
                        value={profileCardBlur}
                        onCommit={setProfileCardBlur}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Background Blur
                      </label>
                      <NumberDraftInput
                        min={0}
                        max={100}
                        step={0.1}
                        suffix="px"
                        value={profileBackgroundBlur}
                        onCommit={setProfileBackgroundBlur}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <JoinDateSection
            isJoinDateEnabled={isJoinDateEnabled}
            setIsJoinDateEnabled={setIsJoinDateEnabled}
            joinDateFormat={joinDateFormat}
            setJoinDateFormat={setJoinDateFormat}
            isJoinDateFormatDropdownOpen={isJoinDateFormatDropdownOpen}
            setIsJoinDateFormatDropdownOpen={setIsJoinDateFormatDropdownOpen}
            joinDateFormatOptions={joinDateFormatOptions}
          />

          <FeedbackSection
            isFeedbackEnabled={isFeedbackEnabled}
            setIsFeedbackEnabled={setIsFeedbackEnabled}
            isShowFeedbackPublicly={isShowFeedbackPublicly}
            setIsShowFeedbackPublicly={setIsShowFeedbackPublicly}
          />

          <div className="col-span-1 xl:col-span-2">
            <CommentsSection
              isCommentsEnabled={isCommentsEnabled}
              setIsCommentsEnabled={setIsCommentsEnabled}
              isShowCommentsPublicly={isShowCommentsPublicly}
              setIsShowCommentsPublicly={setIsShowCommentsPublicly}
              isAllowNewComments={isAllowNewComments}
              setIsAllowNewComments={setIsAllowNewComments}
            />
          </div>

          <div className="col-span-1 xl:col-span-2">
            <IconsGlowSection
              isIconsGlowEnabled={isIconsGlowEnabled}
              setIsIconsGlowEnabled={setIsIconsGlowEnabled}
              isJoinDateIconGlow={isJoinDateIconGlow}
              setIsJoinDateIconGlow={setIsJoinDateIconGlow}
              isLocationIconGlow={isLocationIconGlow}
              setIsLocationIconGlow={setIsLocationIconGlow}
              isOccupationIconGlow={isOccupationIconGlow}
              setIsOccupationIconGlow={setIsOccupationIconGlow}
              isUidIconGlow={isUidIconGlow}
              setIsUidIconGlow={setIsUidIconGlow}
              isViewsIconGlow={isViewsIconGlow}
              setIsViewsIconGlow={setIsViewsIconGlow}
              isFeedbackIconGlow={isFeedbackIconGlow}
              setIsFeedbackIconGlow={setIsFeedbackIconGlow}
            />
          </div>

          <div className="col-span-1 xl:col-span-2">
            <ViewsSection
              isPremium={isPremiumActive(user)}
              isViewsEnabled={isViewsEnabled}
              setIsViewsEnabled={setIsViewsEnabled}
              isViewsAnimationEnabled={isViewsAnimationEnabled}
              setIsViewsAnimationEnabled={setIsViewsAnimationEnabled}
              viewsAnimationDuration={viewsAnimationDuration}
              setViewsAnimationDuration={setViewsAnimationDuration}
              viewsAnimationStyle={viewsAnimationStyle}
              setViewsAnimationStyle={setViewsAnimationStyle}
            />
          </div>

          <TooltipsSection
            isUidTooltipEnabled={isUidTooltipEnabled}
            onToggleUidTooltip={() => setIsUidTooltipEnabled(!isUidTooltipEnabled)}
            isLocationTooltipEnabled={isLocationTooltipEnabled}
            onToggleLocationTooltip={() => setIsLocationTooltipEnabled(!isLocationTooltipEnabled)}
            isOccupationTooltipEnabled={isOccupationTooltipEnabled}
            onToggleOccupationTooltip={() => setIsOccupationTooltipEnabled(!isOccupationTooltipEnabled)}
            isLikesTooltipEnabled={isLikesTooltipEnabled}
            onToggleLikesTooltip={() => setIsLikesTooltipEnabled(!isLikesTooltipEnabled)}
            isDislikesTooltipEnabled={isDislikesTooltipEnabled}
            onToggleDislikesTooltip={() => setIsDislikesTooltipEnabled(!isDislikesTooltipEnabled)}
            isJoinDateTooltipEnabled={isJoinDateTooltipEnabled}
            onToggleJoinDateTooltip={() => setIsJoinDateTooltipEnabled(!isJoinDateTooltipEnabled)}
            isViewsTooltipEnabled={isViewsTooltipEnabled}
            onToggleViewsTooltip={() => setIsViewsTooltipEnabled(!isViewsTooltipEnabled)}
            isLinksTooltipEnabled={isLinksTooltipEnabled}
            onToggleLinksTooltip={() => setIsLinksTooltipEnabled(!isLinksTooltipEnabled)}
            isBadgesTooltipEnabled={isBadgesTooltipEnabled}
            onToggleBadgesTooltip={() => setIsBadgesTooltipEnabled(!isBadgesTooltipEnabled)}
          />
        </div>

      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          profileBgColor,
          profileBgOpacity,
          profileBorderColor,
          profileBorderOpacity,
          profileBorderWidth,
          profileBorderRadius,
          profileCardBlur,
          profileBackgroundBlur,
          profileShadowColor,
          profileShadowOpacity,
          joinDateEnabled: isJoinDateEnabled,
          joinDateFormat,
          viewsEnabled: isViewsEnabled,
          viewsAnimationEnabled: isViewsAnimationEnabled,
          viewsAnimationDuration,
          viewsAnimationStyle,
          commentsEnabled: isCommentsEnabled,
          feedbackEnabled: isFeedbackEnabled,
          showUidTooltip: isUidTooltipEnabled,
          showLocationTooltip: isLocationTooltipEnabled,
          showOccupationTooltip: isOccupationTooltipEnabled,
          showLikesTooltip: isLikesTooltipEnabled,
          showDislikesTooltip: isDislikesTooltipEnabled,
          showJoinDateTooltip: isJoinDateTooltipEnabled,
          showViewsTooltip: isViewsTooltipEnabled,
          showLinksTooltip: isLinksTooltipEnabled,
          showBadgesTooltip: isBadgesTooltipEnabled,
          iconsGlowEnabled: isIconsGlowEnabled,
          joinDateIconGlow: isJoinDateIconGlow,
          locationIconGlow: isLocationIconGlow,
          occupationIconGlow: isOccupationIconGlow,
          uidIconGlow: isUidIconGlow,
          viewsIconGlow: isViewsIconGlow,
          feedbackIconGlow: isFeedbackIconGlow,
        }}
      />

      <SaveBar
        show={Object.keys(overrides).length > 0}
        onSave={async () => {
          try {
            await updateAppearanceProfile(
              overrides as Parameters<typeof updateAppearanceProfile>[0]
            );
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

    </React.Fragment>
  );
}
