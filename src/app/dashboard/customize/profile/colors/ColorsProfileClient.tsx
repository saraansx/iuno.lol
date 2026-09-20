"use client";

import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateColorsProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";
import ColorCustomization from "@/components/dashboard/customize/colors/ColorCustomization";
import WidgetStyleCustomization from "@/components/dashboard/customize/colors/WidgetStyleCustomization";
import BadgeStyleCustomization from "@/components/dashboard/customize/colors/BadgeStyleCustomization";
import SectionStyleCustomization from "@/components/dashboard/customize/colors/SectionStyleCustomization";
import MusicStyleCustomization from "@/components/dashboard/customize/colors/MusicStyleCustomization";

import { useCustomizeProfile } from '../CustomizeProfileProvider';

export default function ColorsProfileClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();

  const initialUsernameColor = user?.usernameColor ?? "#ffffff";
  const initialBioColor = user?.bioColor ?? "#ffffff";
  const initialOtherColor = user?.otherColor ?? "#5b6cf5";
  const initialPageBgColor = user?.pageBgColor ?? "#050505";
  const initialWidgetPrimaryTextColor = user?.widgetPrimaryTextColor ?? "#FFFFFF";
  const initialWidgetSecondaryTextColor = user?.widgetSecondaryTextColor ?? "#FFFFFF";
  const initialWidgetBorderColor = user?.widgetBorderColor ?? "#FFFFFF";

  const usernameColor = overrides.usernameColor ?? initialUsernameColor;
  const setUsernameColor = (val: string) => updateOverrides({ usernameColor: val === initialUsernameColor ? undefined : val });
  const bioColor = overrides.bioColor ?? initialBioColor;
  const setBioColor = (val: string) => updateOverrides({ bioColor: val === initialBioColor ? undefined : val });
  const otherColor = overrides.otherColor ?? initialOtherColor;
  const setOtherColor = (val: string) => updateOverrides({ otherColor: val === initialOtherColor ? undefined : val });
  const pageBgColor = overrides.pageBgColor ?? initialPageBgColor;
  const setPageBgColor = (val: string) => updateOverrides({ pageBgColor: val === initialPageBgColor ? undefined : val });

  const widgetPrimaryTextColor = overrides.widgetPrimaryTextColor ?? initialWidgetPrimaryTextColor;
  const setWidgetPrimaryTextColor = (val: string) => updateOverrides({ widgetPrimaryTextColor: val === initialWidgetPrimaryTextColor ? undefined : val });
  const widgetSecondaryTextColor = overrides.widgetSecondaryTextColor ?? initialWidgetSecondaryTextColor;
  const setWidgetSecondaryTextColor = (val: string) => updateOverrides({ widgetSecondaryTextColor: val === initialWidgetSecondaryTextColor ? undefined : val });
  const widgetBorderColor = overrides.widgetBorderColor ?? initialWidgetBorderColor;

  const initialSectionTitleColor = user?.sectionTitleColor ?? "#FFFFFF";
  const initialSectionDescColor = user?.sectionDescColor ?? "#FFFFFF";

  const sectionTitleColor = overrides.sectionTitleColor ?? initialSectionTitleColor;
  const setSectionTitleColor = (val: string) => updateOverrides({ sectionTitleColor: val === initialSectionTitleColor ? undefined : val });
  const sectionDescColor = overrides.sectionDescColor ?? initialSectionDescColor;
  const setSectionDescColor = (val: string) => updateOverrides({ sectionDescColor: val === initialSectionDescColor ? undefined : val });

  const initialMusicPrimaryColor = user?.musicPrimaryColor ?? "#FFFFFF";
  const initialMusicSecondaryColor = user?.musicSecondaryColor ?? "#FFFFFF";
  const initialMusicLyricsColor = user?.musicLyricsColor ?? "#FFFFFF";

  const musicPrimaryColor = overrides.musicPrimaryColor ?? initialMusicPrimaryColor;
  const setMusicPrimaryColor = (val: string) => updateOverrides({ musicPrimaryColor: val === initialMusicPrimaryColor ? undefined : val });
  const musicSecondaryColor = overrides.musicSecondaryColor ?? initialMusicSecondaryColor;
  const setMusicSecondaryColor = (val: string) => updateOverrides({ musicSecondaryColor: val === initialMusicSecondaryColor ? undefined : val });
  const musicLyricsColor = overrides.musicLyricsColor ?? initialMusicLyricsColor;
  const setMusicLyricsColor = (val: string) => updateOverrides({ musicLyricsColor: val === initialMusicLyricsColor ? undefined : val });

  const initialMonochromeEnabled = user?.badgeMonochromeEnabled ?? false;
  const monochromeEnabled = initialMonochromeEnabled;
  const initialMonochromeColor = user?.badgeMonochromeColor ?? "#FFFFFF";
  const monochromeColor = overrides.badgeMonochromeColor ?? initialMonochromeColor;
  const setMonochromeColor = (val: string) => updateOverrides({ badgeMonochromeColor: val === initialMonochromeColor ? undefined : val });

  const hasChanges = Object.keys(overrides).length > 0;

  const handleRevert = () => {
    clearOverrides();
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <ColorCustomization
          usernameColor={usernameColor}
          setUsernameColor={setUsernameColor}
          bioColor={bioColor}
          setBioColor={setBioColor}
          otherColor={otherColor}
          setOtherColor={setOtherColor}
          pageBgColor={pageBgColor}
          setPageBgColor={setPageBgColor}
        />

        <SectionStyleCustomization
          titleColor={sectionTitleColor}
          setTitleColor={setSectionTitleColor}
          descColor={sectionDescColor}
          setDescColor={setSectionDescColor}
        />

        <MusicStyleCustomization
          primaryColor={musicPrimaryColor}
          setPrimaryColor={setMusicPrimaryColor}
          secondaryColor={musicSecondaryColor}
          setSecondaryColor={setMusicSecondaryColor}
          lyricsColor={musicLyricsColor}
          setLyricsColor={setMusicLyricsColor}
        />

        <WidgetStyleCustomization
          primaryTextColor={widgetPrimaryTextColor}
          setPrimaryTextColor={setWidgetPrimaryTextColor}
          secondaryTextColor={widgetSecondaryTextColor}
          setSecondaryTextColor={setWidgetSecondaryTextColor}
        />

        <BadgeStyleCustomization
          monochromeColor={monochromeColor}
          setMonochromeColor={setMonochromeColor}
          monochromeEnabled={monochromeEnabled}
        />
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          usernameColor,
          bioColor,
          otherColor,
          pageBgColor,
          widgetPrimaryTextColor,
          widgetSecondaryTextColor,
          widgetBorderColor,
          sectionTitleColor,
          sectionDescColor,
          musicPrimaryColor,
          musicSecondaryColor,
          musicLyricsColor,
          badgeMonochromeColor: monochromeColor,
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateColorsProfile(overrides);
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
