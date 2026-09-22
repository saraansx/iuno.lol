"use client";
import { hexToRgb } from "@/lib/utils";

import { useEffect, useRef } from "react";
export function MeteorsEffect({ intensity = 50, color = "#ffffff" }: { intensity?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ intensity, color });
  const rgbColorRef = useRef(hexToRgb(color, "255, 255, 255"));

  useEffect(() => {
    propsRef.current = { intensity, color };
    rgbColorRef.current = hexToRgb(color, "255, 255, 255");
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

    type Meteor = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      tail: number;
    };

    let meteors: Meteor[] = [];
    let spawnTimer = 0;

    const spawn = (): Meteor => {
      const angle = Math.PI * (0.72 + Math.random() * 0.1);
      const speed = Math.random() * 5 + 5;
      const fromTop = Math.random() < 0.7;
      const maxLife = 70 + Math.random() * 40;
      return {
        x: fromTop ? Math.random() * (width + 200) - 100 : width + 60,
        y: fromTop ? -60 : Math.random() * height * 0.5,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed * -1,
        size: Math.random() * 2.2 + 1.4,
        life: maxLife,
        maxLife,
        tail: Math.random() * 60 + 70,
      };
    };

    const render = () => {
      const intensityVal = propsRef.current.intensity / 100;
      const rgb = rgbColorRef.current;

      spawnTimer -= 1 + intensityVal * 3;
      if (spawnTimer <= 0) {
        meteors.push(spawn());
        if (Math.random() < intensityVal * 0.5) meteors.push(spawn());
        spawnTimer = 30 + Math.random() * (90 - intensityVal * 70);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      meteors = meteors.filter((m) => m.life > 0 && m.x > -200 && m.y < height + 200);
      for (const m of meteors) {
        m.x += m.vx;
        m.y += Math.abs(m.vy);
        m.life -= 1;
        const fade = Math.min(1, m.life / (m.maxLife * 0.5));

        const mag = Math.hypot(m.vx, m.vy) || 1;
        const dx = (m.vx / mag) * m.tail;
        const dy = (Math.abs(m.vy) / mag) * m.tail;

        const grad = ctx.createLinearGradient(m.x, m.y, m.x - dx, m.y - dy);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * fade})`);
        grad.addColorStop(0.25, `rgba(${rgb}, ${0.8 * fade})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.size;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - dx, m.y - dy);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
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
