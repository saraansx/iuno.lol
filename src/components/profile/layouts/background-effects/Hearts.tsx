"use client";
import { hexToRgb } from "@/lib/utils";

import { useEffect, useRef } from "react";
export function HeartsEffect({ intensity = 50, color = "#ffb6c1" }: { intensity?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ intensity, color });
  const rgbColorRef = useRef(hexToRgb(color, "255, 182, 193"));

  useEffect(() => {
    propsRef.current = { intensity, color };
    rgbColorRef.current = hexToRgb(color, "255, 182, 193");
  }, [intensity, color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    type Heart = {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      sway: number;
      swaySpeed: number;
      time: number;
      update: () => void;
      draw: (currentRgbColor: string) => void;
    };

    const createHeart = (): Heart => {
      const heart = {
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight) + (height || window.innerHeight),
        size: Math.random() * 10 + 8,
        speed: Math.random() * 0.6 + 0.3, 
        opacity: Math.random() * 0.4 + 0.2,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.01 + 0.005,
        time: 0,
        update: () => {
          heart.y -= heart.speed;
          heart.time += heart.swaySpeed;
          
          heart.x += Math.sin(heart.time) * 0.5;

          if (heart.y < -heart.size * 2) {
            heart.y = height + heart.size * 2;
            heart.x = Math.random() * width;
          }
        },
        draw: (currentRgbColor: string) => {
          if (!ctx) return;

          const topCurveHeight = heart.size * 0.3;
          ctx.beginPath();
          ctx.moveTo(heart.x, heart.y + topCurveHeight);
          ctx.bezierCurveTo(
            heart.x - heart.size / 2, heart.y - heart.size / 2,
            heart.x - heart.size, heart.y + topCurveHeight,
            heart.x, heart.y + heart.size
          );
          ctx.bezierCurveTo(
            heart.x + heart.size, heart.y + topCurveHeight,
            heart.x + heart.size / 2, heart.y - heart.size / 2,
            heart.x, heart.y + topCurveHeight
          );
          ctx.closePath();

          ctx.fillStyle = `rgba(${currentRgbColor}, ${heart.opacity})`;
          ctx.fill();
        }
      };
      return heart;
    };

    const hearts: Heart[] = [];

    const render = () => {
      const currentRgbColor = rgbColorRef.current;
      const targetCount = Math.floor((propsRef.current.intensity / 100) * 80);
      
      while (hearts.length < targetCount) hearts.push(createHeart());
      while (hearts.length > targetCount) hearts.pop();

      ctx.clearRect(0, 0, width, height);
      
      for (const heart of hearts) {
        heart.update();
        heart.draw(currentRgbColor);
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
