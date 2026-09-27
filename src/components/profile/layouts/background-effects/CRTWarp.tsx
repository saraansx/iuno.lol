"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface CRTWarpSettings {
  color?: string | null;
  background?: string | null;
  speed?: number | null;
  curvature?: number | null;
  waveAmount?: number | null;
  waveDensity?: number | null;
  scanStrength?: number | null;
  scanDensity?: number | null;
  bloom?: number | null;
  bloomRadius?: number | null;
  noise?: number | null;
  vignette?: number | null;
  brightness?: number | null;
  rgbShift?: number | null;
  pixelSize?: number | null;
  renderQuality?: number | null;
  frameRate?: number | null;
  pointerWarp?: boolean | null;
  pointerStrength?: number | null;
  paused?: boolean | null;
}

const VERT = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uBackgroundColor;
uniform float uCurvature;
uniform float uScanlineStrength;
uniform float uScanlineFrequency;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uNoise;
uniform float uVignette;
uniform float uBrightness;
uniform float uPixelation;
uniform float uRgbShift;
uniform vec2 uPointer;
uniform float uMouseStrength;
uniform float uMouseReact;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 crtCurve(vec2 uv, float radius) {
  vec2 p = (uv - 0.5) * 2.0;
  float safeRadius = max(radius, 1.415);
  float cornerScale = safeRadius / sqrt(max(safeRadius * safeRadius - 2.0, 0.001));
  p = safeRadius * p / sqrt(max(safeRadius * safeRadius - dot(p, p), 0.001));
  p /= cornerScale;
  return p * 0.5 + 0.5;
}

float referencePlasma(vec2 uv, float t) {
  float frequencyScale = max(uWaveFrequency / 2.2, 0.001);
  uv = (uv - 0.5) * frequencyScale + 0.5;

  float scanline = 0.5 - 0.5 * cos(uv.y * 3.14159265 * uScanlineFrequency);
  scanline = mix(1.0, scanline, uScanlineStrength);

  uv *= vec2(80.0, 24.0);
  uv = ceil(uv);
  uv /= vec2(80.0, 24.0);

  float amplitude = uWaveAmplitude / 0.28;
  float field = 0.0;
  field += 0.7 * sin(0.5 * uv.x + t / 5.0);
  field += 3.0 * sin(1.6 * uv.y + t / 5.0);
  field += sin(10.0 * (uv.y * sin(t / 2.0) + uv.x * cos(t / 5.0)) + t / 2.0);

  float cx = uv.x + 0.5 * sin(t / 2.0);
  float cy = uv.y + 0.5 * cos(t / 4.0);
  field += 0.4 * sin(sqrt(100.0 * cx * cx + 100.0 * cy * cy + 1.0) + t);
  field += 0.9 * sin(sqrt(75.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  field -= 1.4 * sin(sqrt(256.0 * cx * cx + 25.0 * cy * cy + 1.0) + t);
  field += 0.3 * sin(0.5 * uv.y + uv.x + sin(t));

  return scanline * floor(3.0 * (0.5 + 0.499 * sin(field * amplitude))) / 3.0;
}

void main() {
  vec2 uv = vUv;
  if (uPixelation > 1.001) {
    vec2 cells = max(uResolution / uPixelation, vec2(1.0));
    uv = (floor(uv * cells) + 0.5) / cells;
  }

  float curveRadius = 1.1 + 0.42 / max(uCurvature, 0.001);
  if (uMouseReact > 0.5) {
    curveRadius *= exp(-uPointer.y * uMouseStrength * 0.4);
  }
  vec2 curvedUv = crtCurve(uv, curveRadius);
  if (uMouseReact > 0.5) {
    curvedUv.x -= uPointer.x * uMouseStrength * 0.035;
  }

  float signal = referencePlasma(curvedUv, uTime);
  float radius = 0.01 * uBloomRadius;
  float glow = signal * 0.2;
  glow += referencePlasma(curvedUv + vec2(radius, 0.0), uTime) * 0.12;
  glow += referencePlasma(curvedUv - vec2(radius, 0.0), uTime) * 0.12;
  glow += referencePlasma(curvedUv + vec2(0.0, radius), uTime) * 0.12;
  glow += referencePlasma(curvedUv - vec2(0.0, radius), uTime) * 0.12;
  glow += referencePlasma(curvedUv + vec2(radius), uTime) * 0.08;
  glow += referencePlasma(curvedUv - vec2(radius), uTime) * 0.08;
  glow += referencePlasma(curvedUv + vec2(radius, -radius), uTime) * 0.08;
  glow += referencePlasma(curvedUv + vec2(-radius, radius), uTime) * 0.08;

  float redSignal = referencePlasma(curvedUv + vec2(uRgbShift, 0.0), uTime);
  float blueSignal = referencePlasma(curvedUv - vec2(uRgbShift, 0.0), uTime);
  vec3 channelSignal = vec3(redSignal, signal, blueSignal);
  vec3 waveColor = uColor * (0.3 + signal * 0.7 + glow * uBloom * 0.65);
  waveColor += (channelSignal - signal) * 0.42;

  float edge = clamp(1.0 - dot(vUv - 0.5, vUv - 0.5) * 2.0, 0.0, 1.0);
  float edgeFade = mix(1.0, smoothstep(0.0, 1.0, edge), uVignette);
  float waveMask = clamp(signal * 0.82 + glow * 0.52, 0.0, 1.0) * edgeFade;

  float grain = hash21(gl_FragCoord.xy + vec2(fract(uTime) * 173.0));
  waveColor = max(waveColor * uBrightness, vec3(0.0));
  vec3 color = mix(uBackgroundColor, waveColor, waveMask);
  color += (grain - 0.5) * uNoise;
  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
`;

const DEFAULTS = {
  color: "#c755f7",
  background: "#05010a",
  speed: 0.5,
  curvature: 0.25,
  waveAmount: 0.3,
  waveDensity: 2.5,
  scanStrength: 0.25,
  scanDensity: 200,
  bloom: 1.5,
  bloomRadius: 1,
  noise: 0.1,
  vignette: 0,
  brightness: 1.25,
  rgbShift: 0.015,
  pixelSize: 1,
  renderQuality: 1.5,
  frameRate: 30,
  pointerWarp: true,
  pointerStrength: 0.5,
  paused: false,
};

function hexToColor(hex: string): THREE.Color {
  const c = new THREE.Color(DEFAULTS.color);
  try {
    if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex.trim())) c.set(hex.trim());
  } catch {
  }
  return c;
}

export function CRTWarpEffect(props: CRTWarpSettings) {
  const ctnDom = useRef<HTMLDivElement>(null);

  const resolved = {
    color: props.color ?? DEFAULTS.color,
    background: props.background ?? DEFAULTS.background,
    speed: props.speed ?? DEFAULTS.speed,
    curvature: props.curvature ?? DEFAULTS.curvature,
    waveAmount: props.waveAmount ?? DEFAULTS.waveAmount,
    waveDensity: props.waveDensity ?? DEFAULTS.waveDensity,
    scanStrength: props.scanStrength ?? DEFAULTS.scanStrength,
    scanDensity: props.scanDensity ?? DEFAULTS.scanDensity,
    bloom: props.bloom ?? DEFAULTS.bloom,
    bloomRadius: props.bloomRadius ?? DEFAULTS.bloomRadius,
    noise: props.noise ?? DEFAULTS.noise,
    vignette: props.vignette ?? DEFAULTS.vignette,
    brightness: props.brightness ?? DEFAULTS.brightness,
    rgbShift: props.rgbShift ?? DEFAULTS.rgbShift,
    pixelSize: props.pixelSize ?? DEFAULTS.pixelSize,
    renderQuality: props.renderQuality ?? DEFAULTS.renderQuality,
    frameRate: props.frameRate ?? DEFAULTS.frameRate,
    pointerWarp: props.pointerWarp ?? DEFAULTS.pointerWarp,
    pointerStrength: props.pointerStrength ?? DEFAULTS.pointerStrength,
    paused: props.paused ?? DEFAULTS.paused,
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
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: DEFAULTS.speed },
        uColor: { value: new THREE.Color(DEFAULTS.color) },
        uBackgroundColor: { value: new THREE.Color(DEFAULTS.background) },
        uCurvature: { value: DEFAULTS.curvature },
        uScanlineStrength: { value: DEFAULTS.scanStrength },
        uScanlineFrequency: { value: DEFAULTS.scanDensity },
        uWaveAmplitude: { value: DEFAULTS.waveAmount },
        uWaveFrequency: { value: DEFAULTS.waveDensity },
        uBloom: { value: DEFAULTS.bloom },
        uBloomRadius: { value: DEFAULTS.bloomRadius },
        uNoise: { value: DEFAULTS.noise },
        uVignette: { value: DEFAULTS.vignette },
        uBrightness: { value: DEFAULTS.brightness },
        uPixelation: { value: DEFAULTS.pixelSize },
        uRgbShift: { value: DEFAULTS.rgbShift },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseStrength: { value: DEFAULTS.pointerStrength },
        uMouseReact: { value: 1 },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const U = material.uniforms as Record<string, { value: number | THREE.Vector2 | THREE.Color }>;
    const resize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(w, h, false);
      (U.uResolution.value as THREE.Vector2).set(renderer.domElement.width, renderer.domElement.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    let visible = true;
    io.observe(container);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerTarget.set(
        ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
        -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1)
      );
    };
    const onPointerLeave = () => pointerTarget.set(0, 0);
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);

    let raf = 0;
    let lastFrame = 0;
    let time = 0;
    let lastQuality = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const c = settingsRef.current;
      const fps = Math.max(1, c.frameRate);
      const now = performance.now();
      const interval = 1000 / fps;
      if (now - lastFrame < interval) return;
      lastFrame = now - ((now - lastFrame) % interval);
      if (!c.paused) time += (interval / 1000) * c.speed;

      if (c.renderQuality !== lastQuality) {
        lastQuality = c.renderQuality;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Math.max(0.5, c.renderQuality)));
        resize();
      }

      (U.uTime.value as number) = time;
      (U.uColor.value as THREE.Color).copy(hexToColor(c.color));
      (U.uBackgroundColor.value as THREE.Color).copy(hexToColor(c.background));
      (U.uCurvature.value as number) = c.curvature;
      (U.uScanlineStrength.value as number) = c.scanStrength;
      (U.uScanlineFrequency.value as number) = c.scanDensity;
      (U.uWaveAmplitude.value as number) = c.waveAmount;
      (U.uWaveFrequency.value as number) = c.waveDensity;
      (U.uBloom.value as number) = c.bloom;
      (U.uBloomRadius.value as number) = c.bloomRadius;
      (U.uNoise.value as number) = c.noise;
      (U.uVignette.value as number) = c.vignette;
      (U.uBrightness.value as number) = c.brightness;
      (U.uPixelation.value as number) = c.pixelSize;
      (U.uRgbShift.value as number) = c.rgbShift;
      (U.uMouseReact.value as number) = c.pointerWarp ? 1 : 0;
      (U.uMouseStrength.value as number) = c.pointerStrength;

      pointerCurrent.lerp(pointerTarget, 0.08);
      (U.uPointer.value as THREE.Vector2).copy(pointerCurrent);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ctnDom} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto" />;
}
