"use client";

import { usePathname } from "next/navigation";
import LazySharedBackground from "./LazySharedBackground";

export default function ConditionalBackground() {
  const pathname = usePathname();

  // On the homepage, ColorBends is the background — skip the old one
  if (pathname === "/") return null;

  return <LazySharedBackground />;
}
