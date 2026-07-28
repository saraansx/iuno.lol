"use client";

import React, { useEffect, useRef } from "react";

function hexToRgb(hex: string) {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map(c => c + c).join("");
  }
  if (clean.length !== 6) return "255, 182, 193";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function HeartsEffect({ intensity = 50, color = "#ffb6c1" }: { intensity?: number; color?: string }) {
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

    class Heart {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      sway: number;
      swaySpeed: number;
      time: number;

      constructor() {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = Math.random() * (height || window.innerHeight) + (height || window.innerHeight);
        this.size = Math.random() * 10 + 8;
        this.speed = Math.random() * 0.6 + 0.3; 
        this.opacity = Math.random() * 0.4 + 0.2;
        this.sway = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.01 + 0.005;
        this.time = 0;
      }

      update() {
        this.y -= this.speed;
        this.time += this.swaySpeed;
        
        // Horizontal sway
        this.x += Math.sin(this.time) * 0.5;

        // Reset if it goes above screen
        if (this.y < -this.size * 2) {
          this.y = height + this.size * 2;
          this.x = Math.random() * width;
        }
      }

      draw(currentRgbColor: string) {
        if (!ctx) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw heart shape using bezier curves
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
          -this.size / 2, -this.size / 2, 
          -this.size, topCurveHeight, 
          0, this.size
        );
        // top right curve
        ctx.bezierCurveTo(
          this.size, topCurveHeight, 
          this.size / 2, -this.size / 2, 
          0, topCurveHeight
        );
        ctx.closePath();
        
        ctx.fillStyle = `rgba(${currentRgbColor}, ${this.opacity})`;
        ctx.fill();
        
        ctx.restore();
      }
    }

    let hearts: Heart[] = [];

    const render = () => {
      const currentRgbColor = hexToRgb(propsRef.current.color);
      const targetCount = Math.floor((propsRef.current.intensity / 100) * 80);
      
      while (hearts.length < targetCount) hearts.push(new Heart());
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
