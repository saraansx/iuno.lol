"use client";

const PULSE_SCALE = 1.06;    // peak size at the top of the beat
const PULSE_DURATION = 1600; // ms for one full beat

/**
 * PulseUsernameEffect
 *
 * Makes the username breathe: it swells slightly and brightens, then eases
 * back down, looping forever like a heartbeat. Driven by a CSS animation on
 * the wrapper, so there are no per-frame re-renders.
 *
 * `scale` is a transform, so it never affects layout — the card keeps its
 * size while the text pulses. Wraps children (the username <h1>) so its
 * styling is preserved.
 */
export default function PulseUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        willChange: "transform, opacity",
        animation: `username-pulse ${PULSE_DURATION}ms ease-in-out infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes username-pulse {
          0%, 100% { transform: scale(1); opacity: 0.82; }
          50%      { transform: scale(${PULSE_SCALE}); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
