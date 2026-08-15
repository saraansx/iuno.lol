"use client";

import React from "react";

export interface TransitionRendererProps {
  isExiting: boolean;
  onClick: () => void;
  children: React.ReactNode;
  blur?: number;
  blurColor?: string;
}

