"use client";

const cornerStyle = (pos: React.CSSProperties): React.CSSProperties => ({
  position: "absolute",
  width: "10px",
  height: "10px",
  borderColor: "#5b6cf5",
  borderStyle: "solid",
  borderWidth: 0,
  pointerEvents: "none",
  animation: "username-lockon 1.8s ease-in-out infinite",
  ...pos,
});

export default function LockonUsernameEffect({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "6px 8px" }}>
      {children}
      <span aria-hidden style={cornerStyle({ top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 })} />
      <span aria-hidden style={cornerStyle({ top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 })} />
      <span aria-hidden style={cornerStyle({ bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 })} />
      <span aria-hidden style={cornerStyle({ bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 })} />
      <style>{`
        @keyframes username-lockon {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </span>
  );
}
