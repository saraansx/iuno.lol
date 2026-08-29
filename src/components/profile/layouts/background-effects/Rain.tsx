"use client";

import { useEffect, useRef } from "react";
export function RainEffect({ intensity = 50, color = "#ffffff" }: { intensity?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ intensity, color });

  useEffect(() => {
    propsRef.current = { intensity, color };
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

    const drops: { x: number; y: number; length: number; speed: number; thickness: number; opacity: number }[] = [];

    const createDrop = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: (Math.random() * 0.02 + 0.01) * height,
      speed: (Math.random() * 0.006 + 0.004) * height,
      thickness: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const targetCount = Math.floor((propsRef.current.intensity / 100) * 800);
      while (drops.length < targetCount) drops.push(createDrop());
      while (drops.length > targetCount) drops.pop();
      
      for (const drop of drops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.strokeStyle = propsRef.current.color;
        ctx.globalAlpha = drop.opacity;
        ctx.lineWidth = drop.thickness;
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
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
