"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface Particle {
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

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();

  const outer = size;
  const inner = size * 0.22;

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const aMid = a + Math.PI / 4;

    if (i === 0) {
      ctx.moveTo(Math.cos(a) * outer, Math.sin(a) * outer);
    } else {
      ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    }
    ctx.lineTo(Math.cos(aMid) * inner, Math.sin(aMid) * inner);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function StarsTrail({ color = "#ffffff" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);

  useEffect(() => {
    colorRef.current = color;
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

    const particles: Particle[] = [];
    const MAX_PARTICLES = 60;
    let lastMousePos = { x: 0, y: 0 };
    let hasMouse = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (hasMouse) {
        const dx = x - lastMousePos.x;
        const dy = y - lastMousePos.y;
        const dist = Math.hypot(dx, dy);

        // Spawn particles based on distance moved
        if (dist > 4) {
          const count = Math.min(3, Math.floor(dist / 8) + 1);
          for (let i = 0; i < count; i++) {
            if (particles.length < MAX_PARTICLES) {
              const speed = 0.4 + Math.random() * 0.8;
              const angle = Math.random() * Math.PI * 2;
              const life = 24 + Math.random() * 18;

              particles.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.2, // slight upward drift
                size: 4 + Math.random() * 6,
                rotation: Math.random() * Math.PI,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                life,
                maxLife: life,
              });
            }
          }
        }
      }

      lastMousePos = { x, y };
      hasMouse = true;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (particles.length > 0) {
        const rgb = hexToRgb(colorRef.current);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.life -= 1;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          const progress = p.life / p.maxLife; // 1 down to 0
          const alpha = progress * 0.9;
          const currentSize = p.size * (0.4 + 0.6 * progress);

          // Glow pass
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${rgb}, ${alpha})`;
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          drawFourPointStar(ctx, p.x, p.y, currentSize, p.rotation);

          // Core bright pass
          ctx.shadowBlur = 3;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          drawFourPointStar(ctx, p.x, p.y, currentSize * 0.5, p.rotation);
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
