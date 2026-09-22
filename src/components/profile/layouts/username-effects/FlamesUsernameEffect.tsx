"use client";

export default function FlamesUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        animation: "username-flames 900ms ease-in-out infinite alternate",
      }}
    >
      {children}
      <style>{`
        @keyframes username-flames {
          0% {
            color: #ffe08a;
            text-shadow:
              0 0 4px rgba(255, 180, 40, 0.9),
              0 0 12px rgba(255, 100, 10, 0.7),
              0 0 26px rgba(255, 40, 0, 0.5);
          }
          50% {
            color: #ffd24a;
            text-shadow:
              0 0 6px rgba(255, 200, 60, 0.95),
              0 0 16px rgba(255, 120, 20, 0.8),
              0 0 32px rgba(255, 60, 0, 0.6);
          }
          100% {
            color: #ffb03a;
            text-shadow:
              0 0 5px rgba(255, 160, 30, 0.9),
              0 0 14px rgba(255, 80, 0, 0.75),
              0 0 30px rgba(255, 30, 0, 0.55);
          }
        }
      `}</style>
    </span>
  );
}
