"use client";

interface PremiumLockProps {
  size?: number;
  className?: string;
}

/** Tiny bluish lock shown next to premium-gated dropdown options (same lock as badges). */
export default function PremiumLock({ size = 12, className = "" }: PremiumLockProps) {
  return (
    <span
      title="Premium"
      className={`inline-flex items-center justify-center shrink-0 text-[#5b6cf5]/80 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </span>
  );
}
