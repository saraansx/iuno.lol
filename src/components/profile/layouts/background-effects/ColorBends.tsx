"use client";
import { trackVisibility } from "./visibility";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAX_COLORS, COLOR_BENDS_FRAG, COLOR_BENDS_VERT } from "@/components/effects/colorBendsShader";

export interface ColorBendsSettings {
  color?: string | null;
  rotation?: number | null;
  autoRotate?: number | null;
  speed?: number | null;
  scale?: number | null;
  frequency?: number | null;
  warpStrength?: number | null;
  mouseInfluence?: number | null;
  parallax?: number | null;
  noise?: number | null;
  iterations?: number | null;
  intensity?: number | null;
  bandWidth?: number | null;
}

const FRAG = COLOR_BENDS_FRAG;
const VERT = COLOR_BENDS_VERT;

const DEFAULTS = {
  color: "#a855f7",
  rotation: 90,
  autoRotate: 0,
  speed: 0.2,
  scale: 1,
  frequency: 1,
  warpStrength: 1,
  mouseInfluence: 1,
  parallax: 0.5,
  noise: 0.15,
  iterations: 1,
  intensity: 1.5,
  bandWidth: 6,
};

function hexToVec3(hex: string): THREE.Vector3 {
  const h = hex.replace("#", "").trim();
  const v =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const parts = v.map((n) => (Number.isFinite(n) ? n : 0));
  return new THREE.Vector3(parts[0] / 255, parts[1] / 255, parts[2] / 255);
}

export function ColorBendsEffect(props: ColorBendsSettings) {
  const ctnDom = useRef<HTMLDivElement>(null);

  const resolved = {
    color: props.color ?? DEFAULTS.color,
    rotation: props.rotation ?? DEFAULTS.rotation,
    autoRotate: props.autoRotate ?? DEFAULTS.autoRotate,
    speed: props.speed ?? DEFAULTS.speed,
    scale: props.scale ?? DEFAULTS.scale,
    frequency: props.frequency ?? DEFAULTS.frequency,
    warpStrength: props.warpStrength ?? DEFAULTS.warpStrength,
    mouseInfluence: props.mouseInfluence ?? DEFAULTS.mouseInfluence,
    parallax: props.parallax ?? DEFAULTS.parallax,
    noise: props.noise ?? DEFAULTS.noise,
    iterations: Math.round(props.iterations ?? DEFAULTS.iterations),
    intensity: props.intensity ?? DEFAULTS.intensity,
    bandWidth: props.bandWidth ?? DEFAULTS.bandWidth,
  };
  const settingsRef = useRef(resolved);

  useEffect(() => {
    settingsRef.current = resolved;
  });

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const colorArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: DEFAULTS.speed },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: 0 },
        uColors: { value: colorArray },
        uTransparent: { value: 1 },
        uScale: { value: DEFAULTS.scale },
        uFrequency: { value: DEFAULTS.frequency },
        uWarpStrength: { value: DEFAULTS.warpStrength },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: DEFAULTS.mouseInfluence },
        uParallax: { value: DEFAULTS.parallax },
        uNoise: { value: DEFAULTS.noise },
        uIterations: { value: DEFAULTS.iterations },
        uIntensity: { value: DEFAULTS.intensity },
        uBandWidth: { value: DEFAULTS.bandWidth },
      },
      premultipliedAlpha: true,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const U = material.uniforms as Record<string, { value: number | THREE.Vector2 | THREE.Vector3[] }>;
    const setSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      (U.uCanvas.value as THREE.Vector2).set(w, h);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
      pointerTarget.set(x, y);
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });

    const startStamp = performance.now();
    let lastStamp = startStamp;
    let elapsed = 0;
    let raf = 0;
    const visibility = trackVisibility(container);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - lastStamp) / 1000, 0.1);
      lastStamp = now;
      if (!visibility.state.visible) return;
      elapsed += dt;

      const c = settingsRef.current;
      (U.uTime.value as number) = elapsed;
      (U.uSpeed.value as number) = c.speed;
      const deg = (c.rotation % 360) + c.autoRotate * elapsed;
      const rad = (deg * Math.PI) / 180;
      (U.uRot.value as THREE.Vector2).set(Math.cos(rad), Math.sin(rad));
      (U.uScale.value as number) = c.scale;
      (U.uFrequency.value as number) = c.frequency;
      (U.uWarpStrength.value as number) = c.warpStrength;
      (U.uMouseInfluence.value as number) = c.mouseInfluence;
      (U.uParallax.value as number) = c.parallax;
      (U.uNoise.value as number) = c.noise;
      (U.uIterations.value as number) = Math.max(1, Math.min(5, Math.round(c.iterations)));
      (U.uIntensity.value as number) = c.intensity;
      (U.uBandWidth.value as number) = c.bandWidth;
      const arr = (U.uColors.value as THREE.Vector3[]);
      arr[0].copy(hexToVec3(c.color));
      for (let i = 1; i < MAX_COLORS; i++) arr[i].set(0, 0, 0);
      (U.uColorCount.value as number) = 1;

      const amt = Math.min(1, dt * 8);
      pointerCurrent.lerp(pointerTarget, amt);
      (U.uPointer.value as THREE.Vector2).copy(pointerCurrent);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      visibility.stop();
      ro.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ctnDom} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto" />;
}
