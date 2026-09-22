"use client";

export default function FlickerUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        animation: "username-flicker 2.4s steps(1, end) infinite",
      }}
    >
      {children}
      <style>{`
        @keyframes username-flicker {
          0%, 100% { opacity: 1; }
          3%   { opacity: 0.25; }
          6%   { opacity: 1; }
          38%  { opacity: 1; }
          40%  { opacity: 0.45; }
          42%  { opacity: 1; }
          44%  { opacity: 0.7; }
          46%  { opacity: 1; }
          72%  { opacity: 1; }
          74%  { opacity: 0.3; }
          77%  { opacity: 1; }
          88%  { opacity: 0.6; }
          90%  { opacity: 1; }
        }
      `}</style>
    </span>
  );
}
