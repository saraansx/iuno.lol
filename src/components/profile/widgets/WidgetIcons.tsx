import React from "react";

interface WidgetIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function WidgetRedirectIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function VerifiedBadgeIcon({
  size = 14,
  fill = "#0095F6",
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps & { fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 2L14.8 4.2L18.4 4.5L19.5 7.8L22.5 9.8L21.7 13.3L23 16.5L20 18.5L19 22L15.5 21.5L13 23.5L10.5 21.5L7 22L6 18.5L3 16.5L4.3 13.3L3.5 9.8L6.5 7.8L7.6 4.5L11.2 4.2L12 2Z" />
      <path
        d="M9.5 12L11 13.5L15 9.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpotifyLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#1ED760"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.307a.754.754 0 0 1-1.037.249c-2.836-1.733-6.406-2.126-10.61-1.165a.755.755 0 1 1-.338-1.472c4.603-1.051 8.563-.604 11.736 1.341.365.223.478.7.249 1.047zm1.469-3.264a.944.944 0 0 1-1.298.312c-3.246-1.996-8.196-2.574-12.037-1.408a.945.945 0 0 1-.557-1.805c4.385-1.332 9.835-.688 13.58 1.614.417.256.547.801.312 1.287zm.126-3.41c-3.892-2.311-10.312-2.525-14.027-1.397a1.132 1.132 0 1 1-.659-2.167c4.272-1.298 11.363-1.05 15.842 1.609a1.134 1.134 0 0 1-1.156 1.955z" />
    </svg>
  );
}

export function SpotifyArtistIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle cx="12" cy="7" r="4.5" />
      <path d="M12 13.5c-4.42 0-8 2.24-8 5v1c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-1c0-2.76-3.58-5-8-5z" />
    </svg>
  );
}

export function SpotifyAlbumIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 100 14 7 7 0 000-14zm0 4.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 1.5a1 1 0 100 2 1 1 0 000-2z"
      />
    </svg>
  );
}

export function SpotifyFollowersIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

export function SpotifyListenersIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 3a9 9 0 00-9 9v7c0 1.1.9 2 2 2h2a1 1 0 001-1v-5a1 1 0 00-1-1H5v-2a7 7 0 1114 0v2h-2a1 1 0 00-1 1v5a1 1 0 001 1h2a2 2 0 002-2v-7a9 9 0 00-9-9z" />
    </svg>
  );
}

export function SpotifyTracksIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

export function SpotifyCalendarIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="currentColor"
      stroke="none"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4zM32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V180a4 4 0 0 0-4-4H36a4 4 0 0 0-4 4z" />
    </svg>
  );
}

export function TwitchLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#9146FF"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

export function TwitchPartnerBadgeIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return <VerifiedBadgeIcon fill="#9146FF" size={size} className={className} {...props} />;
}

export function DiscordLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#5865F2"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function GitHubLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function GitHubStarIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

export function GitHubForkIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h4.5A2.25 2.25 0 0 0 12.5 6.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878Zm7.5-2.122a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0-1.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
      <path d="M4.25 6.25v4.25h1.5V6.25h-1.5Z" />
    </svg>
  );
}

export function GitHubWatchersIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.631 3.022a1.883 1.883 0 0 1 0 2.16c-.444.677-1.362 1.931-2.631 3.022C11.67 13.358 9.981 14.35 8 14.35c-1.981 0-3.671-.992-4.933-2.078C1.797 11.18.88 9.927.436 9.25a1.862 1.862 0 0 1 0-2.16c.444-.677 1.362-1.931 2.631-3.022C4.33 2.992 6.019 2 8 2ZM1.679 8.272a.38.38 0 0 0 0 .456c.358.547 1.18 1.66 2.32 2.64C5.15 12.358 6.643 13.25 8 13.25c1.357 0 2.85-.892 4.001-1.882 1.14-.98 1.962-2.093 2.32-2.64a.38.38 0 0 0 0-.456c-.358-.547-1.18-1.66-2.32-2.64C10.85 4.642 9.357 3.75 8 3.75c-1.357 0-2.85.892-4.001 1.882-1.14.98-1.962 2.093-2.32 2.64ZM8 5.5a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5Zm0 1.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" />
    </svg>
  );
}

export function GitHubIssuesIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  );
}

export function SteamLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
    </svg>
  );
}

export function GenshinLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 0.5C12.3 2.1 13 2.8 14.6 3.1C13 3.4 12.3 4.1 12 5.7C11.7 4.1 11 3.4 9.4 3.1C11 2.8 11.7 2.1 12 0.5Z" />
      <path d="M7 4.2C8.3 4.9 10 5.4 12 5.4C14 5.4 15.7 4.9 17 4.2C16.8 5.6 15.8 6.6 14.5 7.1C13.7 6.8 12.9 6.6 12 6.6C11.1 6.6 10.3 6.8 9.5 7.1C8.2 6.6 7.2 5.6 7 4.2Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 7.5C9.5 7 14.5 7 18 7.5L18.5 9C17.5 8.7 15.5 8.5 13.8 8.6V10H16.8V11.5H13.8V19H12.2V8.6C10.5 8.5 8.5 8.7 7.5 9L8 7.5ZM5 9.5C8 9.2 11 9.3 11 9.3V11H9C7.8 11 6.8 11.9 6.8 13.2C6.8 14.7 7.9 15.8 9.3 15.8C10.5 15.8 11 15.1 11 14.2V13.2H8.8V12H12.2V15C11.8 16.3 10.7 17.2 9.2 17.2C6.9 17.2 5.2 15.5 5.2 13.2C5.2 11.4 6.3 10.1 7.8 9.7C6.8 9.8 5.8 10.1 5 10.5V9.5ZM14.5 11.5H18.8V13H17.2V18.5H18.8V20H14.5V18.5H16V13H14.5V11.5ZM4 19.5C7 21.2 17 21.2 20 19.5L20.5 20.8C17 22.8 7 22.8 3.5 20.8L4 19.5Z"
      />
    </svg>
  );
}

export function ValorantFlameIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
    </svg>
  );
}

export function ValorantUserIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function PinterestLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#E60023"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.056.208-.18.252-.415.152-1.547-.72-2.514-2.981-2.514-4.799 0-3.908 2.841-7.498 8.192-7.498 4.301 0 7.644 3.065 7.644 7.158 0 4.271-2.693 7.712-6.432 7.712-1.256 0-2.437-.653-2.84-1.423l-.774 2.953c-.28 1.071-1.037 2.414-1.545 3.24C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

export function TikTokLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.76-.23 1.05.14 2.22.95 2.92.74.67 1.77.93 2.74.77.92-.12 1.74-.71 2.14-1.54.34-.69.46-1.48.45-2.25V0h.03c.8-.01 1.6-.01 2.4-.01z" />
    </svg>
  );
}

export function TikTokFollowersIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function TikTokFollowingIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      <path d="M4 11h-2v2h2v2h2v-2h2v-2h-2v-2h-2v2z" />
    </svg>
  );
}

export function TikTokHeartIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function TikTokVideoIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  );
}

export function TikTokVerifiedIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return <VerifiedBadgeIcon fill="#20D5EC" size={size} className={className} {...props} />;
}

export function InstagramLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InstagramFollowersIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function InstagramFollowingIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      <path d="M4 11h-2v2h2v2h2v-2h2v-2h-2v-2h-2v2z" />
    </svg>
  );
}

export function InstagramPostIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </svg>
  );
}

export function InstagramVerifiedIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return <VerifiedBadgeIcon fill="#0095F6" size={size} className={className} {...props} />;
}

export function LockIcon({
  size = 12,
  className = "w-3 h-3",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" fill="currentColor" stroke="none" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

export function YouTubeLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function YouTubeSubscribersIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

export function YouTubeViewsIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

export function YouTubeVideoIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  );
}

export function YouTubeLikesIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
    </svg>
  );
}

export function YouTubeCalendarIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="currentColor"
      stroke="none"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4zM32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V180a4 4 0 0 0-4-4H36a4 4 0 0 0-4 4z" />
    </svg>
  );
}

export function TelegramLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#2AABEE"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.568-17.75c.203-.03.41.01.577.132.146.135.223.328.21.526-.02.24-.06.478-.12.712-.44 2.09-.9 4.176-1.362 6.262-.114.516-.24 1.03-.404 1.532-.07.234-.196.448-.366.622-.222.196-.55.22-.8.06-.29-.166-.56-.364-.83-.56-.79-.577-1.58-1.155-2.363-1.74-.13-.09-.24-.2-.33-.33-.11-.19-.07-.44.09-.59.5-.5 1.02-.98 1.53-1.47.42-.4.85-.79 1.26-1.2.07-.08.13-.19.06-.29-.08-.1-.22-.07-.32-.02-.28.16-.55.34-.82.52-1.28.84-2.56 1.68-3.85 2.5-.32.22-.7.31-1.08.25-.5-.11-.99-.26-1.47-.44-.27-.1-.55-.2-.78-.38-.16-.12-.2-.36-.08-.52.09-.13.23-.21.37-.27.53-.22 1.07-.42 1.61-.62 2.74-1.02 5.48-2.04 8.22-3.05.36-.14.73-.26 1.11-.34.05-.01.1-.02.15-.02z" />
    </svg>
  );
}

export function TelegramBioIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2 4a1 1 0 000 2h12a1 1 0 000-2H6zm0 4a1 1 0 000 2h12a1 1 0 000-2H6zm0 4a1 1 0 000 2h7a1 1 0 000-2H6z" />
    </svg>
  );
}

export function RobloxLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 text-white ${className}`}
      {...props}
    >
      <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.29l-5.13-1.4-1.4 5.129 5.13 1.4z" />
    </svg>
  );
}

export function RobloxVerifiedBadgeIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return <VerifiedBadgeIcon fill="#0066FF" size={size} className={className} {...props} />;
}

export function RobloxFollowersIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 001 1h14a1 1 0 001-1v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  );
}

export function RobloxFriendsIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M9 11a4 4 0 100-8 4 4 0 000 8zm7.5 0a3 3 0 100-6 3 3 0 000 6zM9 13c-3.866 0-7 1.79-7 4v1a1 1 0 001 1h12a1 1 0 001-1v-1c0-2.21-3.134-4-7-4zm7.5 0c-.86 0-1.673.1-2.406.28C15.28 14.185 16 15.49 16 17v1a2.99 2.99 0 01-.17 1H21a1 1 0 001-1v-.75C22 14.679 19.538 13 16.5 13z" />
    </svg>
  );
}

export function WeatherTemperatureIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 2a3 3 0 00-3 3v8.35a5 5 0 106 0V5a3 3 0 00-3-3zm0 2a1 1 0 011 1v9.4l.5.3a3 3 0 11-3 0l.5-.3V5a1 1 0 011-1z" />
    </svg>
  );
}

export function WeatherConditionMarkerIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M6.5 19a4.5 4.5 0 01-.42-8.98A6 6 0 0117.7 9.2 4.5 4.5 0 0117.5 19h-11z" />
    </svg>
  );
}

export function SoundcloudLogoIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z" />
    </svg>
  );
}

export function SoundcloudVerifiedIcon({
  size = 14,
  className = "w-3.5 h-3.5",
  ...props
}: WidgetIconProps) {
  return <VerifiedBadgeIcon size={size} className={className} {...props} />;
}

export function SoundcloudFollowersIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function SoundcloudTrackIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 3v12.55A4 4 0 1 0 14 19V7h6V3h-8z" />
    </svg>
  );
}

export function SoundcloudPlayIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

export function SoundcloudLikeIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function SoundcloudDurationIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function SoundcloudPlaylistIcon({
  size = 13,
  className = "w-[13px] h-[13px]",
  ...props
}: WidgetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M3 6h12v2H3V6zm0 5h12v2H3v-2zm0 5h8v2H3v-2z" />
      <path d="M17 17.5V9.2l4-1v2.1l-2 .5v6.7a2.5 2.5 0 1 1-2-2.45z" />
    </svg>
  );
}

export function WeatherConditionIcon({
  kind = "cloudy",
  isDay = true,
  size = 56,
  className = "",
  ...props
}: WidgetIconProps & {
  kind?:
    | "clear"
    | "partly-cloudy"
    | "cloudy"
    | "fog"
    | "drizzle"
    | "rain"
    | "snow"
    | "thunderstorm";
  isDay?: boolean;
}) {
  const cloud = "#c9d4e0";
  const cloudDark = "#9fb0c4";
  const sun = "#ffc531";
  const moon = "#e8eef7";
  const rain = "#4c9ff0";
  const snow = "#e4f1ff";
  const bolt = "#ffc531";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {(kind === "clear" || kind === "partly-cloudy") &&
        (isDay ? (
          <g>
            <circle
              cx={kind === "clear" ? 32 : 24}
              cy={kind === "clear" ? 32 : 24}
              r={kind === "clear" ? 13 : 10}
              fill={sun}
            />
            {kind === "clear" &&
              [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <rect
                  key={deg}
                  x="30.5"
                  y="3"
                  width="3"
                  height="8"
                  rx="1.5"
                  fill={sun}
                  transform={`rotate(${deg} 32 32)`}
                />
              ))}
          </g>
        ) : (
          <path
            d={
              kind === "clear"
                ? "M40 32a14 14 0 01-19.8 12.7A16 16 0 0032 16a16 16 0 00-11.8 5.2A14 14 0 0140 32z"
                : "M32 24a10 10 0 01-14.1 9.1A11.4 11.4 0 0024 12a11.4 11.4 0 00-8.4 3.7A10 10 0 0132 24z"
            }
            fill={moon}
          />
        ))}

      {kind !== "clear" && (
        <path
          d="M20 46a10 10 0 01-1-19.9A13.5 13.5 0 0145 30.5h.5a8 8 0 010 15.5H20z"
          fill={kind === "fog" ? cloudDark : cloud}
        />
      )}

      {kind === "fog" &&
        [52, 58].map((y, i) => (
          <rect
            key={y}
            x={i === 0 ? 14 : 20}
            y={y}
            width={i === 0 ? 36 : 26}
            height="3"
            rx="1.5"
            fill={cloudDark}
          />
        ))}

      {(kind === "drizzle" || kind === "rain") &&
        (kind === "rain" ? [22, 32, 42] : [26, 38]).map((x) => (
          <rect
            key={x}
            x={x}
            y="50"
            width="3"
            height={kind === "rain" ? 11 : 8}
            rx="1.5"
            fill={rain}
            transform={`rotate(14 ${x} 50)`}
          />
        ))}

      {kind === "snow" &&
        [22, 32, 42].map((x, i) => (
          <circle key={x} cx={x} cy={i === 1 ? 58 : 54} r="2.6" fill={snow} />
        ))}

      {kind === "thunderstorm" && (
        <path d="M34 48l-10 9h7l-3 8 11-11h-7l4-6z" fill={bolt} />
      )}
    </svg>
  );
}

