"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

export interface LiquidChromeSettings {
  color?: string | null;
  speed?: number | null;
  amplitude?: number | null;
  interactive?: boolean | null;
}

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 renderImage(vec2 uvCoord) {
    vec2 fragCoord = uvCoord * uResolution.xy;
    vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

    for (float i = 1.0; i < 10.0; i++){
        uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
        uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
    }

    vec2 diff = (uvCoord - uMouse);
    float dist = length(diff);
    float falloff = exp(-dist * 20.0);
    float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
    uv += (diff / (dist + 0.0001)) * ripple * falloff;

    vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
    return vec4(color, 1.0);
}

void main() {
    vec4 col = vec4(0.0);
    int samples = 0;
    for (int i = -1; i <= 1; i++){
        for (int j = -1; j <= 1; j++){
            vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
            col += renderImage(vUv + offset);
            samples++;
        }
    }
    gl_FragColor = col / float(samples);
}
`;

const DEFAULTS = { color: "#1a1a1a", speed: 0.3, amplitude: 0.3, interactive: true };

function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const v =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return v.map((n) => (Number.isFinite(n) ? n : 0) / 255) as [number, number, number];
}

export function LiquidChromeEffect({ color, speed, amplitude, interactive }: LiquidChromeSettings) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ color, speed, amplitude, interactive });

  useEffect(() => {
    propsRef.current = { color, speed, amplitude, interactive };
  });

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({ antialias: true });
    const gl = renderer.gl;
    gl.clearColor(1, 1, 1, 1);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Float32Array([gl.canvas.width, gl.canvas.height, 1]) },
        uBaseColor: { value: new Float32Array(hexToRgb01(propsRef.current.color ?? DEFAULTS.color)) },
        uAmplitude: { value: propsRef.current.amplitude ?? DEFAULTS.amplitude },
        uFrequencyX: { value: 3 },
        uFrequencyY: { value: 3 },
        uMouse: { value: new Float32Array([0, 0]) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!ctn) return;
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      const res = program.uniforms.uResolution.value as Float32Array;
      res[0] = gl.canvas.width;
      res[1] = gl.canvas.height;
      res[2] = gl.canvas.width / gl.canvas.height;
    }
    window.addEventListener("resize", resize);
    resize();

    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    ctn.appendChild(gl.canvas);

    function setMouse(clientX: number, clientY: number) {
      if (propsRef.current.interactive === false) return;
      const rect = ctn!.getBoundingClientRect();
      const mouse = program.uniforms.uMouse.value as Float32Array;
      mouse[0] = (clientX - rect.left) / rect.width;
      mouse[1] = 1 - (clientY - rect.top) / rect.height;
    }
    function handleMouseMove(e: MouseEvent) {
      setMouse(e.clientX, e.clientY);
    }
    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) setMouse(e.touches[0].clientX, e.touches[0].clientY);
    }
    ctn.addEventListener("mousemove", handleMouseMove, { passive: true });
    ctn.addEventListener("touchmove", handleTouchMove, { passive: true });

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      const p = propsRef.current;
      (program.uniforms.uTime.value as number) = t * 0.001 * (p.speed ?? DEFAULTS.speed);
      (program.uniforms.uAmplitude.value as number) = p.amplitude ?? DEFAULTS.amplitude;
      (program.uniforms.uBaseColor.value as Float32Array).set(hexToRgb01(p.color ?? DEFAULTS.color));
      renderer.render({ scene: mesh });
    };
    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      ctn.removeEventListener("mousemove", handleMouseMove);
      ctn.removeEventListener("touchmove", handleTouchMove);
      if (gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  // pointer-events-auto so mouse interaction reaches the canvas.
  // Profile content sits above, so its own interactions still win.
  return <div ref={ctnDom} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto" />;
}
