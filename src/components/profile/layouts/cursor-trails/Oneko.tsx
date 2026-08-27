"use client";

import { useEffect, useRef } from "react";

// Port of oneko.js (https://github.com/adryd325/oneko.js) — a cat that chases the
// cursor. Unlike the other trails this is a sprite, not a canvas: the sheet is an
// 8x4 grid of 32px tiles and each pair below is a [col, row] offset into it.
const SPRITE_SIZE = 32;
const SPEED = 10;
// Frames advance on a 100ms tick, not per rAF — the original's stop-motion feel.
const TICK_MS = 100;

const SPRITE_SETS: Record<string, [number, number][]> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  scratchWallN: [[0, 0], [0, -1]],
  scratchWallS: [[-7, -1], [-6, -2]],
  scratchWallE: [[-2, -2], [-2, -3]],
  scratchWallW: [[-4, 0], [-4, -1]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

export function OnekoTrail({ color = "#ffffff" }: { color?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cat = catRef.current;
    if (!container || !cat) return;

    // Touch pointers have nothing to chase.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const half = SPRITE_SIZE / 2;
    let catX = half;
    let catY = half;
    let mouseX = half;
    let mouseY = half;
    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation: string | null = null;
    let idleAnimationFrame = 0;
    let lastTick = 0;
    let rafId: number;

    const setSprite = (name: string, frame: number) => {
      const set = SPRITE_SETS[name] ?? SPRITE_SETS.idle;
      const [col, row] = set[frame % set.length];
      // Shared by the sprite's own background and the tint layer's mask.
      cat.style.setProperty("--sprite-pos", `${col * SPRITE_SIZE}px ${row * SPRITE_SIZE}px`);
    };

    const resetIdleAnimation = () => {
      idleAnimation = null;
      idleAnimationFrame = 0;
    };

    const idle = () => {
      idleTime += 1;

      // Roughly every 20s of sitting still, pick something to do.
      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation == null) {
        const options = ["sleeping", "scratchSelf"];
        const { width, height } = container.getBoundingClientRect();
        if (catX < SPRITE_SIZE) options.push("scratchWallW");
        if (catY < SPRITE_SIZE) options.push("scratchWallN");
        if (catX > width - SPRITE_SIZE) options.push("scratchWallE");
        if (catY > height - SPRITE_SIZE) options.push("scratchWallS");
        idleAnimation = options[Math.floor(Math.random() * options.length)];
      }

      switch (idleAnimation) {
        case "sleeping":
          if (idleAnimationFrame < 8) {
            setSprite("tired", 0);
            break;
          }
          setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
          if (idleAnimationFrame > 192) resetIdleAnimation();
          break;
        case "scratchWallN":
        case "scratchWallS":
        case "scratchWallE":
        case "scratchWallW":
        case "scratchSelf":
          setSprite(idleAnimation, idleAnimationFrame);
          if (idleAnimationFrame > 9) resetIdleAnimation();
          break;
        default:
          setSprite("idle", 0);
          return;
      }
      idleAnimationFrame += 1;
    };

    const step = () => {
      frameCount += 1;
      const diffX = catX - mouseX;
      const diffY = catY - mouseY;
      const distance = Math.hypot(diffX, diffY);

      // Stops short of the cursor rather than sitting on top of it.
      if (distance < SPEED || distance < 48) {
        idle();
        return;
      }

      resetIdleAnimation();

      // Perk up for a beat before giving chase.
      if (idleTime > 1) {
        setSprite("alert", 0);
        idleTime = Math.min(idleTime, 7) - 1;
        return;
      }

      let direction = diffY / distance > 0.5 ? "N" : "";
      direction += diffY / distance < -0.5 ? "S" : "";
      direction += diffX / distance > 0.5 ? "W" : "";
      direction += diffX / distance < -0.5 ? "E" : "";
      setSprite(direction, frameCount);

      catX -= (diffX / distance) * SPEED;
      catY -= (diffY / distance) * SPEED;

      const { width, height } = container.getBoundingClientRect();
      catX = Math.min(Math.max(half, catX), width - half);
      catY = Math.min(Math.max(half, catY), height - half);

      cat.style.transform = `translate(${catX - half}px, ${catY - half}px)`;
    };

    // Listening on window is what lets the cat keep tracking while the pointer
    // moves fast, but it also reports positions outside the card — where the clamp
    // would park the cat against the nearest edge, still chasing. Ignore those
    // samples so it settles into its idle animations instead.
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      mouseX = x;
      mouseY = y;
    };

    const render = (timestamp: number) => {
      if (timestamp - lastTick > TICK_MS) {
        lastTick = timestamp;
        step();
      }
      rafId = requestAnimationFrame(render);
    };

    cat.style.transform = `translate(${catX - half}px, ${catY - half}px)`;
    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <div
        ref={catRef}
        aria-hidden
        className="absolute top-0 left-0"
        style={{
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
          imageRendering: "pixelated",
          backgroundImage: "url(/oneko.gif)",
          backgroundPosition: "var(--sprite-pos, 0 0)",
          // Confines the child's multiply blend to this element, so it tints the
          // cat rather than the profile behind it.
          isolation: "isolate",
        }}
      >
        {/* The sheet is two colours: white body, black outline. Multiplying a solid
            fill over it turns white into the chosen colour and leaves the outline
            black, and masking by the same frame keeps the fill inside the cat. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: color,
            mixBlendMode: "multiply",
            maskImage: "url(/oneko.gif)",
            WebkitMaskImage: "url(/oneko.gif)",
            maskPosition: "var(--sprite-pos, 0 0)",
            WebkitMaskPosition: "var(--sprite-pos, 0 0)",
          }}
        />
      </div>
    </div>
  );
}
