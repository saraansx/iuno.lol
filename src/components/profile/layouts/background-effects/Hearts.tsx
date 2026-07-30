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
          
          // Horizontal sway
          heart.x += Math.sin(heart.time) * 0.5;

          // Reset if it goes above screen
          if (heart.y < -heart.size * 2) {
            heart.y = height + heart.size * 2;
            heart.x = Math.random() * width;
          }
        },
        draw: (currentRgbColor: string) => {
          if (!ctx) return;
          
          ctx.save();
          ctx.translate(heart.x, heart.y);
          
          // Draw heart shape using bezier curves
          ctx.beginPath();
          const topCurveHeight = heart.size * 0.3;
          ctx.moveTo(0, topCurveHeight);
          // top left curve
          ctx.bezierCurveTo(
            -heart.size / 2, -heart.size / 2, 
            -heart.size, topCurveHeight, 
            0, heart.size
          );
          // top right curve
          ctx.bezierCurveTo(
            heart.size, topCurveHeight, 
            heart.size / 2, -heart.size / 2, 
            0, topCurveHeight
          );
          ctx.closePath();
          
          ctx.fillStyle = `rgba(${currentRgbColor}, ${heart.opacity})`;
          ctx.fill();
          
          ctx.restore();
        }
      };
      return heart;
    };

    const hearts: Heart[] = [];

    const render = () => {
      const currentRgbColor = hexToRgb(propsRef.current.color);
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
