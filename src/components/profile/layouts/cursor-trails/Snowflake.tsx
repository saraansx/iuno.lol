"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface Flake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

function drawSnowflake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineWidth = Math.max(1, size * 0.18);
  ctx.lineCap = "round";

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ex = Math.cos(a) * size;
    const ey = Math.sin(a) * size;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const bx = Math.cos(a) * size * 0.6;
    const by = Math.sin(a) * size * 0.6;
    const tipLen = size * 0.3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a + 0.7) * tipLen, by + Math.sin(a + 0.7) * tipLen);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a - 0.7) * tipLen, by + Math.sin(a - 0.7) * tipLen);
    ctx.stroke();
  }

  ctx.restore();
}

export function SnowflakeTrail({ color = "#ffffff" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rgbColorRef = useRef(hexToRgb(color));

  useEffect(() => {
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

    const flakes: Flake[] = [];
    const MAX_FLAKES = 50;
    let lastPos = { x: 0, y: 0 };
    let hasMouse = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (hasMouse) {
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 6) {
          const count = Math.min(2, Math.floor(dist / 10) + 1);
          for (let i = 0; i < count; i++) {
            if (flakes.length < MAX_FLAKES) {
              const life = 45 + Math.random() * 30;
              flakes.push({
                x: x + (Math.random() - 0.5) * 14,
                y: y + (Math.random() - 0.5) * 14,
                vx: (Math.random() - 0.5) * 0.7,
                vy: 0.4 + Math.random() * 0.7,
                size: 5 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
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

      if (flakes.length > 0) {
        const rgb = rgbColorRef.current;

        for (let i = flakes.length - 1; i >= 0; i--) {
          const p = flakes[i];
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.life -= 1;

          if (p.life <= 0) {
            flakes.splice(i, 1);
            continue;
          }

          const progress = p.life / p.maxLife;
          const alpha = progress * 0.9;

          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.5})`;
          ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
          drawSnowflake(ctx, p.x, p.y, p.size * (0.5 + 0.5 * progress), p.rotation);
        }
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
