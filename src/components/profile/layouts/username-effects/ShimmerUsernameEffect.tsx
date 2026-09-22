"use client";

export default function ShimmerUsernameEffect({
  children,
  baseColor = "#ffffff",
}: {
  children: React.ReactNode;
  baseColor?: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: `linear-gradient(110deg, ${baseColor} 30%, rgba(255,255,255,0.55) 45%, ${baseColor} 50%, ${baseColor} 60%, rgba(255,255,255,0.55) 75%, ${baseColor} 90%)`,
        backgroundSize: "300% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        animation: "username-shimmer 4.5s linear infinite",
      }}
    >
      {children}
      <style>{`
        @keyframes username-shimmer {
          0%   { background-position: 150% 0; }
          100% { background-position: -150% 0; }
        }
      `}</style>
    </span>
  );
}
