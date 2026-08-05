"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

export const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500); // 2.5 seconds per word
    return () => clearInterval(timer);
  }, [texts.length]);

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden h-full w-full", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inline-block text-center whitespace-nowrap"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
