"use client";
import { hexToRgb } from "@/lib/utils";

import { useEffect, useRef } from "react";
export function ShootingStarsEffect({ intensity = 50, color = "#ffffff" }: { intensity?: number; color?: string }) {
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

    type Star = {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      active: boolean;
      spawn: () => void;
      update: () => void;
      draw: (currentRgbColor: string) => void;
    };

    const createStar = (): Star => {
      const star = {
        active: false,
        x: 0,
        y: 0,
        length: 0,
        speed: 0,
        opacity: 0,
        spawn: () => {
          star.x = Math.random() * width;
          star.y = Math.random() * height * 0.5; // Spawn mostly in upper half
          star.length = (Math.random() * 0.08 + 0.02) * width; // Relative length
          star.speed = (Math.random() * 0.004 + 0.002) * width; // Relative speed
          star.opacity = Math.random() * 0.8 + 0.2;
          star.active = true;
        },
        update: () => {
          if (!star.active) return;
          
          // Move down and left
          star.x -= star.speed;
          star.y += star.speed * 0.6; // Angle
          star.opacity -= 0.005; // Fade out slower

          if (star.opacity <= 0 || star.x < 0 || star.y > height) {
            star.active = false;
          }
        },
        draw: (currentRgbColor: string) => {
          if (!star.active || !ctx) return;
          
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x + star.length, star.y - star.length * 0.6);
          
          const gradient = ctx.createLinearGradient(star.x, star.y, star.x + star.length, star.y - star.length * 0.6);
          gradient.addColorStop(0, `rgba(${currentRgbColor}, ${star.opacity})`);
          gradient.addColorStop(1, `rgba(${currentRgbColor}, 0)`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      };
      return star;
    };

    const stars: Star[] = [];

    const render = () => {
      const currentRgbColor = hexToRgb(propsRef.current.color);
      const targetCount = Math.floor((propsRef.current.intensity / 100) * 15) + 2;
      
      while (stars.length < targetCount) stars.push(createStar());
      while (stars.length > targetCount) stars.pop();

      ctx.clearRect(0, 0, width, height);

      // Handle spawn chance based on intensity
      const spawnChance = (propsRef.current.intensity / 100) * 0.05;

      for (const star of stars) {
        if (!star.active && Math.random() < spawnChance) {
          star.spawn();
        }
        
        if (star.active) {
          star.update();
          star.draw(currentRgbColor);
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
