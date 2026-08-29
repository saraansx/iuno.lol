"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const BLUR_MAX = 4;
const BLUR_DURATION = 2600;

type WithStyle = { style?: CSSProperties };

export default function BlurDescriptionEffect({ children }: { children: ReactNode }) {
  const [blur, setBlur] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const progress = ((now - startRef.current) % BLUR_DURATION) / BLUR_DURATION;
      const triangle = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setBlur(triangle * BLUR_MAX);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const style: CSSProperties = {
    filter: `blur(${blur.toFixed(2)}px)`,
    willChange: "filter",
  };

  if (isValidElement<WithStyle>(children)) {
    return cloneElement(children, {
      style: { ...children.props.style, ...style },
    });
  }

  return <span style={{ display: "inline-block", ...style }}>{children}</span>;
}
