"use client";

import { usePathname } from "next/navigation";
import LazySharedBackground from "./LazySharedBackground";

export default function ConditionalBackground() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return <LazySharedBackground />;
}
