"use client";
import { hexToRgb } from "@/lib/utils";

import { useEffect, useRef } from "react";
export function ParticlesEffect({ intensity = 50, color = "#ffffff" }: { intensity?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ intensity, color });
  const rgbColorRef = useRef(hexToRgb(color));

  useEffect(() => {
    propsRef.current = { intensity, color };
    rgbColorRef.current = hexToRgb(color);
  }, [intensity, color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let animationFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      update: () => void;
      draw: (currentRgbColor: string) => void;
    };

    const createParticle = (): Particle => {
      const p = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 1.6,
        opacity: Math.random() * 0.35 + 0.45,
        update: () => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        },
        draw: (currentRgbColor: string) => {
          if (!ctx) return;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${currentRgbColor}, ${p.opacity})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${currentRgbColor}, ${p.opacity * 0.6})`;
          ctx.fill();
        }
      };
      return p;
    };

    const particles: Particle[] = [];

    const render = () => {
      const currentRgbColor = rgbColorRef.current;
      const targetCount = Math.floor((propsRef.current.intensity / 100) * 200);
      
      while (particles.length < targetCount) particles.push(createParticle());
      while (particles.length > targetCount) particles.pop();

      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw(currentRgbColor);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
  );
}
