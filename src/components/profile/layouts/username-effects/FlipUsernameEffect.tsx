"use client";

const FLIP_DURATION = 3400;

export default function FlipUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        willChange: "transform",
        transformStyle: "preserve-3d",
        animation: `username-flip ${FLIP_DURATION}ms ease-in-out infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes username-flip {
          0%, 45% { transform: perspective(600px) rotateX(0deg); }
          58%     { transform: perspective(600px) rotateX(180deg); }
          72%     { transform: perspective(600px) rotateX(180deg); }
          100%    { transform: perspective(600px) rotateX(360deg); }
        }
      `}</style>
    </span>
  );
}
