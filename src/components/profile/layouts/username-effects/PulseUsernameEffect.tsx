"use client";

const BEAT_ONE = 1.18;
const BEAT_TWO = 1.11;
const PULSE_DURATION = 1500;

export default function PulseUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        willChange: "transform",
        animation: `username-pulse ${PULSE_DURATION}ms ease-out infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes username-pulse {
          0%   { transform: scale(1); }
          10%  { transform: scale(${BEAT_ONE}); }
          20%  { transform: scale(1); }
          30%  { transform: scale(${BEAT_TWO}); }
          42%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
