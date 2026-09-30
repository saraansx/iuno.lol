import Image from "next/image";
import type { Decoration } from "@/components/dashboard/DecorationPicker";
import { isVideoUrl } from "@/lib/utils/media";

export const AvatarInner = ({
  avatarUrl,
  shapeClass,
  selectedDecoration,
  decorationHue,
}: {
  avatarUrl?: string | null;
  shapeClass: string;
  selectedDecoration?: Decoration | null;
  decorationHue: number;
}) => (
  <div className="relative w-[88px] h-[88px]">
    <div
      className={`absolute inset-0 bg-[#0a0a0a] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-xl ${shapeClass}`}
    >
      {avatarUrl ? (
        isVideoUrl(avatarUrl) ? (
          <video
            key={avatarUrl}
            src={avatarUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            ref={(el) => { if (el) el.defaultMuted = true; }}
            loop
            playsInline
          />
        ) : (
          <Image src={avatarUrl} alt="Avatar" fill sizes="88px" className="object-cover" unoptimized priority />
        )
      ) : (
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-20"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </div>

    {selectedDecoration && (
      <div className="pointer-events-none absolute -inset-2 z-10">
        <Image
          src={selectedDecoration.url}
          alt={selectedDecoration.name}
          fill
          sizes="104px"
          unoptimized
          priority
          className="object-contain"
          style={{ filter: `hue-rotate(${decorationHue}deg)` }}
        />
      </div>
    )}
  </div>
);
