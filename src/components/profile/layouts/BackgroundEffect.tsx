"use client";

import dynamic from "next/dynamic";

const SnowEffect = dynamic(() => import("./background-effects/Snow").then((m) => m.SnowEffect), { ssr: false });
const NightTimeEffect = dynamic(() => import("./background-effects/NightTime").then((m) => m.NightTimeEffect), { ssr: false });
const OldTVEffect = dynamic(() => import("./background-effects/OldTV").then((m) => m.OldTVEffect), { ssr: false });
const DitherEffect = dynamic(() => import("./background-effects/Dither").then((m) => m.DitherEffect), { ssr: false });
const RainEffect = dynamic(() => import("./background-effects/Rain").then((m) => m.RainEffect), { ssr: false });
const ParticlesEffect = dynamic(() => import("./background-effects/Particles").then((m) => m.ParticlesEffect), { ssr: false });
const ShootingStarsEffect = dynamic(() => import("./background-effects/ShootingStars").then((m) => m.ShootingStarsEffect), { ssr: false });
const HeartsEffect = dynamic(() => import("./background-effects/Hearts").then((m) => m.HeartsEffect), { ssr: false });
const FirefliesEffect = dynamic(() => import("./background-effects/Fireflies").then((m) => m.FirefliesEffect), { ssr: false });
const LightningEffect = dynamic(() => import("./background-effects/Lightning").then((m) => m.LightningEffect), { ssr: false });
const MeteorsEffect = dynamic(() => import("./background-effects/Meteors").then((m) => m.MeteorsEffect), { ssr: false });
const LightRaysEffect = dynamic(() => import("./background-effects/LightRays").then((m) => m.LightRaysEffect), { ssr: false });
const LightTunnelEffect = dynamic(() => import("./background-effects/LightTunnel").then((m) => m.LightTunnelEffect), { ssr: false });
const AuroraEffect = dynamic(() => import("./background-effects/Aurora").then((m) => m.AuroraEffect), { ssr: false });

export function BackgroundEffect({
  effect,
  intensity = 50,
  color = "#ffffff",
  aboveContainer = false,
}: {
  effect?: string;
  intensity?: number;
  color?: string;
  aboveContainer?: boolean;
}) {
  if (!effect || effect === "none") return null;

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${aboveContainer ? 'z-[20]' : 'z-[1]'}`}>
      {effect === "snow" && <SnowEffect intensity={intensity} color={color} />}
      {effect === "nighttime" && <NightTimeEffect intensity={intensity} />}
      {effect === "oldtv" && <OldTVEffect intensity={intensity} />}
      {effect === "dither" && <DitherEffect intensity={intensity} />}
      {effect === "rain" && <RainEffect intensity={intensity} color={color} />}
      {effect === "particles" && <ParticlesEffect intensity={intensity} color={color} />}
      {effect === "shootingstars" && <ShootingStarsEffect intensity={intensity} color={color} />}
      {effect === "hearts" && <HeartsEffect intensity={intensity} color={color} />}
      {effect === "fireflies" && <FirefliesEffect intensity={intensity} color={color} />}
      {effect === "lightning" && <LightningEffect intensity={intensity} color={color} />}
      {effect === "meteors" && <MeteorsEffect intensity={intensity} color={color} />}
      {effect === "lightrays" && <LightRaysEffect intensity={intensity} color={color} />}
      {effect === "lighttunnel" && <LightTunnelEffect intensity={intensity} color={color} />}
      {effect === "aurora" && <AuroraEffect intensity={intensity} color={color} />}
    </div>
  );
}
