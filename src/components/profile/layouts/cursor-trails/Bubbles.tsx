"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  life: number;
  maxLife: number;
}

export function BubblesTrail({ color = "#ffffff" }: { color?: string }) {
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

    const bubbles: Bubble[] = [];
    const MAX_BUBBLES = 45;
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

        if (dist > 6) {
          const count = Math.min(2, Math.floor(dist / 10) + 1);
          for (let i = 0; i < count; i++) {
            if (bubbles.length < MAX_BUBBLES) {
              const life = 50 + Math.random() * 35;
              bubbles.push({
                x: x + (Math.random() - 0.5) * 16,
                y: y + (Math.random() - 0.5) * 16,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -(0.3 + Math.random() * 0.7),
                size: 3 + Math.random() * 8,
                wobbleOffset: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.05 + Math.random() * 0.05,
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

      if (bubbles.length > 0) {
        const rgb = rgbColorRef.current;

        for (let i = bubbles.length - 1; i >= 0; i--) {
          const p = bubbles[i];
          p.x += p.vx + Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * 0.4;
          p.y += p.vy;
          p.life -= 1;

          if (p.life <= 0) {
            bubbles.splice(i, 1);
            continue;
          }

          const progress = p.life / p.maxLife;
          const alpha = progress * 0.8;
          const radius = p.size * (0.6 + 0.4 * progress);

          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${rgb}, ${alpha * 0.4})`;
          ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
          ctx.beginPath();
          ctx.arc(p.x - radius * 0.3, p.y - radius * 0.3, Math.max(0.5, radius * 0.2), 0, Math.PI * 2);
          ctx.fill();
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
