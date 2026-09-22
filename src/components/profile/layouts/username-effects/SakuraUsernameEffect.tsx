"use client";

const PETALS = [
  { left: 8, delay: 0, duration: 3200, size: 9 },
  { left: 22, delay: 700, duration: 3800, size: 7 },
  { left: 38, delay: 1400, duration: 3000, size: 10 },
  { left: 52, delay: 300, duration: 3500, size: 8 },
  { left: 66, delay: 1900, duration: 3300, size: 9 },
  { left: 80, delay: 1100, duration: 3600, size: 7 },
  { left: 92, delay: 2300, duration: 3100, size: 8 },
];

export default function SakuraUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span aria-hidden style={{ position: "absolute", inset: "-40% -10%", overflow: "hidden", pointerEvents: "none" }}>
        {PETALS.map((p, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              top: "-12px",
              width: `${p.size}px`,
              height: `${p.size * 1.3}px`,
              animation: `username-sakura-fall ${p.duration}ms linear ${p.delay}ms infinite`,
            }}
          >
            <svg viewBox="0 0 24 30" width="100%" height="100%">
              <path
                d="M12 0 C6 6 4 12 6 18 C8 24 12 28 12 30 C12 28 16 24 18 18 C20 12 18 6 12 0 Z"
                fill="#ffb7d5"
                opacity="0.9"
              />
            </svg>
          </span>
        ))}
      </span>
      <style>{`
        @keyframes username-sakura-fall {
          0%   { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; }
          35%  { transform: translate(8px, 25%) rotate(120deg); }
          65%  { transform: translate(-8px, 60%) rotate(260deg); }
          85%  { opacity: 1; }
          100% { transform: translate(4px, 100px) rotate(400deg); opacity: 0; }
        }
      `}</style>
    </span>
  );
}
