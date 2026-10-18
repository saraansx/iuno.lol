"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

export const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => {
  const [index, setIndex] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (still || texts.length < 2) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % texts.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, [still, texts.length]);

  return (
    <div
      className={cn(
        "relative mx-auto h-16 w-full max-w-3xl text-center font-sans text-[40pt] leading-none font-bold md:h-24 lg:text-[6rem]",
        className,
      )}
    >
      <span
        key={index}
        className="morph-word inline-block align-top"
      >
        {texts[index % texts.length]}
      </span>
    </div>
  );
};
