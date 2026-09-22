"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  twinkleOffset: number;
  twinkleSpeed: number;
  life: number;
  maxLife: number;
}

export function StardustTrail({ color = "#ffffff" }: { color?: string }) {
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

    const motes: Mote[] = [];
    const MAX_MOTES = 70;
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

        if (dist > 4) {
          const count = Math.min(3, Math.floor(dist / 7) + 1);
          for (let i = 0; i < count; i++) {
            if (motes.length < MAX_MOTES) {
              const life = 40 + Math.random() * 30;
              motes.push({
                x: x + (Math.random() - 0.5) * 14,
                y: y + (Math.random() - 0.5) * 14,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.2 - Math.random() * 0.5,
                size: 1 + Math.random() * 2.5,
                twinkleOffset: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.12 + Math.random() * 0.15,
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

      if (motes.length > 0) {
        const rgb = rgbColorRef.current;

        for (let i = motes.length - 1; i >= 0; i--) {
          const p = motes[i];
          p.x += p.vx + Math.sin(time * 0.04 + p.twinkleOffset) * 0.15;
          p.y += p.vy;
          p.life -= 1;

          if (p.life <= 0) {
            motes.splice(i, 1);
            continue;
          }

          const progress = p.life / p.maxLife;
          const twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpeed + p.twinkleOffset);
          const alpha = progress * (0.3 + 0.7 * twinkle);

          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${rgb}, ${alpha})`;
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // tiny sparkle cross
          if (p.size > 1.8) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * 2, p.y);
            ctx.lineTo(p.x + p.size * 2, p.y);
            ctx.moveTo(p.x, p.y - p.size * 2);
            ctx.lineTo(p.x, p.y + p.size * 2);
            ctx.stroke();
          }
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
