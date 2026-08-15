"use client";

import BackgroundEffectSection from "./BackgroundEffectSection";
import BorderEffectSection from "./BorderEffectSection";
import CardTransitionSection from "./CardTransitionSection";
import UsernameEffectSection from "./UsernameEffectSection";
import DescriptionEffectSection from "./DescriptionEffectSection";
import CursorTrailSection from "./CursorTrailSection";
import EntryTransitionSection from "./EntryTransitionSection";
import TapToEnterSection from "./TapToEnterSection";

interface EffectsCustomizationProps {
  backgroundEffect: string;
  setBackgroundEffect: (val: string) => void;
  backgroundEffectIntensity: number;
  setBackgroundEffectIntensity: (val: number) => void;
  backgroundEffectColor: string;
  setBackgroundEffectColor: (val: string) => void;
  backgroundEffectAboveContainer: boolean;
  setBackgroundEffectAboveContainer: (val: boolean) => void;
  borderEffect: string;
  setBorderEffect: (val: string) => void;
  borderEffectColor: string;
  setBorderEffectColor: (val: string) => void;
  cardEffect: string;
  setCardEffect: (val: string) => void;
  cardTransition: string;
  setCardTransition: (val: string) => void;
  usernameEffect: string;
  setUsernameEffect: (val: string) => void;
  descriptionEffect: string;
  setDescriptionEffect: (val: string) => void;
  cursorTrail: string;
  setCursorTrail: (val: string) => void;
  cursorTrailColor: string;
  setCursorTrailColor: (val: string) => void;
  entryTransition: string;
  setEntryTransition: (val: string) => void;
  enterScreenEnabled: boolean;
  setEnterScreenEnabled: (val: boolean) => void;
  enterScreenText: string;
  setEnterScreenText: (val: string) => void;
  enterScreenFont: string;
  setEnterScreenFont: (val: string) => void;
  enterScreenFontSize: number;
  setEnterScreenFontSize: (val: number) => void;
  enterScreenFontWeight: number;
  setEnterScreenFontWeight: (val: number) => void;
  enterScreenLetterSpacing: number;
  setEnterScreenLetterSpacing: (val: number) => void;
  enterScreenColor: string;
  setEnterScreenColor: (val: string) => void;
  enterScreenOpacity: number;
  setEnterScreenOpacity: (val: number) => void;
}

export default function EffectsCustomization({
  backgroundEffect,
  setBackgroundEffect,
  backgroundEffectIntensity,
  setBackgroundEffectIntensity,
  backgroundEffectColor,
  setBackgroundEffectColor,
  backgroundEffectAboveContainer,
  setBackgroundEffectAboveContainer,
  borderEffect,
  setBorderEffect,
  borderEffectColor,
  setBorderEffectColor,
  cardEffect,
  setCardEffect,
  cardTransition,
  setCardTransition,
  usernameEffect,
  setUsernameEffect,
  descriptionEffect,
  setDescriptionEffect,
  cursorTrail,
  setCursorTrail,
  cursorTrailColor,
  setCursorTrailColor,
  entryTransition,
  setEntryTransition,
  enterScreenEnabled,
  setEnterScreenEnabled,
  enterScreenText,
  setEnterScreenText,
  enterScreenFont,
  setEnterScreenFont,
  enterScreenFontSize,
  setEnterScreenFontSize,
  enterScreenFontWeight,
  setEnterScreenFontWeight,
  enterScreenLetterSpacing,
  setEnterScreenLetterSpacing,
  enterScreenColor,
  setEnterScreenColor,
  enterScreenOpacity,
  setEnterScreenOpacity,
}: EffectsCustomizationProps) {

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BackgroundEffectSection
            backgroundEffect={backgroundEffect}
            setBackgroundEffect={setBackgroundEffect}
            backgroundEffectIntensity={backgroundEffectIntensity}
            setBackgroundEffectIntensity={setBackgroundEffectIntensity}
            backgroundEffectColor={backgroundEffectColor}
            setBackgroundEffectColor={setBackgroundEffectColor}
            backgroundEffectAboveContainer={backgroundEffectAboveContainer}
            setBackgroundEffectAboveContainer={setBackgroundEffectAboveContainer}
          />
          <BorderEffectSection
            borderEffect={borderEffect}
            setBorderEffect={setBorderEffect}
            borderEffectColor={borderEffectColor}
            setBorderEffectColor={setBorderEffectColor}
          />
          <CardTransitionSection
            cardEffect={cardEffect}
            setCardEffect={setCardEffect}
            cardTransition={cardTransition}
            setCardTransition={setCardTransition}
          />
          <UsernameEffectSection
            usernameEffect={usernameEffect}
            setUsernameEffect={setUsernameEffect}
          />
          <DescriptionEffectSection
            descriptionEffect={descriptionEffect}
            setDescriptionEffect={setDescriptionEffect}
          />
          <CursorTrailSection
            cursorTrail={cursorTrail}
            setCursorTrail={setCursorTrail}
            cursorTrailColor={cursorTrailColor}
            setCursorTrailColor={setCursorTrailColor}
          />
          <EntryTransitionSection
            entryTransition={entryTransition}
            setEntryTransition={setEntryTransition}
          />
          <TapToEnterSection
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
          />
        </div>
      </div>
    </div>
  );
}
