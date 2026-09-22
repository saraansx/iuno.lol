"use client";

import { useEffect, useRef } from "react";
import { clickSoundUrl, isClickEffect } from "@/lib/click-effects";

interface ClickEffectsProps {
  effect?: string | null;
  sound?: string | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  kind: "spark" | "heart" | "star" | "confetti" | "bubble" | "snow" | "ember" | "petal" | "ring" | "firework";
}

const BUBBLE_COLORS = ["#bdeaff", "#ffffff", "#9be8ff"];
const HEART_COLORS = ["#ff5b7f", "#ff8fab", "#ff2e63"];
const STAR_COLORS = ["#ffc7e3", "#c4b5fd", "#a7f3d0", "#ffffff"];
const CONFETTI_COLORS = ["#5b6cf5", "#f472b6", "#4ade80", "#facc15", "#ffffff"];
const SNOW_COLORS = ["#ffffff", "#dbeafe", "#bae6fd"];
const EMBER_COLORS = ["#ffdd88", "#ff9d3c", "#ff5b21", "#ffc46b"];
const PETAL_COLORS = ["#ffb7c9", "#ff8fab", "#ffc2d4", "#f9a8d4"];
const FIREWORK_COLORS = ["#5b6cf5", "#f472b6", "#4ade80", "#facc15", "#38bdf8", "#ffffff"];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size / 16;
  ctx.beginPath();
  ctx.moveTo(0, 5 * s);
  ctx.bezierCurveTo(-8 * s, -2 * s, -5 * s, -9 * s, 0, -4 * s);
  ctx.bezierCurveTo(5 * s, -9 * s, 8 * s, -2 * s, 0, 5 * s);
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const r1 = size / 2;
  const r2 = size / 6;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (i * Math.PI) / 4;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function spawn(effect: string, x: number, y: number): Particle[] {
  const out: Particle[] = [];
  if (effect === "spark") {
    // ClickSpark style: evenly spaced radial line bursts (reactbits)
    const count = 8;
    const radius = 15;
    const duration = 400;
    for (let i = 0; i < count; i++) {
      out.push({
        x, y,
        vx: 0, vy: 0,
        life: 0, maxLife: duration,
        size: radius,
        color: "#ffffff",
        rotation: (2 * Math.PI * i) / count, spin: 0, kind: "spark",
      });
    }
  } else if (effect === "hearts") {
    for (let i = 0; i < 8; i++) {
      out.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -(0.8 + Math.random() * 1.6),
        life: 0, maxLife: 800 + Math.random() * 300,
        size: 5 + Math.random() * 6,
        color: pick(HEART_COLORS),
        rotation: (Math.random() - 0.5) * 0.6, spin: (Math.random() - 0.5) * 0.04,
        kind: "heart",
      });
    }
  } else if (effect === "sparkles") {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.3 + Math.random() * 0.9;
      out.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(a) * sp,
        vy: -0.3 - Math.random() * 0.8,
        life: 0, maxLife: 800 + Math.random() * 300,
        size: 4 + Math.random() * 4,
        color: pick(STAR_COLORS),
        rotation: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.1,
        kind: "star",
      });
    }
  } else if (effect === "bubbles") {
    for (let i = 0; i < 10; i++) {
      out.push({
        x: x + (Math.random() - 0.5) * 32,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(0.5 + Math.random() * 1.2),
        life: 0, maxLife: 900 + Math.random() * 400,
        size: 3 + Math.random() * 6,
        color: pick(BUBBLE_COLORS),
        rotation: 0, spin: 0, kind: "bubble",
      });
    }
  } else if (effect === "confetti") {
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const sp = 2.5 + Math.random() * 4;
      out.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0, maxLife: 900 + Math.random() * 400,
        size: 4 + Math.random() * 5,
        color: pick(CONFETTI_COLORS),
        rotation: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.3,
        kind: "confetti",
      });
    }
  } else if (effect === "snow") {
    for (let i = 0; i < 14; i++) {
      out.push({
        x: x + (Math.random() - 0.5) * 48,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.5 + Math.random() * 1.1,
        life: 0, maxLife: 1100 + Math.random() * 500,
        size: 1.5 + Math.random() * 3,
        color: pick(SNOW_COLORS),
        rotation: 0, spin: 0, kind: "snow",
      });
    }
  } else if (effect === "ember") {
    for (let i = 0; i < 12; i++) {
      out.push({
        x: x + (Math.random() - 0.5) * 28,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 1,
        vy: -(0.8 + Math.random() * 1.8),
        life: 0, maxLife: 700 + Math.random() * 400,
        size: 2 + Math.random() * 3.5,
        color: pick(EMBER_COLORS),
        rotation: 0, spin: 0, kind: "ember",
      });
    }
  } else if (effect === "petals") {
    for (let i = 0; i < 10; i++) {
      out.push({
        x: x + (Math.random() - 0.5) * 36,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(0.2 + Math.random() * 0.9),
        life: 0, maxLife: 1000 + Math.random() * 400,
        size: 4 + Math.random() * 5,
        color: pick(PETAL_COLORS),
        rotation: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.15,
        kind: "petal",
      });
    }
  } else if (effect === "rings") {
    for (let i = 0; i < 2; i++) {
      out.push({
        x, y,
        vx: 0, vy: 0,
        life: -i * 120, maxLife: 600,
        size: 6,
        color: "#ffffff",
        rotation: 0, spin: 0, kind: "ring",
      });
    }
  } else if (effect === "fireworks") {
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 4.5;
      out.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0, maxLife: 800 + Math.random() * 400,
        size: 1.5 + Math.random() * 2.5,
        color: pick(FIREWORK_COLORS),
        rotation: 0, spin: 0, kind: "firework",
      });
    }
  }
  return out;
}

export default function ClickEffects({ effect, sound }: ClickEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const effectRef = useRef(effect);
  const soundRef = useRef(sound);
  useEffect(() => {
    effectRef.current = effect;
    soundRef.current = sound;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Preload the click sound so the first tap plays instantly.
    let warmAudio: HTMLAudioElement | null = null;
    const soundUrl = clickSoundUrl(soundRef.current);
    if (soundUrl) {
      try {
        warmAudio = new Audio(soundUrl);
        warmAudio.preload = "auto";
        warmAudio.volume = 0.7;
        warmAudio.load();
      } catch {
        warmAudio = null;
      }
    }

    const stopLoop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const frame = () => {
      const list = particlesRef.current;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (list.length === 0) {
        rafRef.current = null;
        return;
      }
      const dt = 16.7;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life += dt;
        if (p.life < 0) continue;
        if (p.life >= p.maxLife) {
          list.splice(i, 1);
          continue;
        }
        const t = p.life / p.maxLife;
        const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        if (p.kind === "confetti") p.vy += 0.12;
        if (p.kind === "firework") { p.vy += 0.09; p.vx *= 0.985; p.vy *= 0.99; }
        if (p.kind === "heart" || p.kind === "bubble") p.vx += Math.sin((p.life / 160) * Math.PI) * 0.02;
        if (p.kind === "snow" || p.kind === "petal") p.vx += Math.sin((p.life / 200) * Math.PI) * 0.03;
        if (p.kind === "petal") p.vy += 0.02;
        if (p.kind === "ember") { p.vx += Math.sin((p.life / 140) * Math.PI) * 0.04; p.vy -= 0.005; }
        if (p.kind !== "spark") {
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.spin;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        if (p.kind === "spark") {
          // ClickSpark: ease-out travel + shrinking line length
          const eased = t * (2 - t);
          const distance = eased * p.size;
          const lineLength = 10 * (1 - eased);
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(distance, 0);
          ctx.lineTo(distance + lineLength, 0);
          ctx.stroke();
        } else if (p.kind === "heart") {
          drawHeart(ctx, p.size * (1 - t * 0.3));
        } else if (p.kind === "star") {
          const tw = 0.6 + 0.4 * Math.sin((p.life / 90) * Math.PI);
          drawStar(ctx, p.size * tw);
        } else if (p.kind === "bubble") {
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.5, p.size * (1 - t * 0.15)), 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-p.size * 0.25, -p.size * 0.3, Math.max(0.4, p.size * 0.18), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "snow") {
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "ember") {
          const flicker = 0.7 + 0.3 * Math.sin((p.life / 60) * Math.PI);
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha)) * flicker;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.5, p.size * (1 - t * 0.4)), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.fillStyle = "#fff7d6";
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.4, p.size * 0.35 * (1 - t * 0.4)), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "petal") {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.55, p.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "ring") {
          const radius = p.size + t * 52;
          ctx.lineWidth = Math.max(0.5, 3 * (1 - t) + 0.5);
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.kind === "firework") {
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.4, p.size * (1 - t * 0.5)), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (rafRef.current === null && particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(frame);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const fx = effectRef.current;
      const url = clickSoundUrl(soundRef.current);
      if (url) {
        try {
          const audio = new Audio(url);
          audio.volume = 0.7;
          audio.play().catch(() => {});
        } catch {
          // ignore playback errors
        }
      }
      if (!fx || !isClickEffect(fx) || fx === "none" || reducedMotion) return;
      particlesRef.current.push(...spawn(fx, e.clientX, e.clientY));
      kick();
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", resize);
      stopLoop();
      particlesRef.current = [];
      try {
        warmAudio?.pause();
      } catch {
        // ignore cleanup errors
      }
      warmAudio = null;
    };
  }, []);

  const active = (effect && effect !== "none") || clickSoundUrl(sound);
  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[70] pointer-events-none"
    />
  );
}
