"use client";

interface PremiumLogoProps {
  size?: number;
  className?: string;
}

/** Tiny premium gem shown next to premium-gated features. */
export default function PremiumLogo({ size = 14, className = "" }: PremiumLogoProps) {
  return (
    <span
      title="Premium"
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size + 6, height: size + 6 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient id="iuno-premium-gem" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#8b7cf6" />
            <stop offset="100%" stopColor="#5b6cf5" />
          </linearGradient>
        </defs>
        <path
          d="M6 3h12l4 6-10 13L2 9Z"
          fill="url(#iuno-premium-gem)"
          stroke="#c4b5fd"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M11 3 8 9l4 13 4-13-3-6M2 9h20"
          stroke="#0c0c0c"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
