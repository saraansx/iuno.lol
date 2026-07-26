"use client"

import React from "react"
import { motion } from "framer-motion"

interface HighlighterProps {
  children: React.ReactNode
  color?: string
  action?: "highlight" | "underline"
}

export function Highlighter({ children, action = "highlight" }: HighlighterProps) {
  if (action === "underline") {
    return (
      <span className="relative inline-block z-10 text-inherit">
        {children}
        {/* Hand-drawn organic underline */}
        <svg
          className="absolute -bottom-2 left-0 w-full h-4 -z-10 text-[#609fda] pointer-events-none"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          fill="none"
        >
          <motion.path
            d="M 1 9 L 99 10 L 3 14 L 97 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
          />
        </svg>
      </span>
    )
  }

  return (
    <span className="relative inline-block z-10 px-2.5 py-1 text-white font-normal leading-none my-0.5">
      {/* Hand-drawn organic marker highlight background */}
      <motion.svg
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        className="absolute -inset-x-1.5 -inset-y-1 w-[calc(100%+12px)] h-[calc(100%+8px)] -z-10 text-[#609fda]/35 pointer-events-none origin-left"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
      >
        {/* Layer 1: Main organic marker stroke */}
        <path
          d="M 1 4 C 30 1, 70 6, 99 3 C 101 14, 98 25, 99 27 C 65 29, 25 25, 0 28 C 0 18, 2 9, 1 4 Z"
          fill="currentColor"
        />
        {/* Layer 2: Secondary sketchy overlap stroke */}
        <path
          d="M 3 2 C 35 5, 68 1, 97 6 C 100 18, 96 23, 98 27 C 60 24, 30 27, 2 23 C 0 15, 4 7, 3 2 Z"
          fill="currentColor"
          opacity="0.5"
        />
      </motion.svg>
      {children}
    </span>
  )
}
