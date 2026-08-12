"use client";

const BEAT_ONE = 1.18;       // peak size of the first, stronger thump
const BEAT_TWO = 1.11;       // peak size of the second, softer thump
const PULSE_DURATION = 1500; // ms for one full beat-beat-rest cycle

/**
 * PulseUsernameEffect
 *
 * Beats like a heart: a sharp thump, a softer second thump, then a rest before
 * the next cycle. The two-beat-plus-rest rhythm is what makes it read as a
 * pulse — a single slow swell just looks like the text is breathing, and at a
 * subtle scale it reads as nothing happening at all.
 *
 * `ease-out` applies between each keyframe pair, so every beat snaps up fast
 * and settles back down rather than easing symmetrically in and out.
 *
 * Opacity is deliberately left alone. Animating it meant resting at 0.82 and
 * only touching full brightness at the peak, so the username looked
 * permanently dimmed next to the rest of the card.
 *
 * `scale` is a transform, so it never affects layout — the card keeps its size
 * and the <h1>'s `truncate` still cuts at the same character. Wraps children
 * (the username <h1>) so its styling is preserved.
 */
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
