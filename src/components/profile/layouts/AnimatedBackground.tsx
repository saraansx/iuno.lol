"use client";

import type { AnimatedBackgroundId } from "@/lib/animated-background";
import { AuroraEffect } from "./background-effects/Aurora";

/**
 * Preset animated page backgrounds. Pure CSS (no assets, no canvas),
 * so they work in the live profile, the dashboard preview and the
 * picker thumbnails with zero extra cost.
 *
 * The `aurora` preset reuses the WebGL background effect.
 */
export default function AnimatedBackground({ id }: { id: AnimatedBackgroundId }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
      <style>{`
        @keyframes abg-drift-a { 0%,100% { transform: translate(-12%, -6%) scale(1); } 50% { transform: translate(14%, 10%) scale(1.25); } }
        @keyframes abg-drift-b { 0%,100% { transform: translate(10%, 12%) scale(1.15); } 50% { transform: translate(-14%, -8%) scale(0.9); } }
        @keyframes abg-rise { 0% { transform: translateY(30%) scale(1); opacity: 0; } 15% { opacity: 0.9; } 85% { opacity: 0.5; } 100% { transform: translateY(-120%) scale(0.6); opacity: 0; } }
        @keyframes abg-spin { to { transform: rotate(360deg); } }
        @keyframes abg-mist-x { 0%,100% { transform: translateX(-10%); } 50% { transform: translateX(10%); } }
        @keyframes abg-wave-x { to { transform: translateX(-50%); } }
        @keyframes abg-pulse { 0%,100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.06); } }
      `}</style>

      {id === "aurora" && <AuroraEffect intensity={65} color="#8a7bff" />}

      {id === "ember" && (
        <>
          {Array.from({ length: 18 }, (_, i) => {
            const left = (i * 53) % 100;
            const size = 2 + ((i * 7) % 4);
            const duration = 5 + ((i * 13) % 7);
            const delay = -((i * 17) % 9);
            return (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${left}%`,
                  bottom: "-4%",
                  width: `${size}px`,
                  height: `${size}px`,
                  background: i % 3 === 0 ? "#ffb86b" : "#ff5f56",
                  boxShadow: `0 0 ${size * 3}px ${i % 3 === 0 ? "#ffb86b" : "#ff5f56"}`,
                  animation: `abg-rise ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
          <div className="absolute inset-x-0 bottom-0 h-1/3 opacity-40" style={{ background: "linear-gradient(to top, rgba(255,95,86,0.25), transparent)" }} />
        </>
      )}

      {id === "beams" && (
        <>
          <div className="absolute left-1/2 top-1/2 w-[160%] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-50" style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(91,108,245,0.5) 12deg, transparent 24deg, transparent 60deg, rgba(168,85,247,0.45) 72deg, transparent 84deg, transparent 140deg, rgba(34,211,238,0.4) 152deg, transparent 164deg, transparent 220deg, rgba(91,108,245,0.5) 232deg, transparent 244deg, transparent 360deg)", animation: "abg-spin 26s linear infinite" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 75%)" }} />
        </>
      )}

      {id === "mist" && (
        <>
          <div className="absolute inset-y-0 -left-[20%] w-[90%] opacity-50 blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(91,108,245,0.55) 0%, transparent 70%)", animation: "abg-mist-x 16s ease-in-out infinite" }} />
          <div className="absolute inset-y-0 -right-[20%] w-[90%] opacity-40 blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.45) 0%, transparent 70%)", animation: "abg-mist-x 20s ease-in-out infinite reverse" }} />
        </>
      )}

      {id === "waves" && (
        <>
          {[0, 1, 2].map((layer) => (
            <div
              key={layer}
              className="absolute inset-y-0 w-[200%]"
              style={{
                background: `repeating-linear-gradient(${115 + layer * 12}deg, transparent 0px, transparent 46px, ${layer === 1 ? "rgba(168,85,247,0.28)" : "rgba(91,108,245,0.28)"} 48px, transparent 52px)`,
                animation: `abg-wave-x ${14 + layer * 6}s linear infinite${layer === 2 ? " reverse" : ""}`,
                opacity: 0.7,
              }}
            />
          ))}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))" }} />
        </>
      )}

      {id === "pulsegrid" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(91,108,245,0.7) 1.2px, transparent 1.2px)",
            backgroundSize: "26px 26px",
            animation: "abg-pulse 4s ease-in-out infinite",
            maskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 20%, transparent 78%)",
          }}
        />
      )}
    </div>
  );
}
