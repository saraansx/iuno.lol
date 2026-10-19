interface AppleMusicIconProps {
  size?: number;
  className?: string;
}

export function AppleMusicLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
}: AppleMusicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FC3C44"
      className={`shrink-0 ${className}`}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.6 5.4v8.4a2.85 2.85 0 1 1-1.8-2.64V8.1l-5.4 1.14v5.1a2.85 2.85 0 1 1-1.8-2.64V7.5c0-.42.3-.78.71-.86l7.2-1.5c.5-.11.99.27.99.78z" />
    </svg>
  );
}

export function AppleMusicArtistIcon({
  size = 14,
  className = "w-3.5 h-3.5",
}: AppleMusicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
    >
      <circle cx="12" cy="7" r="4.5" />
      <path d="M12 13.5c-4.42 0-8 2.24-8 5v1c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-1c0-2.76-3.58-5-8-5z" />
    </svg>
  );
}

export function AppleMusicAlbumIcon({
  size = 14,
  className = "w-3.5 h-3.5",
}: AppleMusicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 100 14 7 7 0 000-14zm0 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 1.5a1 1 0 100 2 1 1 0 000-2z"
      />
    </svg>
  );
}

export function AppleMusicTracksIcon({
  size = 14,
  className = "w-3.5 h-3.5",
}: AppleMusicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
    >
      <rect x="3" y="5" width="12" height="2" rx="1" />
      <rect x="3" y="11" width="12" height="2" rx="1" />
      <rect x="3" y="17" width="8" height="2" rx="1" />
      <path d="M19 5.2v9.05a2.6 2.6 0 1 1-1.6-2.4V7.1l-2.6.55V5.6l3.55-.75c.35-.07.65.2.65.35z" />
    </svg>
  );
}

export function AppleMusicCalendarIcon({
  size = 14,
  className = "w-3.5 h-3.5",
}: AppleMusicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
    >
      <path d="M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v1H3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zM3 10h18v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8z" />
    </svg>
  );
}

export function AppleMusicGenreIcon({
  size = 14,
  className = "w-3.5 h-3.5",
}: AppleMusicIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
    >
      <path d="M20.6 3.1a1 1 0 0 1 .4.8v10.4a3.2 3.2 0 1 1-2-2.96V6.7l-8 1.7v7.9a3.2 3.2 0 1 1-2-2.96V6.5a1 1 0 0 1 .79-.98l10-2.13a1 1 0 0 1 .81-.29z" />
    </svg>
  );
}
