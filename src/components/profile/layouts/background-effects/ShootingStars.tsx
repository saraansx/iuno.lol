"use client";

import React, { useEffect, useRef } from "react";

function hexToRgb(hex: string) {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map(c => c + c).join("");
  }
  if (clean.length !== 6) return "255, 255, 255";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

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

    class Star {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      active: boolean;

      constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.speed = 0;
        this.opacity = 0;
      }

      spawn() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5; // Spawn mostly in upper half
        this.length = (Math.random() * 0.08 + 0.02) * width; // Relative length
        this.speed = (Math.random() * 0.004 + 0.002) * width; // Relative speed
        this.opacity = Math.random() * 0.8 + 0.2;
        this.active = true;
      }

      update() {
        if (!this.active) return;
        
        // Move down and left
        this.x -= this.speed;
        this.y += this.speed * 0.6; // Angle
        this.opacity -= 0.005; // Fade out slower

        if (this.opacity <= 0 || this.x < 0 || this.y > height) {
          this.active = false;
        }
      }

      draw(currentRgbColor: string) {
        if (!this.active || !ctx) return;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y - this.length * 0.6);
        
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y - this.length * 0.6);
        gradient.addColorStop(0, `rgba(${currentRgbColor}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${currentRgbColor}, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    let stars: Star[] = [];

    const render = () => {
      const currentRgbColor = hexToRgb(propsRef.current.color);
      const targetCount = Math.floor((propsRef.current.intensity / 100) * 15) + 2;
      
      while (stars.length < targetCount) stars.push(new Star());
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
