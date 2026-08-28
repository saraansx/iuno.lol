"use client";

import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateColorsProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";
import { type FullUser } from "@/lib/features/users/db";
import ColorCustomization from "@/components/dashboard/customize/colors/ColorCustomization";
import WidgetStyleCustomization from "@/components/dashboard/customize/colors/WidgetStyleCustomization";

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
  const setWidgetBorderColor = (val: string) => updateOverrides({ widgetBorderColor: val === initialWidgetBorderColor ? undefined : val });

  const hasChanges = Object.keys(overrides).length > 0;

  const handleRevert = () => {
    clearOverrides();
  };

  return (
    <>
      {/* Settings Content */}
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

        <WidgetStyleCustomization
          primaryTextColor={widgetPrimaryTextColor}
          setPrimaryTextColor={setWidgetPrimaryTextColor}
          secondaryTextColor={widgetSecondaryTextColor}
          setSecondaryTextColor={setWidgetSecondaryTextColor}
          borderColor={widgetBorderColor}
          setBorderColor={setWidgetBorderColor}
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
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateColorsProfile({
              username: user?.username || "",
              ...overrides
            });
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
