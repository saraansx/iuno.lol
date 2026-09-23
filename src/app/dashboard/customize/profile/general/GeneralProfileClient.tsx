"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardProfilePreview from "@/components/dashboard/DashboardProfilePreview";
import { updateGeneralProfile } from "@/actions/profile";
import { toast } from "@/components/ui/toast";

import AssetsSection from "@/components/dashboard/customize/general/AssetsSection";
import GeneralInfoSection from "@/components/dashboard/customize/general/GeneralInfoSection";
import AvatarUploadModal from "@/components/dashboard/AvatarUploadModal";
import BannerUpload from "@/components/dashboard/uploads/BannerUpload";
import BackgroundUpload from "@/components/dashboard/uploads/BackgroundUpload";
import DecorationPicker, { type Decoration } from "@/components/dashboard/DecorationPicker";
import EffectsPicker from "@/components/dashboard/EffectsPicker";
import { isVideoUrl } from "@/lib/utils/media";
import { isAnimatedBackgroundUrl, AURORA_DEFAULTS, DARKVEIL_DEFAULTS, PIXELBLAST_DEFAULTS, COLORBENDS_DEFAULTS, LIQUIDCHROME_DEFAULTS, CRTWARP_DEFAULTS } from "@/lib/animated-background";
import decorations from "@/Deco.json";
import effects from "@/effects.json";

import { type FullUser } from "@/lib/features/users/db";

import { useCustomizeProfile } from '../CustomizeProfileProvider';
import SaveBar from "@/components/dashboard/SaveBar";

export default function GeneralProfileClient({ user }: { user: FullUser | null }) {
  const { overrides, updateOverrides, clearOverrides, scheduleClear, pendingFiles, setPendingFile, clearPendingFiles } = useCustomizeProfile();
  const router = useRouter();
  const initialDisplayName = user?.displayName ?? "";
  const initialLocation = user?.location ?? "";
  const initialOccupation = user?.occupation ?? "";
  const initialBio = user?.bio ?? "";
  const initialAvatarUrl = user?.avatarUrl ?? "";
  const initialAvatarShape = (user?.avatarShape as "square" | "soft" | "rounded" | "circle") ?? "circle";
  const initialDecorationUrl = user?.avatarDecorationUrl ?? null;
  const initialDecorationHue = user?.avatarDecorationHue ?? 0;
  const initialEffectUrl = user?.profileEffectUrl ?? null;
  const initialEffectHue = user?.profileEffectHue ?? 0;
  const initialBannerImageUrl = user?.bannerImageUrl ?? "";
  const initialBannerBlend = user?.bannerBlend ?? false;
  const initialBannerBackgroundUrl = user?.bannerBackgroundUrl ?? "";
  const displayName = overrides.displayName ?? initialDisplayName;
  const setDisplayName = (val: string) => updateOverrides({ displayName: val === initialDisplayName ? undefined : val });
  const location = overrides.location ?? initialLocation;
  const setLocation = (val: string) => updateOverrides({ location: val === initialLocation ? undefined : val });
  const occupation = overrides.occupation ?? initialOccupation;
  const setOccupation = (val: string) => updateOverrides({ occupation: val === initialOccupation ? undefined : val });
  const bio = overrides.bio ?? initialBio;
  const setBio = (val: string) => updateOverrides({ bio: val === initialBio ? undefined : val });
  const avatarUrl = overrides.avatarUrl ?? initialAvatarUrl;
  const setAvatarUrl = (val: string) => updateOverrides({ avatarUrl: val === initialAvatarUrl ? undefined : val });
  const avatarShape = overrides.avatarShape ?? initialAvatarShape;
  const setAvatarShape = (val: "square" | "soft" | "rounded" | "circle") => updateOverrides({ avatarShape: val === initialAvatarShape ? undefined : val });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const bannerImageUrl = overrides.bannerImageUrl ?? initialBannerImageUrl;
  const setBannerImageUrl = (val: string) => updateOverrides({ bannerImageUrl: val === initialBannerImageUrl ? undefined : val });
  const bannerBlend = overrides.bannerBlend !== undefined ? Boolean(overrides.bannerBlend) : Boolean(initialBannerBlend);
  const setBannerBlend = (val: boolean) => updateOverrides({ bannerBlend: val === initialBannerBlend ? undefined : val });
  const bannerBackgroundUrl = overrides.bannerBackgroundUrl ?? initialBannerBackgroundUrl;
  const setBannerBackgroundUrl = (val: string) => updateOverrides({ bannerBackgroundUrl: val === initialBannerBackgroundUrl ? undefined : val });
  const initialBannerBackgroundUrl2 = user?.bannerBackgroundUrl2 ?? "";
  const bannerBackgroundUrl2 = overrides.bannerBackgroundUrl2 ?? initialBannerBackgroundUrl2;
  const setBannerBackgroundUrl2 = (val: string) => updateOverrides({ bannerBackgroundUrl2: val === initialBannerBackgroundUrl2 ? undefined : val });
  const initialBannerBackgroundShuffle = user?.bannerBackgroundShuffle ?? false;
  const bannerBackgroundShuffle = overrides.bannerBackgroundShuffle !== undefined ? Boolean(overrides.bannerBackgroundShuffle) : Boolean(initialBannerBackgroundShuffle);
  const setBannerBackgroundShuffle = (val: boolean) => updateOverrides({ bannerBackgroundShuffle: val === initialBannerBackgroundShuffle ? undefined : val });
  const initialBannerBackgroundAutoplay = user?.bannerBackgroundAutoplay ?? true;
  const bannerBackgroundAutoplay = overrides.bannerBackgroundAutoplay !== undefined ? Boolean(overrides.bannerBackgroundAutoplay) : Boolean(initialBannerBackgroundAutoplay);
  const setBannerBackgroundAutoplay = (val: boolean) => updateOverrides({ bannerBackgroundAutoplay: val === initialBannerBackgroundAutoplay ? undefined : val });
  const initialBannerBackgroundSound = user?.bannerBackgroundSound ?? false;
  const bannerBackgroundSound = overrides.bannerBackgroundSound !== undefined ? Boolean(overrides.bannerBackgroundSound) : Boolean(initialBannerBackgroundSound);
  const setBannerBackgroundSound = (val: boolean) => updateOverrides({ bannerBackgroundSound: val === initialBannerBackgroundSound ? undefined : val });
  const initialAuroraColor1 = user?.auroraColor1 ?? AURORA_DEFAULTS.color1;
  const initialAuroraColor2 = user?.auroraColor2 ?? AURORA_DEFAULTS.color2;
  const initialAuroraColor3 = user?.auroraColor3 ?? AURORA_DEFAULTS.color3;
  const initialAuroraSpeed = user?.auroraSpeed ?? AURORA_DEFAULTS.speed;
  const initialAuroraBlend = user?.auroraBlend ?? AURORA_DEFAULTS.blend;
  const auroraColor1 = overrides.auroraColor1 ?? initialAuroraColor1;
  const setAuroraColor1 = (val: string) => updateOverrides({ auroraColor1: val === initialAuroraColor1 ? undefined : val });
  const auroraColor2 = overrides.auroraColor2 ?? initialAuroraColor2;
  const setAuroraColor2 = (val: string) => updateOverrides({ auroraColor2: val === initialAuroraColor2 ? undefined : val });
  const auroraColor3 = overrides.auroraColor3 ?? initialAuroraColor3;
  const setAuroraColor3 = (val: string) => updateOverrides({ auroraColor3: val === initialAuroraColor3 ? undefined : val });
  const auroraSpeed = overrides.auroraSpeed ?? initialAuroraSpeed;
  const setAuroraSpeed = (val: number) => updateOverrides({ auroraSpeed: val === initialAuroraSpeed ? undefined : val });
  const auroraBlend = overrides.auroraBlend ?? initialAuroraBlend;
  const setAuroraBlend = (val: number) => updateOverrides({ auroraBlend: val === initialAuroraBlend ? undefined : val });
  const initialDarkveilSpeed = user?.darkveilSpeed ?? DARKVEIL_DEFAULTS.speed;
  const initialDarkveilHueShift = user?.darkveilHueShift ?? DARKVEIL_DEFAULTS.hueShift;
  const initialDarkveilNoise = user?.darkveilNoise ?? DARKVEIL_DEFAULTS.noiseIntensity;
  const initialDarkveilScanFreq = user?.darkveilScanFreq ?? DARKVEIL_DEFAULTS.scanlineFrequency;
  const initialDarkveilScan = user?.darkveilScan ?? DARKVEIL_DEFAULTS.scanlineIntensity;
  const initialDarkveilWarp = user?.darkveilWarp ?? DARKVEIL_DEFAULTS.warpAmount;
  const darkveilSpeed = overrides.darkveilSpeed ?? initialDarkveilSpeed;
  const setDarkveilSpeed = (val: number) => updateOverrides({ darkveilSpeed: val === initialDarkveilSpeed ? undefined : val });
  const darkveilHueShift = overrides.darkveilHueShift ?? initialDarkveilHueShift;
  const setDarkveilHueShift = (val: number) => updateOverrides({ darkveilHueShift: val === initialDarkveilHueShift ? undefined : val });
  const darkveilNoise = overrides.darkveilNoise ?? initialDarkveilNoise;
  const setDarkveilNoise = (val: number) => updateOverrides({ darkveilNoise: val === initialDarkveilNoise ? undefined : val });
  const darkveilScanFreq = overrides.darkveilScanFreq ?? initialDarkveilScanFreq;
  const setDarkveilScanFreq = (val: number) => updateOverrides({ darkveilScanFreq: val === initialDarkveilScanFreq ? undefined : val });
  const darkveilScan = overrides.darkveilScan ?? initialDarkveilScan;
  const setDarkveilScan = (val: number) => updateOverrides({ darkveilScan: val === initialDarkveilScan ? undefined : val });
  const darkveilWarp = overrides.darkveilWarp ?? initialDarkveilWarp;
  const setDarkveilWarp = (val: number) => updateOverrides({ darkveilWarp: val === initialDarkveilWarp ? undefined : val });
  const initialPixelblastColor = user?.pixelblastColor ?? PIXELBLAST_DEFAULTS.color;
  const initialPixelblastVariant = user?.pixelblastVariant ?? PIXELBLAST_DEFAULTS.variant;
  const initialPixelblastPixelSize = user?.pixelblastPixelSize ?? PIXELBLAST_DEFAULTS.pixelSize;
  const initialPixelblastPatternScale = user?.pixelblastPatternScale ?? PIXELBLAST_DEFAULTS.patternScale;
  const initialPixelblastPatternDensity = user?.pixelblastPatternDensity ?? PIXELBLAST_DEFAULTS.patternDensity;
  const initialPixelblastPixelJitter = user?.pixelblastPixelJitter ?? PIXELBLAST_DEFAULTS.pixelJitter;
  const initialPixelblastSpeed = user?.pixelblastSpeed ?? PIXELBLAST_DEFAULTS.speed;
  const initialPixelblastEdgeFade = user?.pixelblastEdgeFade ?? PIXELBLAST_DEFAULTS.edgeFade;
  const initialPixelblastRipples = user?.pixelblastRipples ?? PIXELBLAST_DEFAULTS.ripples;
  const initialPixelblastLiquid = user?.pixelblastLiquid ?? PIXELBLAST_DEFAULTS.liquid;
  const pixelblastColor = overrides.pixelblastColor ?? initialPixelblastColor;
  const setPixelblastColor = (val: string) => updateOverrides({ pixelblastColor: val === initialPixelblastColor ? undefined : val });
  const pixelblastVariant = overrides.pixelblastVariant ?? initialPixelblastVariant;
  const setPixelblastVariant = (val: string) => updateOverrides({ pixelblastVariant: val === initialPixelblastVariant ? undefined : val });
  const pixelblastPixelSize = overrides.pixelblastPixelSize ?? initialPixelblastPixelSize;
  const setPixelblastPixelSize = (val: number) => updateOverrides({ pixelblastPixelSize: val === initialPixelblastPixelSize ? undefined : val });
  const pixelblastPatternScale = overrides.pixelblastPatternScale ?? initialPixelblastPatternScale;
  const setPixelblastPatternScale = (val: number) => updateOverrides({ pixelblastPatternScale: val === initialPixelblastPatternScale ? undefined : val });
  const pixelblastPatternDensity = overrides.pixelblastPatternDensity ?? initialPixelblastPatternDensity;
  const setPixelblastPatternDensity = (val: number) => updateOverrides({ pixelblastPatternDensity: val === initialPixelblastPatternDensity ? undefined : val });
  const pixelblastPixelJitter = overrides.pixelblastPixelJitter ?? initialPixelblastPixelJitter;
  const setPixelblastPixelJitter = (val: number) => updateOverrides({ pixelblastPixelJitter: val === initialPixelblastPixelJitter ? undefined : val });
  const pixelblastSpeed = overrides.pixelblastSpeed ?? initialPixelblastSpeed;
  const setPixelblastSpeed = (val: number) => updateOverrides({ pixelblastSpeed: val === initialPixelblastSpeed ? undefined : val });
  const pixelblastEdgeFade = overrides.pixelblastEdgeFade ?? initialPixelblastEdgeFade;
  const setPixelblastEdgeFade = (val: number) => updateOverrides({ pixelblastEdgeFade: val === initialPixelblastEdgeFade ? undefined : val });
  const pixelblastRipples = overrides.pixelblastRipples !== undefined ? Boolean(overrides.pixelblastRipples) : Boolean(initialPixelblastRipples);
  const setPixelblastRipples = (val: boolean) => updateOverrides({ pixelblastRipples: val === initialPixelblastRipples ? undefined : val });
  const pixelblastLiquid = overrides.pixelblastLiquid !== undefined ? Boolean(overrides.pixelblastLiquid) : Boolean(initialPixelblastLiquid);
  const setPixelblastLiquid = (val: boolean) => updateOverrides({ pixelblastLiquid: val === initialPixelblastLiquid ? undefined : val });
  const initialColorbendsColor = user?.colorbendsColor ?? COLORBENDS_DEFAULTS.color;
  const initialColorbendsRotation = user?.colorbendsRotation ?? COLORBENDS_DEFAULTS.rotation;
  const initialColorbendsAutoRotate = user?.colorbendsAutoRotate ?? COLORBENDS_DEFAULTS.autoRotate;
  const initialColorbendsSpeed = user?.colorbendsSpeed ?? COLORBENDS_DEFAULTS.speed;
  const initialColorbendsScale = user?.colorbendsScale ?? COLORBENDS_DEFAULTS.scale;
  const initialColorbendsFrequency = user?.colorbendsFrequency ?? COLORBENDS_DEFAULTS.frequency;
  const initialColorbendsWarp = user?.colorbendsWarp ?? COLORBENDS_DEFAULTS.warpStrength;
  const initialColorbendsMouse = user?.colorbendsMouse ?? COLORBENDS_DEFAULTS.mouseInfluence;
  const initialColorbendsParallax = user?.colorbendsParallax ?? COLORBENDS_DEFAULTS.parallax;
  const initialColorbendsNoise = user?.colorbendsNoise ?? COLORBENDS_DEFAULTS.noise;
  const initialColorbendsIterations = user?.colorbendsIterations ?? COLORBENDS_DEFAULTS.iterations;
  const initialColorbendsIntensity = user?.colorbendsIntensity ?? COLORBENDS_DEFAULTS.intensity;
  const initialColorbendsBandWidth = user?.colorbendsBandWidth ?? COLORBENDS_DEFAULTS.bandWidth;
  const colorbendsColor = overrides.colorbendsColor ?? initialColorbendsColor;
  const setColorbendsColor = (val: string) => updateOverrides({ colorbendsColor: val === initialColorbendsColor ? undefined : val });
  const colorbendsRotation = overrides.colorbendsRotation ?? initialColorbendsRotation;
  const setColorbendsRotation = (val: number) => updateOverrides({ colorbendsRotation: val === initialColorbendsRotation ? undefined : val });
  const colorbendsAutoRotate = overrides.colorbendsAutoRotate ?? initialColorbendsAutoRotate;
  const setColorbendsAutoRotate = (val: number) => updateOverrides({ colorbendsAutoRotate: val === initialColorbendsAutoRotate ? undefined : val });
  const colorbendsSpeed = overrides.colorbendsSpeed ?? initialColorbendsSpeed;
  const setColorbendsSpeed = (val: number) => updateOverrides({ colorbendsSpeed: val === initialColorbendsSpeed ? undefined : val });
  const colorbendsScale = overrides.colorbendsScale ?? initialColorbendsScale;
  const setColorbendsScale = (val: number) => updateOverrides({ colorbendsScale: val === initialColorbendsScale ? undefined : val });
  const colorbendsFrequency = overrides.colorbendsFrequency ?? initialColorbendsFrequency;
  const setColorbendsFrequency = (val: number) => updateOverrides({ colorbendsFrequency: val === initialColorbendsFrequency ? undefined : val });
  const colorbendsWarp = overrides.colorbendsWarp ?? initialColorbendsWarp;
  const setColorbendsWarp = (val: number) => updateOverrides({ colorbendsWarp: val === initialColorbendsWarp ? undefined : val });
  const colorbendsMouse = overrides.colorbendsMouse ?? initialColorbendsMouse;
  const setColorbendsMouse = (val: number) => updateOverrides({ colorbendsMouse: val === initialColorbendsMouse ? undefined : val });
  const colorbendsParallax = overrides.colorbendsParallax ?? initialColorbendsParallax;
  const setColorbendsParallax = (val: number) => updateOverrides({ colorbendsParallax: val === initialColorbendsParallax ? undefined : val });
  const colorbendsNoise = overrides.colorbendsNoise ?? initialColorbendsNoise;
  const setColorbendsNoise = (val: number) => updateOverrides({ colorbendsNoise: val === initialColorbendsNoise ? undefined : val });
  const colorbendsIterations = overrides.colorbendsIterations ?? initialColorbendsIterations;
  const setColorbendsIterations = (val: number) => updateOverrides({ colorbendsIterations: val === initialColorbendsIterations ? undefined : val });
  const colorbendsIntensity = overrides.colorbendsIntensity ?? initialColorbendsIntensity;
  const setColorbendsIntensity = (val: number) => updateOverrides({ colorbendsIntensity: val === initialColorbendsIntensity ? undefined : val });
  const colorbendsBandWidth = overrides.colorbendsBandWidth ?? initialColorbendsBandWidth;
  const setColorbendsBandWidth = (val: number) => updateOverrides({ colorbendsBandWidth: val === initialColorbendsBandWidth ? undefined : val });
  const initialLiquidchromeColor = user?.liquidchromeColor ?? LIQUIDCHROME_DEFAULTS.color;
  const initialLiquidchromeSpeed = user?.liquidchromeSpeed ?? LIQUIDCHROME_DEFAULTS.speed;
  const initialLiquidchromeAmplitude = user?.liquidchromeAmplitude ?? LIQUIDCHROME_DEFAULTS.amplitude;
  const initialLiquidchromeInteractive = user?.liquidchromeInteractive ?? LIQUIDCHROME_DEFAULTS.interactive;
  const liquidchromeColor = overrides.liquidchromeColor ?? initialLiquidchromeColor;
  const setLiquidchromeColor = (val: string) => updateOverrides({ liquidchromeColor: val === initialLiquidchromeColor ? undefined : val });
  const liquidchromeSpeed = overrides.liquidchromeSpeed ?? initialLiquidchromeSpeed;
  const setLiquidchromeSpeed = (val: number) => updateOverrides({ liquidchromeSpeed: val === initialLiquidchromeSpeed ? undefined : val });
  const liquidchromeAmplitude = overrides.liquidchromeAmplitude ?? initialLiquidchromeAmplitude;
  const setLiquidchromeAmplitude = (val: number) => updateOverrides({ liquidchromeAmplitude: val === initialLiquidchromeAmplitude ? undefined : val });
  const liquidchromeInteractive = overrides.liquidchromeInteractive !== undefined ? Boolean(overrides.liquidchromeInteractive) : Boolean(initialLiquidchromeInteractive);
  const setLiquidchromeInteractive = (val: boolean) => updateOverrides({ liquidchromeInteractive: val === initialLiquidchromeInteractive ? undefined : val });
  const initialCrtwarpColor = user?.crtwarpColor ?? CRTWARP_DEFAULTS.color;
  const initialCrtwarpBackground = user?.crtwarpBackground ?? CRTWARP_DEFAULTS.background;
  const initialCrtwarpSpeed = user?.crtwarpSpeed ?? CRTWARP_DEFAULTS.speed;
  const initialCrtwarpCurvature = user?.crtwarpCurvature ?? CRTWARP_DEFAULTS.curvature;
  const initialCrtwarpWaveAmount = user?.crtwarpWaveAmount ?? CRTWARP_DEFAULTS.waveAmount;
  const initialCrtwarpWaveDensity = user?.crtwarpWaveDensity ?? CRTWARP_DEFAULTS.waveDensity;
  const initialCrtwarpScanStrength = user?.crtwarpScanStrength ?? CRTWARP_DEFAULTS.scanStrength;
  const initialCrtwarpScanDensity = user?.crtwarpScanDensity ?? CRTWARP_DEFAULTS.scanDensity;
  const initialCrtwarpBloom = user?.crtwarpBloom ?? CRTWARP_DEFAULTS.bloom;
  const initialCrtwarpBloomRadius = user?.crtwarpBloomRadius ?? CRTWARP_DEFAULTS.bloomRadius;
  const initialCrtwarpNoise = user?.crtwarpNoise ?? CRTWARP_DEFAULTS.noise;
  const initialCrtwarpVignette = user?.crtwarpVignette ?? CRTWARP_DEFAULTS.vignette;
  const initialCrtwarpBrightness = user?.crtwarpBrightness ?? CRTWARP_DEFAULTS.brightness;
  const initialCrtwarpRgbShift = user?.crtwarpRgbShift ?? CRTWARP_DEFAULTS.rgbShift;
  const initialCrtwarpPixelSize = user?.crtwarpPixelSize ?? CRTWARP_DEFAULTS.pixelSize;
  const initialCrtwarpRenderQuality = user?.crtwarpRenderQuality ?? CRTWARP_DEFAULTS.renderQuality;
  const initialCrtwarpFrameRate = user?.crtwarpFrameRate ?? CRTWARP_DEFAULTS.frameRate;
  const initialCrtwarpPointerWarp = user?.crtwarpPointerWarp ?? CRTWARP_DEFAULTS.pointerWarp;
  const initialCrtwarpPointerStrength = user?.crtwarpPointerStrength ?? CRTWARP_DEFAULTS.pointerStrength;
  const initialCrtwarpPaused = user?.crtwarpPaused ?? CRTWARP_DEFAULTS.paused;
  const crtwarpColor = overrides.crtwarpColor ?? initialCrtwarpColor;
  const setCrtwarpColor = (val: string) => updateOverrides({ crtwarpColor: val === initialCrtwarpColor ? undefined : val });
  const crtwarpBackground = overrides.crtwarpBackground ?? initialCrtwarpBackground;
  const setCrtwarpBackground = (val: string) => updateOverrides({ crtwarpBackground: val === initialCrtwarpBackground ? undefined : val });
  const crtwarpSpeed = overrides.crtwarpSpeed ?? initialCrtwarpSpeed;
  const setCrtwarpSpeed = (val: number) => updateOverrides({ crtwarpSpeed: val === initialCrtwarpSpeed ? undefined : val });
  const crtwarpCurvature = overrides.crtwarpCurvature ?? initialCrtwarpCurvature;
  const setCrtwarpCurvature = (val: number) => updateOverrides({ crtwarpCurvature: val === initialCrtwarpCurvature ? undefined : val });
  const crtwarpWaveAmount = overrides.crtwarpWaveAmount ?? initialCrtwarpWaveAmount;
  const setCrtwarpWaveAmount = (val: number) => updateOverrides({ crtwarpWaveAmount: val === initialCrtwarpWaveAmount ? undefined : val });
  const crtwarpWaveDensity = overrides.crtwarpWaveDensity ?? initialCrtwarpWaveDensity;
  const setCrtwarpWaveDensity = (val: number) => updateOverrides({ crtwarpWaveDensity: val === initialCrtwarpWaveDensity ? undefined : val });
  const crtwarpScanStrength = overrides.crtwarpScanStrength ?? initialCrtwarpScanStrength;
  const setCrtwarpScanStrength = (val: number) => updateOverrides({ crtwarpScanStrength: val === initialCrtwarpScanStrength ? undefined : val });
  const crtwarpScanDensity = overrides.crtwarpScanDensity ?? initialCrtwarpScanDensity;
  const setCrtwarpScanDensity = (val: number) => updateOverrides({ crtwarpScanDensity: val === initialCrtwarpScanDensity ? undefined : val });
  const crtwarpBloom = overrides.crtwarpBloom ?? initialCrtwarpBloom;
  const setCrtwarpBloom = (val: number) => updateOverrides({ crtwarpBloom: val === initialCrtwarpBloom ? undefined : val });
  const crtwarpBloomRadius = overrides.crtwarpBloomRadius ?? initialCrtwarpBloomRadius;
  const setCrtwarpBloomRadius = (val: number) => updateOverrides({ crtwarpBloomRadius: val === initialCrtwarpBloomRadius ? undefined : val });
  const crtwarpNoise = overrides.crtwarpNoise ?? initialCrtwarpNoise;
  const setCrtwarpNoise = (val: number) => updateOverrides({ crtwarpNoise: val === initialCrtwarpNoise ? undefined : val });
  const crtwarpVignette = overrides.crtwarpVignette ?? initialCrtwarpVignette;
  const setCrtwarpVignette = (val: number) => updateOverrides({ crtwarpVignette: val === initialCrtwarpVignette ? undefined : val });
  const crtwarpBrightness = overrides.crtwarpBrightness ?? initialCrtwarpBrightness;
  const setCrtwarpBrightness = (val: number) => updateOverrides({ crtwarpBrightness: val === initialCrtwarpBrightness ? undefined : val });
  const crtwarpRgbShift = overrides.crtwarpRgbShift ?? initialCrtwarpRgbShift;
  const setCrtwarpRgbShift = (val: number) => updateOverrides({ crtwarpRgbShift: val === initialCrtwarpRgbShift ? undefined : val });
  const crtwarpPixelSize = overrides.crtwarpPixelSize ?? initialCrtwarpPixelSize;
  const setCrtwarpPixelSize = (val: number) => updateOverrides({ crtwarpPixelSize: val === initialCrtwarpPixelSize ? undefined : val });
  const crtwarpRenderQuality = overrides.crtwarpRenderQuality ?? initialCrtwarpRenderQuality;
  const setCrtwarpRenderQuality = (val: number) => updateOverrides({ crtwarpRenderQuality: val === initialCrtwarpRenderQuality ? undefined : val });
  const crtwarpFrameRate = overrides.crtwarpFrameRate ?? initialCrtwarpFrameRate;
  const setCrtwarpFrameRate = (val: number) => updateOverrides({ crtwarpFrameRate: val === initialCrtwarpFrameRate ? undefined : val });
  const crtwarpPointerWarp = overrides.crtwarpPointerWarp !== undefined ? Boolean(overrides.crtwarpPointerWarp) : Boolean(initialCrtwarpPointerWarp);
  const setCrtwarpPointerWarp = (val: boolean) => updateOverrides({ crtwarpPointerWarp: val === initialCrtwarpPointerWarp ? undefined : val });
  const crtwarpPointerStrength = overrides.crtwarpPointerStrength ?? initialCrtwarpPointerStrength;
  const setCrtwarpPointerStrength = (val: number) => updateOverrides({ crtwarpPointerStrength: val === initialCrtwarpPointerStrength ? undefined : val });
  const crtwarpPaused = overrides.crtwarpPaused !== undefined ? Boolean(overrides.crtwarpPaused) : Boolean(initialCrtwarpPaused);
  const setCrtwarpPaused = (val: boolean) => updateOverrides({ crtwarpPaused: val === initialCrtwarpPaused ? undefined : val });
  const [bannerImageModalOpen, setBannerImageModalOpen] = useState(false);
  const [bannerBackgroundModalOpen, setBannerBackgroundModalOpen] = useState(false);
  const [bgSlot, setBgSlot] = useState<1 | 2>(1);
  const [decorationPickerOpen, setDecorationPickerOpen] = useState(false);
  const [effectsPickerOpen, setEffectsPickerOpen] = useState(false);

  const avatarDecorationUrl = overrides.avatarDecorationUrl !== undefined ? overrides.avatarDecorationUrl : initialDecorationUrl;
  const selectedDecoration = avatarDecorationUrl
    ? {
        id: (decorations as Decoration[]).find(d => d.url === avatarDecorationUrl)?.id || "custom",
        name: (decorations as Decoration[]).find(d => d.url === avatarDecorationUrl)?.name || "Custom Decoration",
        url: avatarDecorationUrl
      } as Decoration
    : null;
  const setSelectedDecoration = (val: Decoration | null) => {
    const newUrl = val ? val.url : null;
    const isSame = newUrl === initialDecorationUrl;
    updateOverrides({ avatarDecorationUrl: isSame ? undefined : newUrl });
  };
  const decorationHue = overrides.avatarDecorationHue ?? initialDecorationHue ?? 0;
  const setDecorationHue = (val: number) => {
    updateOverrides({ avatarDecorationHue: val === initialDecorationHue ? undefined : val });
  };


  const profileEffectUrl = overrides.profileEffectUrl !== undefined ? overrides.profileEffectUrl : initialEffectUrl;
  const selectedEffect = profileEffectUrl
    ? {
        id: "custom",
        name: (effects as { sku_id: string, name: string }[]).find(e => e.sku_id === profileEffectUrl.split("effect:")[1])?.name || "Custom Effect",
        url: profileEffectUrl
      } as Decoration
    : null;
  const setSelectedEffect = (val: Decoration | null) => {
    const newUrl = val ? val.url : null;
    const isSame = newUrl === initialEffectUrl;
    updateOverrides({ profileEffectUrl: isSame ? undefined : newUrl });
  };
  const effectHue = overrides.profileEffectHue ?? initialEffectHue ?? 0;
  const setEffectHue = (val: number) => {
    updateOverrides({ profileEffectHue: val === initialEffectHue ? undefined : val });
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
          selectedEffect={selectedEffect}
          bannerImageUrl={bannerImageUrl}
          setBannerImageUrl={setBannerImageUrl}
          bannerBlend={bannerBlend}
          setBannerBlend={setBannerBlend}
          bannerBackgroundUrl={bannerBackgroundUrl}
          setBannerBackgroundUrl={setBannerBackgroundUrl}
          bannerBackgroundUrl2={bannerBackgroundUrl2}
          setBannerBackgroundUrl2={setBannerBackgroundUrl2}
          bannerBackgroundShuffle={bannerBackgroundShuffle}
          setBannerBackgroundShuffle={setBannerBackgroundShuffle}
          bannerBackgroundAutoplay={bannerBackgroundAutoplay}
          setBannerBackgroundAutoplay={setBannerBackgroundAutoplay}
          bgSlot={bgSlot}
          setBgSlot={setBgSlot}
          bannerBackgroundSound={bannerBackgroundSound}
          setBannerBackgroundSound={setBannerBackgroundSound}
          auroraColor1={auroraColor1}
          setAuroraColor1={setAuroraColor1}
          auroraColor2={auroraColor2}
          setAuroraColor2={setAuroraColor2}
          auroraColor3={auroraColor3}
          setAuroraColor3={setAuroraColor3}
          auroraSpeed={auroraSpeed}
          setAuroraSpeed={setAuroraSpeed}
          auroraBlend={auroraBlend}
          setAuroraBlend={setAuroraBlend}
          darkveilSpeed={darkveilSpeed}
          setDarkveilSpeed={setDarkveilSpeed}
          darkveilHueShift={darkveilHueShift}
          setDarkveilHueShift={setDarkveilHueShift}
          darkveilNoise={darkveilNoise}
          setDarkveilNoise={setDarkveilNoise}
          darkveilScanFreq={darkveilScanFreq}
          setDarkveilScanFreq={setDarkveilScanFreq}
          darkveilScan={darkveilScan}
          setDarkveilScan={setDarkveilScan}
          darkveilWarp={darkveilWarp}
          setDarkveilWarp={setDarkveilWarp}
          pixelblastColor={pixelblastColor}
          setPixelblastColor={setPixelblastColor}
          pixelblastVariant={pixelblastVariant}
          setPixelblastVariant={setPixelblastVariant}
          pixelblastPixelSize={pixelblastPixelSize}
          setPixelblastPixelSize={setPixelblastPixelSize}
          pixelblastPatternScale={pixelblastPatternScale}
          setPixelblastPatternScale={setPixelblastPatternScale}
          pixelblastPatternDensity={pixelblastPatternDensity}
          setPixelblastPatternDensity={setPixelblastPatternDensity}
          pixelblastPixelJitter={pixelblastPixelJitter}
          setPixelblastPixelJitter={setPixelblastPixelJitter}
          pixelblastSpeed={pixelblastSpeed}
          setPixelblastSpeed={setPixelblastSpeed}
          pixelblastEdgeFade={pixelblastEdgeFade}
          setPixelblastEdgeFade={setPixelblastEdgeFade}
          pixelblastRipples={pixelblastRipples}
          setPixelblastRipples={setPixelblastRipples}
          pixelblastLiquid={pixelblastLiquid}
          setPixelblastLiquid={setPixelblastLiquid}
          colorbendsColor={colorbendsColor}
          setColorbendsColor={setColorbendsColor}
          colorbendsRotation={colorbendsRotation}
          setColorbendsRotation={setColorbendsRotation}
          colorbendsAutoRotate={colorbendsAutoRotate}
          setColorbendsAutoRotate={setColorbendsAutoRotate}
          colorbendsSpeed={colorbendsSpeed}
          setColorbendsSpeed={setColorbendsSpeed}
          colorbendsScale={colorbendsScale}
          setColorbendsScale={setColorbendsScale}
          colorbendsFrequency={colorbendsFrequency}
          setColorbendsFrequency={setColorbendsFrequency}
          colorbendsWarp={colorbendsWarp}
          setColorbendsWarp={setColorbendsWarp}
          colorbendsMouse={colorbendsMouse}
          setColorbendsMouse={setColorbendsMouse}
          colorbendsParallax={colorbendsParallax}
          setColorbendsParallax={setColorbendsParallax}
          colorbendsNoise={colorbendsNoise}
          setColorbendsNoise={setColorbendsNoise}
          colorbendsIterations={colorbendsIterations}
          setColorbendsIterations={setColorbendsIterations}
          colorbendsIntensity={colorbendsIntensity}
          setColorbendsIntensity={setColorbendsIntensity}
          colorbendsBandWidth={colorbendsBandWidth}
          setColorbendsBandWidth={setColorbendsBandWidth}
          liquidchromeColor={liquidchromeColor}
          setLiquidchromeColor={setLiquidchromeColor}
          liquidchromeSpeed={liquidchromeSpeed}
          setLiquidchromeSpeed={setLiquidchromeSpeed}
          liquidchromeAmplitude={liquidchromeAmplitude}
          setLiquidchromeAmplitude={setLiquidchromeAmplitude}
          liquidchromeInteractive={liquidchromeInteractive}
          setLiquidchromeInteractive={setLiquidchromeInteractive}
          crtwarpColor={crtwarpColor}
          setCrtwarpColor={setCrtwarpColor}
          crtwarpBackground={crtwarpBackground}
          setCrtwarpBackground={setCrtwarpBackground}
          crtwarpSpeed={crtwarpSpeed}
          setCrtwarpSpeed={setCrtwarpSpeed}
          crtwarpCurvature={crtwarpCurvature}
          setCrtwarpCurvature={setCrtwarpCurvature}
          crtwarpWaveAmount={crtwarpWaveAmount}
          setCrtwarpWaveAmount={setCrtwarpWaveAmount}
          crtwarpWaveDensity={crtwarpWaveDensity}
          setCrtwarpWaveDensity={setCrtwarpWaveDensity}
          crtwarpScanStrength={crtwarpScanStrength}
          setCrtwarpScanStrength={setCrtwarpScanStrength}
          crtwarpScanDensity={crtwarpScanDensity}
          setCrtwarpScanDensity={setCrtwarpScanDensity}
          crtwarpBloom={crtwarpBloom}
          setCrtwarpBloom={setCrtwarpBloom}
          crtwarpBloomRadius={crtwarpBloomRadius}
          setCrtwarpBloomRadius={setCrtwarpBloomRadius}
          crtwarpNoise={crtwarpNoise}
          setCrtwarpNoise={setCrtwarpNoise}
          crtwarpVignette={crtwarpVignette}
          setCrtwarpVignette={setCrtwarpVignette}
          crtwarpBrightness={crtwarpBrightness}
          setCrtwarpBrightness={setCrtwarpBrightness}
          crtwarpRgbShift={crtwarpRgbShift}
          setCrtwarpRgbShift={setCrtwarpRgbShift}
          crtwarpPixelSize={crtwarpPixelSize}
          setCrtwarpPixelSize={setCrtwarpPixelSize}
          crtwarpRenderQuality={crtwarpRenderQuality}
          setCrtwarpRenderQuality={setCrtwarpRenderQuality}
          crtwarpFrameRate={crtwarpFrameRate}
          setCrtwarpFrameRate={setCrtwarpFrameRate}
          crtwarpPointerWarp={crtwarpPointerWarp}
          setCrtwarpPointerWarp={setCrtwarpPointerWarp}
          crtwarpPointerStrength={crtwarpPointerStrength}
          setCrtwarpPointerStrength={setCrtwarpPointerStrength}
          crtwarpPaused={crtwarpPaused}
          setCrtwarpPaused={setCrtwarpPaused}
          setAvatarModalOpen={setAvatarModalOpen}
          setDecorationPickerOpen={setDecorationPickerOpen}
          setEffectsPickerOpen={setEffectsPickerOpen}
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
        onApply={(url, rawFile) => {
          setAvatarUrl(url);
          if (rawFile) setPendingFile("avatar", rawFile);
        }}
      />

      <BannerUpload
        open={bannerImageModalOpen}
        onClose={() => setBannerImageModalOpen(false)}
        onApply={(url, rawFile) => {
          setBannerImageUrl(url);
          if (rawFile) setPendingFile("banner", rawFile);
        }}
      />

      <BackgroundUpload
        open={bannerBackgroundModalOpen}
        onClose={() => setBannerBackgroundModalOpen(false)}
        onApply={(url, rawFile) => {
          if (bgSlot === 2) {
            setBannerBackgroundUrl2(url);
            if (rawFile) setPendingFile("background2", rawFile);
          } else {
            setBannerBackgroundUrl(url);
            if (rawFile) setPendingFile("background", rawFile);
          }
        }}
      />

      <DecorationPicker
        open={decorationPickerOpen}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedDecoration={selectedDecoration}
        decorationHue={decorationHue}
        onClose={() => setDecorationPickerOpen(false)}
        onSelectDecoration={setSelectedDecoration}
        onDecorationHueChange={setDecorationHue}
      />


      <EffectsPicker
        open={effectsPickerOpen}
        avatarUrl={avatarUrl}
        avatarShape={avatarShape}
        selectedEffect={selectedEffect}
        effectHue={effectHue}
        onClose={() => setEffectsPickerOpen(false)}
        onSelectEffect={setSelectedEffect}
        onEffectHueChange={setEffectHue}
      />



      <DashboardProfilePreview
        user={user}
        bgPreviewIdx={bgSlot === 2 ? 1 : 0}
        overrides={{
          ...overrides,
          displayName,
          bio,
          location,
          occupation,
          avatarUrl,
          avatarShape,
          bannerImageUrl,
          bannerBlend,
          bannerBackgroundUrl,
          bannerBackgroundUrl2,
          bannerBackgroundShuffle,
          bannerBackgroundAutoplay,
          auroraColor1,
          auroraColor2,
          auroraColor3,
          auroraSpeed,
          auroraBlend,
          darkveilSpeed,
          darkveilHueShift,
          darkveilNoise,
          darkveilScanFreq,
          darkveilScan,
          darkveilWarp,
          pixelblastColor,
          pixelblastVariant,
          pixelblastPixelSize,
          pixelblastPatternScale,
          pixelblastPatternDensity,
          pixelblastPixelJitter,
          pixelblastSpeed,
          pixelblastEdgeFade,
          pixelblastRipples,
          pixelblastLiquid,
          colorbendsColor,
          colorbendsRotation,
          colorbendsAutoRotate,
          colorbendsSpeed,
          colorbendsScale,
          colorbendsFrequency,
          colorbendsWarp,
          colorbendsMouse,
          colorbendsParallax,
          colorbendsNoise,
          colorbendsIterations,
          colorbendsIntensity,
          colorbendsBandWidth,
          liquidchromeColor,
          liquidchromeSpeed,
          liquidchromeAmplitude,
          liquidchromeInteractive,
          crtwarpColor,
          crtwarpBackground,
          crtwarpSpeed,
          crtwarpCurvature,
          crtwarpWaveAmount,
          crtwarpWaveDensity,
          crtwarpScanStrength,
          crtwarpScanDensity,
          crtwarpBloom,
          crtwarpBloomRadius,
          crtwarpNoise,
          crtwarpVignette,
          crtwarpBrightness,
          crtwarpRgbShift,
          crtwarpPixelSize,
          crtwarpRenderQuality,
          crtwarpFrameRate,
          crtwarpPointerWarp,
          crtwarpPointerStrength,
          crtwarpPaused,
        }}
      />

      <SaveBar
        show={Object.keys(overrides).length > 0}
        onSave={async () => {
          try {
            const finalOverrides = { ...overrides };

            const uploadPendingFile = async (file: File, type: "avatar" | "background" | "banner", attempt = 0): Promise<string> => {
              const formData = new FormData();
              formData.append("reqtype", "fileupload");
              formData.append("fileToUpload", file);
              formData.append("assetType", type);

              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              if (!res.ok) {
                if (attempt === 0 && (res.status === 502 || res.status === 500)) {
                  await res.body?.cancel().catch(() => {});
                  await new Promise((r) => setTimeout(r, 1500));
                  return uploadPendingFile(file, type, 1);
                }
                const err = await res.json().catch(() => null) as { error?: string } | null;
                throw new Error(err?.error || `Failed to upload ${type}`);
              }
              const data = await res.json();
              return data.url;
            };

            if (pendingFiles.avatar) {
              finalOverrides.avatarUrl = await uploadPendingFile(pendingFiles.avatar, "avatar");
            }
            if (pendingFiles.banner) {
              finalOverrides.bannerImageUrl = await uploadPendingFile(pendingFiles.banner, "banner");
            }
            if (pendingFiles.background && !isAnimatedBackgroundUrl(finalOverrides.bannerBackgroundUrl as string | undefined)) {
              finalOverrides.bannerBackgroundUrl = await uploadPendingFile(pendingFiles.background, "background");
            }
            if (pendingFiles.background2 && !isAnimatedBackgroundUrl(finalOverrides.bannerBackgroundUrl2 as string | undefined)) {
              finalOverrides.bannerBackgroundUrl2 = await uploadPendingFile(pendingFiles.background2, "background");
            }

            await updateGeneralProfile(
              finalOverrides as Parameters<typeof updateGeneralProfile>[0]
            );
            toast.success("Profile Saved Sucessfully");
            clearPendingFiles();
            scheduleClear();
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to save profile");
          }
        }}
        onRevert={() => {
          clearOverrides();
          clearPendingFiles();
        }}
      />
    </>
  );
}
