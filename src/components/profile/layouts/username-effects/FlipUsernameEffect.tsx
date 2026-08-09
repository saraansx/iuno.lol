"use client";

const FLIP_DURATION = 3400; // ms for one full rest-and-flip cycle

/**
 * FlipUsernameEffect
 *
 * Tumbles the username over (top rolls away, 0° → 180°), holds it there
 * briefly, then flips it back to normal (180° → 360°). Two distinct
 * half-turns with a little stop in between, rather than one continuous full
 * rotation. The `perspective()` in the transform gives it real 3D depth.
 *
 * `rotateX` is a transform, so layout is never affected — the card keeps its
 * size. Wraps children (the username <h1>) so its styling is preserved.
 */
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
