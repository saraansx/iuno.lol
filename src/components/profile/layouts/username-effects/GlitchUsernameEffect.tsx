"use client";

export default function GlitchUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        animation: "username-glitch 3s infinite steps(1, end)",
      }}
    >
      {children}
      <style>{`
        @keyframes username-glitch {
          0%, 100% {
            transform: translate(0, 0);
            text-shadow: none;
          }
          8% {
            transform: translate(-3px, 1px);
            text-shadow: 3px 0 #ff0040, -3px 0 #00f0ff;
          }
          16% {
            transform: translate(3px, -1px);
            text-shadow: -3px 0 #ff0040, 3px 0 #00f0ff;
          }
          24% {
            transform: translate(-2px, 0);
            text-shadow: 2px 0 #ff0040, -2px 0 #00f0ff;
          }
          32% {
            transform: translate(2px, 1px);
            text-shadow: -2px 0 #ff0040, 2px 0 #00f0ff;
          }
          40% {
            transform: translate(0, -1px);
            text-shadow: 1px 0 #ff0040, -1px 0 #00f0ff;
          }
          48% {
            transform: translate(-3px, -1px);
            text-shadow: 3px 0 #ff0040, -3px 0 #00f0ff;
          }
          56% {
            transform: translate(3px, 1px);
            text-shadow: -3px 0 #ff0040, 3px 0 #00f0ff;
          }
          64% {
            transform: translate(-1px, 1px);
            text-shadow: 2px 0 #ff0040, -2px 0 #00f0ff;
          }
          72% {
            transform: translate(2px, -1px);
            text-shadow: -2px 0 #ff0040, 2px 0 #00f0ff;
          }
          80% {
            transform: translate(-2px, 0);
            text-shadow: 1px 0 #ff0040, -1px 0 #00f0ff;
          }
          88% {
            transform: translate(1px, 1px);
            text-shadow: -1px 0 #ff0040, 1px 0 #00f0ff;
          }
          94% {
            transform: translate(0, 0);
            text-shadow: none;
          }
        }
      `}</style>
    </span>
  );
}
