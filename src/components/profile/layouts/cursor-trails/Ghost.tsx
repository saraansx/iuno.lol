"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

interface GhostSnapshot {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 19.2);
  ctx.lineTo(5.4, 14.4);
  ctx.lineTo(10.2, 24);
  ctx.lineTo(13.8, 22.2);
  ctx.lineTo(9, 13.2);
  ctx.lineTo(16.2, 13.2);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function GhostTrail({ color = "#ffffff" }: { color?: string }) {
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

    const ghosts: GhostSnapshot[] = [];
    const MAX_GHOSTS = 32;
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
          ghosts.unshift({
            x,
            y,
            opacity: 0.85,
            scale: 1,
          });

          if (ghosts.length > MAX_GHOSTS) {
            ghosts.pop();
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

      if (ghosts.length > 0) {
        const rgb = hexToRgb(colorRef.current);

        for (let i = ghosts.length - 1; i >= 0; i--) {
          const g = ghosts[i];
          g.opacity *= 0.95;
          g.scale *= 0.992;

          if (g.opacity < 0.02) {
            ghosts.splice(i, 1);
            continue;
          }

          ctx.shadowBlur = 14;
          ctx.shadowColor = `rgba(${rgb}, ${g.opacity * 0.85})`;
          ctx.fillStyle = `rgba(${rgb}, ${g.opacity * 0.35})`;
          ctx.strokeStyle = `rgba(${rgb}, ${g.opacity * 0.95})`;
          ctx.lineWidth = 1.5;

          drawCursor(ctx, g.x, g.y, g.scale);
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
