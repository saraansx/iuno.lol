"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateAppearanceProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import FontGroupSection from "@/components/dashboard/customize/fonts/FontGroupSection";
import SaveBar from "@/components/dashboard/SaveBar";
import { useCustomizeProfile } from "../CustomizeProfileProvider";
import { type FullUser } from "@/lib/features/users/db";

type FontGroupKey = "username" | "description" | "other" | "highlight" | "widgets";

export default function FontsProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();
  const router = useRouter();

  const [openGroup, setOpenGroup] = useState<FontGroupKey | null>(null);
  const toggleGroup = (key: FontGroupKey) => setOpenGroup((prev) => (prev === key ? null : key));

  const initialUsernameFont = user?.usernameFont ?? "Inter";
  const initialUsernameFontSize = user?.usernameFontSize ?? 24;
  const initialUsernameFontWeight = user?.usernameFontWeight ?? 700;
  const initialUsernameLetterSpacing = user?.usernameLetterSpacing ?? 0;

  const initialBioFont = user?.bioFont ?? "Inter";
  const initialBioFontSize = user?.bioFontSize ?? 15;
  const initialBioFontWeight = user?.bioFontWeight ?? 400;
  const initialBioLetterSpacing = user?.bioLetterSpacing ?? 0;

  const initialHighlightFont = user?.highlightFont ?? "Inter";
  const initialHighlightFontSize = user?.highlightFontSize ?? 11;
  const initialHighlightFontWeight = user?.highlightFontWeight ?? 500;
  const initialHighlightLetterSpacing = user?.highlightLetterSpacing ?? 0;

  const initialWidgetFont = user?.widgetFont ?? "Inter";
  const initialWidgetFontSize = user?.widgetFontSize ?? 12.5;
  const initialWidgetFontWeight = user?.widgetFontWeight ?? 400;
  const initialWidgetLetterSpacing = user?.widgetLetterSpacing ?? 0;

  const initialOtherFont = user?.otherFont ?? "Inter";
  const initialOtherFontSize = user?.otherFontSize ?? 13;
  const initialOtherFontWeight = user?.otherFontWeight ?? 400;
  const initialOtherLetterSpacing = user?.otherLetterSpacing ?? 0;

  const usernameFont = overrides.usernameFont ?? initialUsernameFont;
  const setUsernameFont = (val: string) => updateOverrides({ usernameFont: val === initialUsernameFont ? undefined : val });
  const usernameFontSize = overrides.usernameFontSize ?? initialUsernameFontSize;
  const setUsernameFontSize = (val: number) => updateOverrides({ usernameFontSize: val === initialUsernameFontSize ? undefined : val });
  const usernameFontWeight = overrides.usernameFontWeight ?? initialUsernameFontWeight;
  const setUsernameFontWeight = (val: number) => updateOverrides({ usernameFontWeight: val === initialUsernameFontWeight ? undefined : val });
  const usernameLetterSpacing = overrides.usernameLetterSpacing ?? initialUsernameLetterSpacing;
  const setUsernameLetterSpacing = (val: number) => updateOverrides({ usernameLetterSpacing: val === initialUsernameLetterSpacing ? undefined : val });

  const bioFont = overrides.bioFont ?? initialBioFont;
  const setBioFont = (val: string) => updateOverrides({ bioFont: val === initialBioFont ? undefined : val });
  const bioFontSize = overrides.bioFontSize ?? initialBioFontSize;
  const setBioFontSize = (val: number) => updateOverrides({ bioFontSize: val === initialBioFontSize ? undefined : val });
  const bioFontWeight = overrides.bioFontWeight ?? initialBioFontWeight;
  const setBioFontWeight = (val: number) => updateOverrides({ bioFontWeight: val === initialBioFontWeight ? undefined : val });
  const bioLetterSpacing = overrides.bioLetterSpacing ?? initialBioLetterSpacing;
  const setBioLetterSpacing = (val: number) => updateOverrides({ bioLetterSpacing: val === initialBioLetterSpacing ? undefined : val });

  const highlightFont = overrides.highlightFont ?? initialHighlightFont;
  const setHighlightFont = (val: string) => updateOverrides({ highlightFont: val === initialHighlightFont ? undefined : val });
  const highlightFontSize = overrides.highlightFontSize ?? initialHighlightFontSize;
  const setHighlightFontSize = (val: number) => updateOverrides({ highlightFontSize: val === initialHighlightFontSize ? undefined : val });
  const highlightFontWeight = overrides.highlightFontWeight ?? initialHighlightFontWeight;
  const setHighlightFontWeight = (val: number) => updateOverrides({ highlightFontWeight: val === initialHighlightFontWeight ? undefined : val });
  const highlightLetterSpacing = overrides.highlightLetterSpacing ?? initialHighlightLetterSpacing;
  const setHighlightLetterSpacing = (val: number) => updateOverrides({ highlightLetterSpacing: val === initialHighlightLetterSpacing ? undefined : val });

  const widgetFont = overrides.widgetFont ?? initialWidgetFont;
  const setWidgetFont = (val: string) => updateOverrides({ widgetFont: val === initialWidgetFont ? undefined : val });
  const widgetFontSize = overrides.widgetFontSize ?? initialWidgetFontSize;
  const setWidgetFontSize = (val: number) => updateOverrides({ widgetFontSize: val === initialWidgetFontSize ? undefined : val });
  const widgetFontWeight = overrides.widgetFontWeight ?? initialWidgetFontWeight;
  const setWidgetFontWeight = (val: number) => updateOverrides({ widgetFontWeight: val === initialWidgetFontWeight ? undefined : val });
  const widgetLetterSpacing = overrides.widgetLetterSpacing ?? initialWidgetLetterSpacing;
  const setWidgetLetterSpacing = (val: number) => updateOverrides({ widgetLetterSpacing: val === initialWidgetLetterSpacing ? undefined : val });

  const otherFont = overrides.otherFont ?? initialOtherFont;
  const setOtherFont = (val: string) => updateOverrides({ otherFont: val === initialOtherFont ? undefined : val });
  const otherFontSize = overrides.otherFontSize ?? initialOtherFontSize;
  const setOtherFontSize = (val: number) => updateOverrides({ otherFontSize: val === initialOtherFontSize ? undefined : val });
  const otherFontWeight = overrides.otherFontWeight ?? initialOtherFontWeight;
  const setOtherFontWeight = (val: number) => updateOverrides({ otherFontWeight: val === initialOtherFontWeight ? undefined : val });
  const otherLetterSpacing = overrides.otherLetterSpacing ?? initialOtherLetterSpacing;
  const setOtherLetterSpacing = (val: number) => updateOverrides({ otherLetterSpacing: val === initialOtherLetterSpacing ? undefined : val });

  return (
    <React.Fragment>
      <div
        className="w-full pb-10 flex flex-col gap-6"
        style={{ paddingRight: "calc(var(--preview-width, 380px) + 2rem)" }}
      >
        <div className="bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 flex flex-col gap-8 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="#5b6cf5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h2 className="text-white font-normal text-[16px] tracking-tight">Font</h2>
            </div>

            <div className="flex flex-col gap-3">
              <FontGroupSection
                label="Username"
                hint="Your display name on the card."
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>}
                isOpen={openGroup === "username"}
                onToggle={() => toggleGroup("username")}
                font={usernameFont}
                setFont={setUsernameFont}
                size={usernameFontSize}
                setSize={setUsernameFontSize}
                weight={usernameFontWeight}
                setWeight={setUsernameFontWeight}
                spacing={usernameLetterSpacing}
                setSpacing={setUsernameLetterSpacing}
              />

              <FontGroupSection
                label="Description"
                hint="Your bio text."
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                isOpen={openGroup === "description"}
                onToggle={() => toggleGroup("description")}
                font={bioFont}
                setFont={setBioFont}
                size={bioFontSize}
                setSize={setBioFontSize}
                weight={bioFontWeight}
                setWeight={setBioFontWeight}
                spacing={bioLetterSpacing}
                setSpacing={setBioLetterSpacing}
              />

              <FontGroupSection
                label="Others"
                hint="Location, occupation, views, join date and other small text."
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>}
                isOpen={openGroup === "other"}
                onToggle={() => toggleGroup("other")}
                font={otherFont}
                setFont={setOtherFont}
                size={otherFontSize}
                setSize={setOtherFontSize}
                weight={otherFontWeight}
                setWeight={setOtherFontWeight}
                spacing={otherLetterSpacing}
                setSpacing={setOtherLetterSpacing}
              />

              <FontGroupSection
                label="Tooltips"
                hint="The dark pills that appear when a visitor hovers your card."
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></svg>}
                isOpen={openGroup === "highlight"}
                onToggle={() => toggleGroup("highlight")}
                font={highlightFont}
                setFont={setHighlightFont}
                size={highlightFontSize}
                setSize={setHighlightFontSize}
                weight={highlightFontWeight}
                setWeight={setHighlightFontWeight}
                spacing={highlightLetterSpacing}
                setSpacing={setHighlightLetterSpacing}
              />

              <FontGroupSection
                label="Widgets"
                hint="Text inside your widget cards."
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1" /><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" /></svg>}
                isOpen={openGroup === "widgets"}
                onToggle={() => toggleGroup("widgets")}
                font={widgetFont}
                setFont={setWidgetFont}
                size={widgetFontSize}
                setSize={setWidgetFontSize}
                weight={widgetFontWeight}
                setWeight={setWidgetFontWeight}
                spacing={widgetLetterSpacing}
                setSpacing={setWidgetLetterSpacing}
              />
            </div>
          </div>
        </div>
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
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
          widgetFont,
          widgetFontSize,
          widgetFontWeight,
          widgetLetterSpacing,
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
