"use client";

const FLOAT_DURATION = 3200; // ms for one full float cycle

/**
 * FloatUsernameEffect
 *
 * Drifts the wrapped element along a smooth elliptical path — rises and sways
 * side to side while tilting slightly, then returns, repeating forever. The
 * keyframes are 8 parametric samples of an ellipse with `linear` timing so
 * the speed is constant along the path: no ease-in-out micro-pauses at
 * keyframe boundaries, which is what causes the "stiff" feel.
 *
 * Wraps children (the username <h1>) so its styling is preserved.
 */
export default function FloatUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        willChange: "transform",
        animation: `username-float ${FLOAT_DURATION}ms linear infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes username-float {
          0%     { transform: translate3d(0px, 0px, 0) rotate(0deg); }
          12.5%  { transform: translate3d(2px, -1px, 0) rotate(1deg); }
          25%    { transform: translate3d(3px, -3px, 0) rotate(1.5deg); }
          37.5%  { transform: translate3d(2px, -4px, 0) rotate(1deg); }
          50%    { transform: translate3d(0px, -5px, 0) rotate(0deg); }
          62.5%  { transform: translate3d(-2px, -4px, 0) rotate(-1deg); }
          75%    { transform: translate3d(-3px, -3px, 0) rotate(-1.5deg); }
          87.5%  { transform: translate3d(-2px, -1px, 0) rotate(-1deg); }
          100%   { transform: translate3d(0px, 0px, 0) rotate(0deg); }
        }
      `}</style>
    </span>
  );
}
