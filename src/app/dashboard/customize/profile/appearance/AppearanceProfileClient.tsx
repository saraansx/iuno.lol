"use client";

import React, {  useState  } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateAppearanceProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

import JoinDateSection from "@/components/dashboard/customize/appearance/JoinDateSection";
import ViewsSection from "@/components/dashboard/customize/appearance/ViewsSection";
import CommentsSection from "@/components/dashboard/customize/appearance/CommentsSection";
import FeedbackSection from "@/components/dashboard/customize/appearance/FeedbackSection";
import TooltipsSection from "@/components/dashboard/customize/appearance/TooltipsSection";
import CardTransitionSection from "@/components/dashboard/customize/effects/CardTransitionSection";

import { type FullUser } from "@/lib/features/users/db";

type SectionKey =
  | "profile-bg"
  | "profile-border"
  | "profile-shadow"
  | "profile-blur"
  | "profile-opacity"
  | "inner-bg"
  | "inner-border"
  | "name-font"
  | "bio-font"
  | "other-font"
  | "highlight-font";

const FONT_OPTIONS = [
  "Inter", "Pacifico", "Roboto", "Elegant Bloom", "Outfit",
  "Caviar Dreams", "Space Grotesk", "Caveat", "Playfair Display", "Paper Notes",
  "Poppins", "Matcha Mint", "Montserrat", "Dancing Script", "DM Sans",
  "Comfortaa", "Syne", "Indie Flower", "Oswald", "Lobster"
];

const fontVariables: Record<string, string> = {
  "Inter": "var(--font-inter)",
  "Roboto": "var(--font-roboto)",
  "Outfit": "var(--font-outfit)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Playfair Display": "var(--font-playfair)",
  "Poppins": "var(--font-poppins)",
  "Montserrat": "var(--font-montserrat)",
  "DM Sans": "var(--font-dm-sans)",
  "Syne": "var(--font-syne)",
  "Oswald": "var(--font-oswald)",
  "Pacifico": "var(--font-pacifico)",
  "Caveat": "var(--font-caveat)",
  "Paper Notes": "var(--font-paper-notes)",
  "Matcha Mint": "var(--font-matcha-mint)",
  "Dancing Script": "var(--font-dancing-script)",
  "Comfortaa": "var(--font-comfortaa)",
  "Elegant Bloom": "var(--font-elegant-bloom)",
  "Caviar Dreams": "var(--font-caviar-dreams)",
  "Indie Flower": "var(--font-indie-flower)",
  "Lobster": "var(--font-lobster)",
};

import { useCustomizeProfile } from '../CustomizeProfileProvider';
import SaveBar from "@/components/dashboard/SaveBar";

export default function AppearanceProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const router = useRouter();

  const initialProfileBgColor = user?.profileBgColor ?? "#050505";
  const initialProfileBgOpacity = user?.profileBgOpacity ?? 100;
  const initialProfileBorderColor = user?.profileBorderColor ?? "#ffffff";
  const initialProfileBorderOpacity = user?.profileBorderOpacity ?? 100;
  const initialProfileBorderWidth = user?.profileBorderWidth ?? 0;
  const initialProfileBorderRadius = user?.profileBorderRadius ?? 24;
  const initialProfileCardBlur = user?.profileCardBlur ?? 4;
  const initialProfileBackgroundBlur = user?.profileBackgroundBlur ?? 0;
  const initialProfileShadowColor = user?.profileShadowColor ?? "#000000";
  const initialProfileShadowOpacity = user?.profileShadowOpacity ?? 0;
  const initialProfileOpacity = user?.profileOpacity ?? 100;
  const initialUsernameFont = user?.usernameFont ?? "Inter";
  const initialUsernameFontSize = user?.usernameFontSize ?? 24;
  const initialUsernameFontWeight = user?.usernameFontWeight ?? 700;
  const initialUsernameLetterSpacing = user?.usernameLetterSpacing ?? 0;

  const initialBioFont = user?.bioFont ?? "Inter";
  const initialBioFontSize = user?.bioFontSize ?? 15;
  const initialBioFontWeight = user?.bioFontWeight ?? 400;
  const initialBioLetterSpacing = user?.bioLetterSpacing ?? 0;

  const initialOtherFont = user?.otherFont ?? "Inter";
  const initialOtherFontSize = user?.otherFontSize ?? 13;
  const initialOtherFontWeight = user?.otherFontWeight ?? 400;
  const initialOtherLetterSpacing = user?.otherLetterSpacing ?? 0;

  const initialHighlightFont = user?.highlightFont ?? "Inter";
  const initialHighlightFontSize = user?.highlightFontSize ?? 13;
  const initialHighlightFontWeight = user?.highlightFontWeight ?? 400;
  const initialHighlightLetterSpacing = user?.highlightLetterSpacing ?? 0;

  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const initialCardEffect = user?.cardEffect ?? "none";
  const initialCardTransition = user?.cardTransition ?? "none";
  const cardEffect = overrides.cardEffect ?? initialCardEffect;
  const setCardEffect = (val: string) => updateOverrides({ cardEffect: val === initialCardEffect ? undefined : val });
  const cardTransition = overrides.cardTransition ?? initialCardTransition;
  const setCardTransition = (val: string) => updateOverrides({ cardTransition: val === initialCardTransition ? undefined : val });
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
  const profileOpacity = overrides.profileOpacity ?? initialProfileOpacity;
  const setProfileOpacity = (val: number) => updateOverrides({ profileOpacity: val === initialProfileOpacity ? undefined : val });
  const usernameFont = overrides.usernameFont ?? initialUsernameFont;
  const setUsernameFont = (val: string) => updateOverrides({ usernameFont: val === initialUsernameFont ? undefined : val });
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const usernameFontSize = overrides.usernameFontSize ?? initialUsernameFontSize;
  const setUsernameFontSize = (val: number) => updateOverrides({ usernameFontSize: val === initialUsernameFontSize ? undefined : val });
  const usernameFontWeight = overrides.usernameFontWeight ?? initialUsernameFontWeight;
  const setUsernameFontWeight = (val: number) => updateOverrides({ usernameFontWeight: val === initialUsernameFontWeight ? undefined : val });
  const usernameLetterSpacing = overrides.usernameLetterSpacing ?? initialUsernameLetterSpacing;
  const setUsernameLetterSpacing = (val: number) => updateOverrides({ usernameLetterSpacing: val === initialUsernameLetterSpacing ? undefined : val });

  const bioFont = overrides.bioFont ?? initialBioFont;
  const setBioFont = (val: string) => updateOverrides({ bioFont: val === initialBioFont ? undefined : val });
  const [isBioFontDropdownOpen, setIsBioFontDropdownOpen] = useState(false);
  const bioFontSize = overrides.bioFontSize ?? initialBioFontSize;
  const setBioFontSize = (val: number) => updateOverrides({ bioFontSize: val === initialBioFontSize ? undefined : val });
  const bioFontWeight = overrides.bioFontWeight ?? initialBioFontWeight;
  const setBioFontWeight = (val: number) => updateOverrides({ bioFontWeight: val === initialBioFontWeight ? undefined : val });
  const bioLetterSpacing = overrides.bioLetterSpacing ?? initialBioLetterSpacing;
  const setBioLetterSpacing = (val: number) => updateOverrides({ bioLetterSpacing: val === initialBioLetterSpacing ? undefined : val });

  const otherFont = overrides.otherFont ?? initialOtherFont;
  const setOtherFont = (val: string) => updateOverrides({ otherFont: val === initialOtherFont ? undefined : val });
  const [isOtherFontDropdownOpen, setIsOtherFontDropdownOpen] = useState(false);
  const otherFontSize = overrides.otherFontSize ?? initialOtherFontSize;
  const setOtherFontSize = (val: number) => updateOverrides({ otherFontSize: val === initialOtherFontSize ? undefined : val });
  const otherFontWeight = overrides.otherFontWeight ?? initialOtherFontWeight;
  const setOtherFontWeight = (val: number) => updateOverrides({ otherFontWeight: val === initialOtherFontWeight ? undefined : val });
  const otherLetterSpacing = overrides.otherLetterSpacing ?? initialOtherLetterSpacing;
  const setOtherLetterSpacing = (val: number) => updateOverrides({ otherLetterSpacing: val === initialOtherLetterSpacing ? undefined : val });

  const highlightFont = overrides.highlightFont ?? initialHighlightFont;
  const setHighlightFont = (val: string) => updateOverrides({ highlightFont: val === initialHighlightFont ? undefined : val });
  const [isHighlightFontDropdownOpen, setIsHighlightFontDropdownOpen] = useState(false);
  const highlightFontSize = overrides.highlightFontSize ?? initialHighlightFontSize;
  const setHighlightFontSize = (val: number) => updateOverrides({ highlightFontSize: val === initialHighlightFontSize ? undefined : val });
  const highlightFontWeight = overrides.highlightFontWeight ?? initialHighlightFontWeight;
  const setHighlightFontWeight = (val: number) => updateOverrides({ highlightFontWeight: val === initialHighlightFontWeight ? undefined : val });
  const highlightLetterSpacing = overrides.highlightLetterSpacing ?? initialHighlightLetterSpacing;
  const setHighlightLetterSpacing = (val: number) => updateOverrides({ highlightLetterSpacing: val === initialHighlightLetterSpacing ? undefined : val });

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

  const isViewsEnabled = overrides.viewsEnabled ?? initialViewsEnabled;
  const setIsViewsEnabled = (val: boolean) => updateOverrides({ viewsEnabled: val === initialViewsEnabled ? undefined : val });
  const isViewsAnimationEnabled = overrides.viewsAnimationEnabled ?? initialViewsAnimationEnabled;
  const setIsViewsAnimationEnabled = (val: boolean) => updateOverrides({ viewsAnimationEnabled: val === initialViewsAnimationEnabled ? undefined : val });
  const viewsAnimationDuration = overrides.viewsAnimationDuration ?? initialViewsAnimationDuration;
  const setViewsAnimationDuration = (val: number) => updateOverrides({ viewsAnimationDuration: val === initialViewsAnimationDuration ? undefined : val });

  const initialCommentsEnabled = user?.commentsEnabled ?? true;
  const initialShowCommentsPublicly = user?.showCommentsPublicly ?? true;
  const initialAllowNewComments = user?.allowNewComments ?? true;

  const isCommentsEnabled = overrides.commentsEnabled ?? initialCommentsEnabled;
  const setIsCommentsEnabled = (val: boolean) => updateOverrides({ commentsEnabled: val === initialCommentsEnabled ? undefined : val });
  const isShowCommentsPublicly = overrides.showCommentsPublicly ?? initialShowCommentsPublicly;
  const setIsShowCommentsPublicly = (val: boolean) => updateOverrides({ showCommentsPublicly: val === initialShowCommentsPublicly ? undefined : val });
  const isAllowNewComments = overrides.allowNewComments ?? initialAllowNewComments;
  const setIsAllowNewComments = (val: boolean) => updateOverrides({ allowNewComments: val === initialAllowNewComments ? undefined : val });

  const initialFeedbackEnabled = user?.feedbackEnabled ?? false;
  const isFeedbackEnabled = overrides.feedbackEnabled ?? initialFeedbackEnabled;
  const setIsFeedbackEnabled = (val: boolean) => updateOverrides({ feedbackEnabled: val === initialFeedbackEnabled ? undefined : val });
  const initialShowFeedbackPublicly = user?.showFeedbackPublicly ?? false;
  const isShowFeedbackPublicly = overrides.showFeedbackPublicly ?? initialShowFeedbackPublicly;
  const setIsShowFeedbackPublicly = (val: boolean) => updateOverrides({ showFeedbackPublicly: val === initialShowFeedbackPublicly ? undefined : val });

  const initialUidTooltipEnabled = user?.showUidTooltip ?? true;
  const isUidTooltipEnabled = overrides.showUidTooltip ?? initialUidTooltipEnabled;
  const setIsUidTooltipEnabled = (val: boolean) => updateOverrides({ showUidTooltip: val === initialUidTooltipEnabled ? undefined : val });

  const initialLocationTooltipEnabled = user?.showLocationTooltip ?? true;
  const isLocationTooltipEnabled = overrides.showLocationTooltip ?? initialLocationTooltipEnabled;
  const setIsLocationTooltipEnabled = (val: boolean) => updateOverrides({ showLocationTooltip: val === initialLocationTooltipEnabled ? undefined : val });

  const initialOccupationTooltipEnabled = user?.showOccupationTooltip ?? true;
  const isOccupationTooltipEnabled = overrides.showOccupationTooltip ?? initialOccupationTooltipEnabled;
  const setIsOccupationTooltipEnabled = (val: boolean) => updateOverrides({ showOccupationTooltip: val === initialOccupationTooltipEnabled ? undefined : val });

  const initialLikesTooltipEnabled = user?.showLikesTooltip ?? true;
  const isLikesTooltipEnabled = overrides.showLikesTooltip ?? initialLikesTooltipEnabled;
  const setIsLikesTooltipEnabled = (val: boolean) => updateOverrides({ showLikesTooltip: val === initialLikesTooltipEnabled ? undefined : val });

  const initialDislikesTooltipEnabled = user?.showDislikesTooltip ?? true;
  const isDislikesTooltipEnabled = overrides.showDislikesTooltip ?? initialDislikesTooltipEnabled;
  const setIsDislikesTooltipEnabled = (val: boolean) => updateOverrides({ showDislikesTooltip: val === initialDislikesTooltipEnabled ? undefined : val });

  const initialJoinDateTooltipEnabled = user?.showJoinDateTooltip ?? true;
  const isJoinDateTooltipEnabled = overrides.showJoinDateTooltip ?? initialJoinDateTooltipEnabled;
  const setIsJoinDateTooltipEnabled = (val: boolean) => updateOverrides({ showJoinDateTooltip: val === initialJoinDateTooltipEnabled ? undefined : val });

  const initialViewsTooltipEnabled = user?.showViewsTooltip ?? true;
  const isViewsTooltipEnabled = overrides.showViewsTooltip ?? initialViewsTooltipEnabled;
  const setIsViewsTooltipEnabled = (val: boolean) => updateOverrides({ showViewsTooltip: val === initialViewsTooltipEnabled ? undefined : val });

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
      {
        key: "profile-opacity",
        label: "Opacity",
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
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
            <path d="M3 21L21 3" stroke="currentColor" strokeLinecap="round" />
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
        {/* Appearance Settings Container */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-8 shadow-sm">
          {/* Profile Card */}
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
                    {/* Background Opacity */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Background Opacity
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <span className="text-[13px] text-white/30 mr-2">%</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={profileBgOpacity}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileBgOpacity(0);
                            else setProfileBgOpacity(Math.max(0, Math.min(100, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Background Color
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <label
                          className="w-5 h-5 rounded-full cursor-pointer shrink-0 mr-2"
                          style={{ backgroundColor: profileBgColor }}
                        >
                          <input
                            type="color"
                            value={profileBgColor}
                            onChange={(e) => setProfileBgColor(e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        <input
                          type="text"
                          value={profileBgColor}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "#") {
                              setProfileBgColor(v);
                            }
                          }}
                          maxLength={7}
                          className="flex-1 bg-transparent text-[13px] text-white font-mono tracking-wide focus:outline-none"
                        />
                        <span className="text-white/30 ml-1 shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {renderSectionRow(profileCardItems[2], (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Shadow Opacity */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Shadow Opacity
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <span className="text-[13px] text-white/30 mr-2">%</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={profileShadowOpacity}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileShadowOpacity(0);
                            else setProfileShadowOpacity(Math.max(0, Math.min(100, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    {/* Shadow Color */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Shadow Color
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <label
                          className="w-5 h-5 rounded-full cursor-pointer shrink-0 mr-2"
                          style={{ backgroundColor: profileShadowColor }}
                        >
                          <input
                            type="color"
                            value={profileShadowColor}
                            onChange={(e) => setProfileShadowColor(e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        <input
                          type="text"
                          value={profileShadowColor}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "#") {
                              setProfileShadowColor(v);
                            }
                          }}
                          maxLength={7}
                          className="flex-1 bg-transparent text-[13px] text-white font-mono tracking-wide focus:outline-none"
                        />
                        <span className="text-white/30 ml-1 shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {renderSectionRow(profileCardItems[4], (
                  <div className="flex flex-col gap-3">
                    <span className="text-[12.5px] font-medium text-white/90">
                      Background Opacity
                    </span>
                    <div className="relative flex items-center h-5 group w-full">
                      <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-[#5b6cf5]"
                          style={{ width: `${profileOpacity}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={profileOpacity}
                        onChange={(e) => setProfileOpacity(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div
                        className="absolute w-4 h-4 bg-[#050505] border-[2px] border-[#5b6cf5] rounded-full pointer-events-none transition-transform group-active:scale-110 shadow-lg"
                        style={{
                          left: `calc(${profileOpacity}% - 8px)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-white/30">
                      <span>0 %</span>
                      <span>50 %</span>
                      <span>100 %</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {renderSectionRow(profileCardItems[1], (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Border Width */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Width
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step={0.1}
                          value={profileBorderWidth}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileBorderWidth(0);
                            else setProfileBorderWidth(Math.max(0, Math.min(20, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    {/* Border Radius */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Radius
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={profileBorderRadius}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileBorderRadius(0);
                            else setProfileBorderRadius(Math.max(0, Math.min(100, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    {/* Border Color */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Color
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <label
                          className="w-5 h-5 rounded-full cursor-pointer shrink-0 mr-2"
                          style={{ backgroundColor: profileBorderColor }}
                        >
                          <input
                            type="color"
                            value={profileBorderColor}
                            onChange={(e) => setProfileBorderColor(e.target.value)}
                            className="opacity-0 w-full h-full cursor-pointer"
                          />
                        </label>
                        <input
                          type="text"
                          value={profileBorderColor}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || v === "#") {
                              setProfileBorderColor(v);
                            }
                          }}
                          maxLength={7}
                          className="flex-1 bg-transparent text-[13px] text-white font-mono tracking-wide focus:outline-none"
                        />
                      </div>
                    </div>
                    {/* Border Opacity */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Border Opacity
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <span className="text-[13px] text-white/30 mr-2">%</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={profileBorderOpacity}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileBorderOpacity(0);
                            else setProfileBorderOpacity(Math.max(0, Math.min(100, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {renderSectionRow(profileCardItems[3], (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Card Blur */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Card Blur
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={profileCardBlur}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileCardBlur(0);
                            else setProfileCardBlur(Math.max(0, Math.min(100, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    {/* Background Blur */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">
                        Background Blur
                      </label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={profileBackgroundBlur}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setProfileBackgroundBlur(0);
                            else setProfileBackgroundBlur(Math.max(0, Math.min(100, Number(val))));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Font Settings Container */}
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-8 shadow-sm">
          {/* Font */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="absolute"
                >
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-white font-normal text-[16px] tracking-tight">
                Font
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {renderSectionRow(
                {
                  key: "name-font",
                  label: "Username",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
                  ),
                },
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                      className="w-full flex items-center justify-between gap-3 px-3 h-[38px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      <span className="text-[12.5px] font-medium text-white/90 px-1" style={{ fontFamily: fontVariables[usernameFont] || "var(--font-inter)" }}>Font Family</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-white/50" style={{ fontFamily: fontVariables[usernameFont] || "var(--font-inter)" }}>{usernameFont}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${isFontDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </button>
                    {isFontDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {FONT_OPTIONS.map((font) => (
                          <button
                            key={font}
                            onClick={() => {
                              setUsernameFont(font);
                              setIsFontDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors ${usernameFont === font
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                              }`}
                            style={{ fontFamily: fontVariables[font] || "var(--font-inter)" }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Size</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={10}
                          max={64}
                          value={usernameFontSize}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setUsernameFontSize(0);
                            else setUsernameFontSize(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof usernameFontSize === "number") {
                              setUsernameFontSize(Math.max(10, Math.min(64, usernameFontSize)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Weight</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={100}
                          max={900}
                          step={100}
                          value={usernameFontWeight}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setUsernameFontWeight(0);
                            else setUsernameFontWeight(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof usernameFontWeight === "number") {
                              setUsernameFontWeight(Math.max(100, Math.min(900, usernameFontWeight)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={-10}
                          max={50}
                          step={0.1}
                          value={usernameLetterSpacing}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setUsernameLetterSpacing(0);
                            else setUsernameLetterSpacing(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof usernameLetterSpacing === "number") {
                              setUsernameLetterSpacing(Math.max(-10, Math.min(50, usernameLetterSpacing)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {renderSectionRow(
                {
                  key: "bio-font",
                  label: "Description",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  ),
                },
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsBioFontDropdownOpen(!isBioFontDropdownOpen)}
                      className="w-full flex items-center justify-between gap-3 px-3 h-[38px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      <span className="text-[12.5px] font-medium text-white/90 px-1" style={{ fontFamily: fontVariables[bioFont] || "var(--font-inter)" }}>Font Family</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-white/50" style={{ fontFamily: fontVariables[bioFont] || "var(--font-inter)" }}>{bioFont}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${isBioFontDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </button>
                    {isBioFontDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {FONT_OPTIONS.map((font) => (
                          <button
                            key={font}
                            onClick={() => {
                              setBioFont(font);
                              setIsBioFontDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors ${bioFont === font
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                              }`}
                            style={{ fontFamily: fontVariables[font] || "var(--font-inter)" }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Size</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={10}
                          max={64}
                          value={bioFontSize}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setBioFontSize(0);
                            else setBioFontSize(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof bioFontSize === "number") {
                              setBioFontSize(Math.max(10, Math.min(64, bioFontSize)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Weight</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={100}
                          max={900}
                          step={100}
                          value={bioFontWeight}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setBioFontWeight(0);
                            else setBioFontWeight(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof bioFontWeight === "number") {
                              setBioFontWeight(Math.max(100, Math.min(900, bioFontWeight)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={-10}
                          max={50}
                          step={0.1}
                          value={bioLetterSpacing}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setBioLetterSpacing(0);
                            else setBioLetterSpacing(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof bioLetterSpacing === "number") {
                              setBioLetterSpacing(Math.max(-10, Math.min(50, bioLetterSpacing)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {renderSectionRow(
                {
                  key: "other-font",
                  label: "Other",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  ),
                },
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsOtherFontDropdownOpen(!isOtherFontDropdownOpen)}
                      className="w-full flex items-center justify-between gap-3 px-3 h-[38px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      <span className="text-[12.5px] font-medium text-white/90 px-1" style={{ fontFamily: fontVariables[otherFont] || "var(--font-inter)" }}>Font Family</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-white/50" style={{ fontFamily: fontVariables[otherFont] || "var(--font-inter)" }}>{otherFont}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${isOtherFontDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </button>
                    {isOtherFontDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {FONT_OPTIONS.map((font) => (
                          <button
                            key={font}
                            onClick={() => {
                              setOtherFont(font);
                              setIsOtherFontDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors ${otherFont === font
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                              }`}
                            style={{ fontFamily: fontVariables[font] || "var(--font-inter)" }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Size</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={10}
                          max={64}
                          value={otherFontSize}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setOtherFontSize(0);
                            else setOtherFontSize(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof otherFontSize === "number") {
                              setOtherFontSize(Math.max(10, Math.min(64, otherFontSize)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Weight</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={100}
                          max={900}
                          step={100}
                          value={otherFontWeight}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setOtherFontWeight(0);
                            else setOtherFontWeight(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof otherFontWeight === "number") {
                              setOtherFontWeight(Math.max(100, Math.min(900, otherFontWeight)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={-10}
                          max={50}
                          step={0.1}
                          value={otherLetterSpacing}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setOtherLetterSpacing(0);
                            else setOtherLetterSpacing(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof otherLetterSpacing === "number") {
                              setOtherLetterSpacing(Math.max(-10, Math.min(50, otherLetterSpacing)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {renderSectionRow(
                {
                  key: "highlight-font",
                  label: "Highlight",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 11-6 6v3h9l3-3" />
                      <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
                    </svg>
                  ),
                },
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsHighlightFontDropdownOpen(!isHighlightFontDropdownOpen)}
                      className="w-full flex items-center justify-between gap-3 px-3 h-[38px] bg-[#161616] border border-white/5 rounded-xl transition-colors cursor-pointer text-left focus:outline-none"
                    >
                      <span className="text-[12.5px] font-medium text-white/90 px-1" style={{ fontFamily: fontVariables[highlightFont] || "var(--font-inter)" }}>Font Family</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-white/50" style={{ fontFamily: fontVariables[highlightFont] || "var(--font-inter)" }}>{highlightFont}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform duration-200 ${isHighlightFontDropdownOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
                      </div>
                    </button>
                    {isHighlightFontDropdownOpen && (
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl z-50 py-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {FONT_OPTIONS.map((font) => (
                          <button
                            key={font}
                            onClick={() => {
                              setHighlightFont(font);
                              setIsHighlightFontDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors ${highlightFont === font
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/50 hover:bg-white/5 hover:text-white"
                              }`}
                            style={{ fontFamily: fontVariables[font] || "var(--font-inter)" }}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Size</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={10}
                          max={64}
                          value={highlightFontSize}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setHighlightFontSize(0);
                            else setHighlightFontSize(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof highlightFontSize === "number") {
                              setHighlightFontSize(Math.max(10, Math.min(64, highlightFontSize)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Weight</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          min={100}
                          max={900}
                          step={100}
                          value={highlightFontWeight}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setHighlightFontWeight(0);
                            else setHighlightFontWeight(Number(val));
                          }}
                          onBlur={() => {
                            if (typeof highlightFontWeight === "number") {
                              setHighlightFontWeight(Math.max(100, Math.min(900, highlightFontWeight)));
                            }
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12.5px] font-medium text-white/90">Spacing</label>
                      <div className="flex items-center bg-[#161616] border border-white/5 rounded-xl px-3 h-[38px]">
                        <input
                          type="number"
                          step={0.1}
                          value={highlightLetterSpacing}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") setHighlightLetterSpacing(0);
                            else setHighlightLetterSpacing(Number(val));
                          }}
                          className="w-full bg-transparent text-[13px] text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[13px] text-white/30 ml-2">px</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Small half-width containers below Font */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <JoinDateSection
            isJoinDateEnabled={isJoinDateEnabled}
            setIsJoinDateEnabled={setIsJoinDateEnabled}
            joinDateFormat={joinDateFormat}
            setJoinDateFormat={setJoinDateFormat}
            isJoinDateFormatDropdownOpen={isJoinDateFormatDropdownOpen}
            setIsJoinDateFormatDropdownOpen={setIsJoinDateFormatDropdownOpen}
            joinDateFormatOptions={joinDateFormatOptions}
          />

          <ViewsSection
            isViewsEnabled={isViewsEnabled}
            setIsViewsEnabled={setIsViewsEnabled}
            isViewsAnimationEnabled={isViewsAnimationEnabled}
            setIsViewsAnimationEnabled={setIsViewsAnimationEnabled}
            viewsAnimationDuration={viewsAnimationDuration}
            setViewsAnimationDuration={setViewsAnimationDuration}
          />

          <CommentsSection
            isCommentsEnabled={isCommentsEnabled}
            setIsCommentsEnabled={setIsCommentsEnabled}
            isShowCommentsPublicly={isShowCommentsPublicly}
            setIsShowCommentsPublicly={setIsShowCommentsPublicly}
            isAllowNewComments={isAllowNewComments}
            setIsAllowNewComments={setIsAllowNewComments}
          />

          <FeedbackSection
            isFeedbackEnabled={isFeedbackEnabled}
            setIsFeedbackEnabled={setIsFeedbackEnabled}
            isShowFeedbackPublicly={isShowFeedbackPublicly}
            setIsShowFeedbackPublicly={setIsShowFeedbackPublicly}
          />

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
          />
        </div>

        <CardTransitionSection
          cardEffect={cardEffect}
          setCardEffect={setCardEffect}
          cardTransition={cardTransition}
          setCardTransition={setCardTransition}
        />

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
          profileOpacity,
          usernameFont,
          usernameFontSize,
          usernameFontWeight,
          usernameLetterSpacing,
          bioFont,
          bioFontSize,
          bioFontWeight,
          bioLetterSpacing,
          otherFont,
          otherFontSize,
          otherFontWeight,
          otherLetterSpacing,
          highlightFont,
          highlightFontSize,
          highlightFontWeight,
          highlightLetterSpacing,
          joinDateEnabled: isJoinDateEnabled,
          joinDateFormat,
          viewsEnabled: isViewsEnabled,
          viewsAnimationEnabled: isViewsAnimationEnabled,
          viewsAnimationDuration,
          commentsEnabled: isCommentsEnabled,
          feedbackEnabled: isFeedbackEnabled,
          showUidTooltip: isUidTooltipEnabled,
          showLocationTooltip: isLocationTooltipEnabled,
          showOccupationTooltip: isOccupationTooltipEnabled,
          showLikesTooltip: isLikesTooltipEnabled,
          showDislikesTooltip: isDislikesTooltipEnabled,
          showJoinDateTooltip: isJoinDateTooltipEnabled,
          showViewsTooltip: isViewsTooltipEnabled,
        }}
      />

      <SaveBar
        show={Object.keys(overrides).length > 0}
        onSave={async () => {
          try {
            await updateAppearanceProfile({
              username: user?.username || "",
              ...(overrides as Omit<Parameters<typeof updateAppearanceProfile>[0], "username">)
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

    </React.Fragment>
  );
}
