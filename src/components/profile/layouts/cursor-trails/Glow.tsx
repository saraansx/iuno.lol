"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface GlowDot {
  x: number;
  y: number;
  size: number;
  phase: number;
  life: number;
  maxLife: number;
}

export function GlowTrail({ color = "#ffffff" }: { color?: string }) {
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

    const dots: GlowDot[] = [];
    const MAX_DOTS = 80;
    let lastPos = { x: 0, y: 0 };
    let hasMouse = false;
    let time = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = x;
      mouseY = y;

      if (hasMouse) {
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          const steps = Math.min(6, Math.max(1, Math.floor(dist / 5)));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const px = lastPos.x + dx * t;
            const py = lastPos.y + dy * t;
            if (dots.length < MAX_DOTS) {
              const life = 35 + Math.random() * 15;
              dots.push({
                x: px + (Math.random() - 0.5) * 6,
                y: py + (Math.random() - 0.5) * 6,
                size: 14 + Math.random() * 16,
                phase: Math.random() * Math.PI * 2,
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

      ctx.globalCompositeOperation = "lighter";

      if (dots.length > 0) {
        const rgb = rgbColorRef.current;

        for (let i = dots.length - 1; i >= 0; i--) {
          const p = dots[i];
          p.life -= 1;

          if (p.life <= 0) {
            dots.splice(i, 1);
            continue;
          }

          const progress = p.life / p.maxLife;
          const breath = 0.75 + 0.25 * Math.sin(time * 0.12 + p.phase);
          const alpha = progress * 0.35 * breath;
          const radius = p.size * (0.7 + 0.3 * progress) * breath;

          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
          gradient.addColorStop(0.35, `rgba(${rgb}, ${alpha * 0.55})`);
          gradient.addColorStop(1, `rgba(${rgb}, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (mouseX > -999) {
        const rgb = rgbColorRef.current;
        const coreR = 10 + 3 * Math.sin(time * 0.15);
        const core = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, coreR * 2.5);
        core.addColorStop(0, `rgba(255, 255, 255, 0.85)`);
        core.addColorStop(0.3, `rgba(${rgb}, 0.5)`);
        core.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, coreR * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
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
