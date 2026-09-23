"use client";

import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import SaveBar from "@/components/dashboard/SaveBar";
import { updateEffectsProfile } from "@/actions/profile";
import { type FullUser } from "@/lib/features/users/db";
import EffectsCustomization from "@/components/dashboard/customize/effects/EffectsCustomization";
import { toast } from "@/components/ui/toast";
import { useCustomizeProfile } from '../CustomizeProfileProvider';
import { isPremiumActive } from "@/lib/premium";
import PremiumUpsellCard from "@/components/dashboard/PremiumUpsellCard";

export default function EffectsProfileClient({ user }: { user: FullUser | null }) {
  const router = useRouter();
  const { overrides, updateOverrides, clearOverrides, scheduleClear } = useCustomizeProfile();

  const initialBackgroundEffect = user?.backgroundEffect ?? "none";
  const initialBackgroundEffectIntensity = user?.backgroundEffectIntensity ?? 50;
  const initialBackgroundEffectColor = user?.backgroundEffectColor ?? "#ffffff";
  const backgroundEffect = overrides.backgroundEffect ?? initialBackgroundEffect;
  const setBackgroundEffect = (val: string) => updateOverrides({ backgroundEffect: val === initialBackgroundEffect ? undefined : val });
  const backgroundEffectIntensity = overrides.backgroundEffectIntensity ?? initialBackgroundEffectIntensity;
  const setBackgroundEffectIntensity = (val: number) => updateOverrides({ backgroundEffectIntensity: val === initialBackgroundEffectIntensity ? undefined : val });
  const backgroundEffectColor = overrides.backgroundEffectColor ?? initialBackgroundEffectColor;
  const setBackgroundEffectColor = (val: string) => updateOverrides({ backgroundEffectColor: val === initialBackgroundEffectColor ? undefined : val });
  const initialBackgroundEffectAboveContainer = user?.backgroundEffectAboveContainer ?? false;
  const backgroundEffectAboveContainer = overrides.backgroundEffectAboveContainer ?? initialBackgroundEffectAboveContainer;
  const setBackgroundEffectAboveContainer = (val: boolean) => updateOverrides({ backgroundEffectAboveContainer: val === initialBackgroundEffectAboveContainer ? undefined : val });

  const initialBorderEffect = user?.borderEffect ?? "none";
  const initialBorderEffectColor = user?.borderEffectColor ?? "#ffffff";
  const borderEffect = overrides.borderEffect ?? initialBorderEffect;
  const setBorderEffect = (val: string) => updateOverrides({ borderEffect: val === initialBorderEffect ? undefined : val });
  const borderEffectColor = overrides.borderEffectColor ?? initialBorderEffectColor;
  const setBorderEffectColor = (val: string) => updateOverrides({ borderEffectColor: val === initialBorderEffectColor ? undefined : val });

  const initialCardEffect = user?.cardEffect ?? "none";
  const initialCardTransition = user?.cardTransition ?? "none";
  const cardEffect = overrides.cardEffect ?? initialCardEffect;
  const setCardEffect = (val: string) => updateOverrides({ cardEffect: val === initialCardEffect ? undefined : val });
  const cardTransition = overrides.cardTransition ?? initialCardTransition;
  const setCardTransition = (val: string) => updateOverrides({ cardTransition: val === initialCardTransition ? undefined : val });

  const initialUsernameEffect = user?.usernameEffect ?? "none";
  const usernameEffect = overrides.usernameEffect ?? initialUsernameEffect;
  const setUsernameEffect = (val: string) => updateOverrides({ usernameEffect: val === initialUsernameEffect ? undefined : val });
  const initialUsernameGlowEnabled = user?.usernameGlowEnabled ?? false;
  const usernameGlowEnabled = overrides.usernameGlowEnabled ?? initialUsernameGlowEnabled;
  const setUsernameGlowEnabled = (val: boolean) => updateOverrides({ usernameGlowEnabled: val === initialUsernameGlowEnabled ? undefined : val });

  const initialDescriptionEffect = user?.descriptionEffect ?? "none";
  const descriptionEffect = overrides.descriptionEffect ?? initialDescriptionEffect;
  const setDescriptionEffect = (val: string) => updateOverrides({ descriptionEffect: val === initialDescriptionEffect ? undefined : val });
  const initialDescriptionGlowEnabled = user?.descriptionGlowEnabled ?? false;
  const descriptionGlowEnabled = overrides.descriptionGlowEnabled ?? initialDescriptionGlowEnabled;
  const setDescriptionGlowEnabled = (val: boolean) => updateOverrides({ descriptionGlowEnabled: val === initialDescriptionGlowEnabled ? undefined : val });

  const initialClickEffect = user?.clickEffect ?? "none";
  const clickEffect = overrides.clickEffect ?? initialClickEffect;
  const setClickEffect = (val: string) => updateOverrides({ clickEffect: val === initialClickEffect ? undefined : val });

  const initialClickSound = user?.clickSound ?? "none";
  const clickSound = overrides.clickSound ?? initialClickSound;
  const setClickSound = (val: string) => updateOverrides({ clickSound: val === initialClickSound ? undefined : val });

  const initialCursorTrail = user?.cursorTrail ?? "none";
  const initialCursorTrailColor = user?.cursorTrailColor ?? "#ffffff";
  const cursorTrail = overrides.cursorTrail ?? initialCursorTrail;
  const setCursorTrail = (val: string) => updateOverrides({ cursorTrail: val === initialCursorTrail ? undefined : val });
  const cursorTrailColor = overrides.cursorTrailColor ?? initialCursorTrailColor;
  const setCursorTrailColor = (val: string) => updateOverrides({ cursorTrailColor: val === initialCursorTrailColor ? undefined : val });

  const initialEntryTransition = user?.entryTransition ?? "none";
  const entryTransition = overrides.entryTransition ?? initialEntryTransition;
  const setEntryTransition = (val: string) => updateOverrides({ entryTransition: val === initialEntryTransition ? undefined : val });

  const initialEnterScreenEnabled = user?.enterScreenEnabled ?? false;
  const initialEnterScreenText = user?.enterScreenText ?? "click to enter";
  const initialEnterScreenFont = user?.enterScreenFont ?? "Inter";
  const initialEnterScreenFontSize = user?.enterScreenFontSize ?? 14;
  const initialEnterScreenFontWeight = user?.enterScreenFontWeight ?? 500;
  const initialEnterScreenLetterSpacing = user?.enterScreenLetterSpacing ?? 2;
  const initialEnterScreenColor = user?.enterScreenColor ?? "#ffffff";
  const initialEnterScreenOpacity = user?.enterScreenOpacity ?? 80;
  const initialEnterScreenBlur = user?.enterScreenBlur ?? 16;
  const initialEnterScreenBlurColor = user?.enterScreenBlurColor ?? "#000000";

  const enterScreenEnabled = overrides.enterScreenEnabled ?? initialEnterScreenEnabled;
  const setEnterScreenEnabled = (val: boolean) => updateOverrides({ enterScreenEnabled: val === initialEnterScreenEnabled ? undefined : val });
  const enterScreenText = overrides.enterScreenText ?? initialEnterScreenText;
  const setEnterScreenText = (val: string) => updateOverrides({ enterScreenText: val === initialEnterScreenText ? undefined : val });
  const enterScreenFont = overrides.enterScreenFont ?? initialEnterScreenFont;
  const setEnterScreenFont = (val: string) => updateOverrides({ enterScreenFont: val === initialEnterScreenFont ? undefined : val });
  const enterScreenFontSize = overrides.enterScreenFontSize ?? initialEnterScreenFontSize;
  const setEnterScreenFontSize = (val: number) => updateOverrides({ enterScreenFontSize: val === initialEnterScreenFontSize ? undefined : val });
  const enterScreenFontWeight = overrides.enterScreenFontWeight ?? initialEnterScreenFontWeight;
  const setEnterScreenFontWeight = (val: number) => updateOverrides({ enterScreenFontWeight: val === initialEnterScreenFontWeight ? undefined : val });
  const enterScreenLetterSpacing = overrides.enterScreenLetterSpacing ?? initialEnterScreenLetterSpacing;
  const setEnterScreenLetterSpacing = (val: number) => updateOverrides({ enterScreenLetterSpacing: val === initialEnterScreenLetterSpacing ? undefined : val });
  const enterScreenColor = overrides.enterScreenColor ?? initialEnterScreenColor;
  const setEnterScreenColor = (val: string) => updateOverrides({ enterScreenColor: val === initialEnterScreenColor ? undefined : val });
  const enterScreenOpacity = overrides.enterScreenOpacity ?? initialEnterScreenOpacity;
  const setEnterScreenOpacity = (val: number) => updateOverrides({ enterScreenOpacity: val === initialEnterScreenOpacity ? undefined : val });
  const enterScreenBlur = overrides.enterScreenBlur ?? initialEnterScreenBlur;
  const setEnterScreenBlur = (val: number) => updateOverrides({ enterScreenBlur: val === initialEnterScreenBlur ? undefined : val });
  const enterScreenBlurColor = overrides.enterScreenBlurColor ?? initialEnterScreenBlurColor;
  const setEnterScreenBlurColor = (val: string) => updateOverrides({ enterScreenBlurColor: val === initialEnterScreenBlurColor ? undefined : val });

  const hasChanges = Object.keys(overrides).length > 0;

  const handleRevert = () => {
    clearOverrides();
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-6 pr-[calc(var(--preview-width,380px)+2rem)] pb-20">
        <EffectsCustomization
          isPremium={isPremiumActive(user)}
          backgroundEffect={backgroundEffect}
          setBackgroundEffect={setBackgroundEffect}
          backgroundEffectIntensity={backgroundEffectIntensity}
          setBackgroundEffectIntensity={setBackgroundEffectIntensity}
          backgroundEffectColor={backgroundEffectColor}
          setBackgroundEffectColor={setBackgroundEffectColor}
          backgroundEffectAboveContainer={backgroundEffectAboveContainer}
          setBackgroundEffectAboveContainer={setBackgroundEffectAboveContainer}
          borderEffect={borderEffect}
          setBorderEffect={setBorderEffect}
          borderEffectColor={borderEffectColor}
          setBorderEffectColor={setBorderEffectColor}
          cardEffect={cardEffect}
          setCardEffect={setCardEffect}
          cardTransition={cardTransition}
          setCardTransition={setCardTransition}
          usernameEffect={usernameEffect}
          setUsernameEffect={setUsernameEffect}
          usernameGlowEnabled={usernameGlowEnabled}
          setUsernameGlowEnabled={setUsernameGlowEnabled}
          descriptionEffect={descriptionEffect}
          setDescriptionEffect={setDescriptionEffect}
          descriptionGlowEnabled={descriptionGlowEnabled}
          setDescriptionGlowEnabled={setDescriptionGlowEnabled}
          clickEffect={clickEffect}
          setClickEffect={setClickEffect}
          clickSound={clickSound}
          setClickSound={setClickSound}
          cursorTrail={cursorTrail}
          setCursorTrail={setCursorTrail}
          cursorTrailColor={cursorTrailColor}
          setCursorTrailColor={setCursorTrailColor}
          entryTransition={entryTransition}
          setEntryTransition={setEntryTransition}
          enterScreenEnabled={enterScreenEnabled}
          setEnterScreenEnabled={setEnterScreenEnabled}
          enterScreenText={enterScreenText}
          setEnterScreenText={setEnterScreenText}
          enterScreenFont={enterScreenFont}
          setEnterScreenFont={setEnterScreenFont}
          enterScreenFontSize={enterScreenFontSize}
          setEnterScreenFontSize={setEnterScreenFontSize}
          enterScreenFontWeight={enterScreenFontWeight}
          setEnterScreenFontWeight={setEnterScreenFontWeight}
          enterScreenLetterSpacing={enterScreenLetterSpacing}
          setEnterScreenLetterSpacing={setEnterScreenLetterSpacing}
          enterScreenColor={enterScreenColor}
          setEnterScreenColor={setEnterScreenColor}
          enterScreenOpacity={enterScreenOpacity}
          setEnterScreenOpacity={setEnterScreenOpacity}
          enterScreenBlur={enterScreenBlur}
          setEnterScreenBlur={setEnterScreenBlur}
          enterScreenBlurColor={enterScreenBlurColor}
          setEnterScreenBlurColor={setEnterScreenBlurColor}
        />
        {!isPremiumActive(user) && <PremiumUpsellCard />}
      </div>

      <DashboardProfilePreview
        user={user}
        overrides={{
          ...overrides,
          backgroundEffect,
          backgroundEffectIntensity,
          backgroundEffectColor,
          backgroundEffectAboveContainer,
          borderEffect,
          borderEffectColor,
          cardEffect,
          cardTransition,
          usernameEffect,
          descriptionEffect,
          usernameGlowEnabled,
          descriptionGlowEnabled,
          clickEffect,
          clickSound,
          cursorTrail,
          cursorTrailColor,
          entryTransition,
          enterScreenEnabled,
          enterScreenText,
          enterScreenFont,
          enterScreenFontSize,
          enterScreenFontWeight,
          enterScreenLetterSpacing,
          enterScreenColor,
          enterScreenOpacity,
          enterScreenBlur,
          enterScreenBlurColor,
        }}
      />

      <SaveBar
        show={hasChanges}
        onSave={async () => {
          try {
            await updateEffectsProfile(overrides);
            toast.success("Profile Saved Sucessfully");
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error("Failed to save effects");
          }
        }}
        onRevert={handleRevert}
      />
    </>
  );
}
