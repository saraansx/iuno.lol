"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  swayOffset: number;
  swaySpeed: number;
  flip: number;
  flipSpeed: number;
  life: number;
  maxLife: number;
}

const PETAL_PATH = new Path2D(
  "M 0 -1 C 0.75 -0.5, 0.8 0.6, 0 1 C -0.8 0.6, -0.75 -0.5, 0 -1 Z"
);

function drawPetal(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  x: number,
  y: number,
  size: number,
  rotation: number,
  flip: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const scaleX = size * Math.cos(flip);
  const scaleY = size;

  ctx.setTransform(
    (cosR * scaleX) * dpr,
    (sinR * scaleX) * dpr,
    (-sinR * scaleY) * dpr,
    (cosR * scaleY) * dpr,
    x * dpr,
    y * dpr
  );

  ctx.fill(PETAL_PATH);
}

export function SakuraTrail({ color = "#ffffff" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  const rgbColorRef = useRef(hexToRgb(color));

  useEffect(() => {
    colorRef.current = color;
    rgbColorRef.current = hexToRgb(color);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!window.matchMedia("(pointer: fine)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const petals: Petal[] = [];
    const MAX_PETALS = 55;
    let lastPos = { x: 0, y: 0 };
    let hasMouse = false;
    let time = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (hasMouse) {
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
          const spawnCount = Math.min(2, Math.floor(dist / 10) + 1);
          for (let i = 0; i < spawnCount; i++) {
            if (petals.length < MAX_PETALS) {
              const life = 50 + Math.random() * 35;
              petals.push({
                x: x + (Math.random() - 0.5) * 12,
                y: y + (Math.random() - 0.5) * 12,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 0.6 + Math.random() * 0.9,
                size: 5 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.04,
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.03 + Math.random() * 0.03,
                flip: Math.random() * Math.PI,
                flipSpeed: 0.02 + Math.random() * 0.04,
                life,
                maxLife: life,
              });
            }
          }
          lastPos = { x, y };
        }
      } else {
        lastPos = { x, y };
        hasMouse = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      if (petals.length > 0) {
        const rgb = rgbColorRef.current;

        for (let i = petals.length - 1; i >= 0; i--) {
          const p = petals[i];
          p.life -= 1;

          if (p.life <= 0) {
            petals.splice(i, 1);
            continue;
          }

          const sway = Math.sin(time * p.swaySpeed + p.swayOffset) * 0.6;
          p.x += p.vx + sway;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.flip += p.flipSpeed;

          const progress = p.life / p.maxLife;
          const alpha = progress * 0.85;

          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.6})`;
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;

          drawPetal(ctx, dpr, p.x, p.y, p.size, p.rotation, p.flip);
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
