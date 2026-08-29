"use client";

import { useEffect, useRef } from "react";
import { hexToRgb } from "@/lib/utils";

const POINT_COUNT = 24;
const HEAD_EASE = 0.5;
const CHAIN_EASE = 0.32;
const MAX_WIDTH = 4;

const PASSES = [
  { widthScale: 2.4, alpha: 0.2, blur: 20 },
  { widthScale: 1, alpha: 0.95, blur: 8 },
];

export function FluidLineTrail({ color = "#ffffff" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  const rgbColorRef = useRef(hexToRgb(color));

  useEffect(() => {
    colorRef.current = color;
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

    const points = Array.from({ length: POINT_COUNT }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    let seeded = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;

      if (!seeded) {
        seeded = true;
        for (const p of points) {
          p.x = target.x;
          p.y = target.y;
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      const rgb = rgbColorRef.current;
      const last = points.length - 1;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = `rgba(${rgb}, 0.9)`;

      for (const pass of PASSES) {
        ctx.shadowBlur = pass.blur;

        for (let i = 1; i < last; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];

          const taper = 1 - i / last;

          ctx.beginPath();
          ctx.moveTo((prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
          ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
          ctx.lineWidth = Math.max(0.4, MAX_WIDTH * taper * pass.widthScale);
          ctx.strokeStyle = `rgba(${rgb}, ${pass.alpha * taper})`;
          ctx.stroke();
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (seeded) {
        const head = points[0];
        head.x += (target.x - head.x) * HEAD_EASE;
        head.y += (target.y - head.y) * HEAD_EASE;

        for (let i = 1; i < points.length; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * CHAIN_EASE;
          points[i].y += (points[i - 1].y - points[i].y) * CHAIN_EASE;
        }

        const tail = points[points.length - 1];
        const spread = Math.hypot(head.x - tail.x, head.y - tail.y);
        if (spread > 1.5) draw();
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
