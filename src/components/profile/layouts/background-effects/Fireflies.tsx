"use client";
import { hexToRgb } from "@/lib/utils";

import { useEffect, useRef } from "react";
export function FirefliesEffect({ intensity = 50, color = "#ffe97a" }: { intensity?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ intensity, color });
  const rgbColorRef = useRef(hexToRgb(color, "255, 233, 122"));

  useEffect(() => {
    propsRef.current = { intensity, color };
    rgbColorRef.current = hexToRgb(color, "255, 233, 122");
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

    type Fly = {
      x: number;
      y: number;
      r: number;
      phase: number;
      blinkSpeed: number;
      driftAngle: number;
      driftSpeed: number;
      swayPhase: number;
    };

    const flies: Fly[] = [];
    const spawn = (): Fly => ({
      x: Math.random() * (width || window.innerWidth),
      y: Math.random() * (height || window.innerHeight),
      r: Math.random() * 1.8 + 0.8,
      phase: Math.random() * Math.PI * 2,
      blinkSpeed: Math.random() * 0.03 + 0.008,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.25 + 0.08,
      swayPhase: Math.random() * Math.PI * 2,
    });

    const render = () => {
      const targetCount = Math.floor((propsRef.current.intensity / 100) * 70);
      while (flies.length < targetCount) flies.push(spawn());
      while (flies.length > targetCount) flies.pop();

      const rgb = rgbColorRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const f of flies) {
        f.phase += f.blinkSpeed;
        f.swayPhase += 0.008;
        f.driftAngle += (Math.random() - 0.5) * 0.03;
        f.x += Math.cos(f.driftAngle) * f.driftSpeed + Math.sin(f.swayPhase) * 0.15;
        f.y += Math.sin(f.driftAngle) * f.driftSpeed;

        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        if (f.y > height + 10) f.y = -10;

        const glow = (Math.sin(f.phase) + 1) / 2;
        const alpha = 0.15 + glow * 0.85;
        const halo = f.r * (3 + glow * 4);

        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, halo);
        grad.addColorStop(0, `rgba(${rgb}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${rgb}, ${alpha * 0.35})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, halo, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
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
