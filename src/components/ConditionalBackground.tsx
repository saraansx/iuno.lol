"use client";

import { usePathname } from "next/navigation";
import LazySharedBackground from "./LazySharedBackground";

export default function ConditionalBackground() {
  const pathname = usePathname();

  if (
    pathname === "/pricing" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/copyright" ||
    pathname === "/refund"
  )
    return null;

  return <LazySharedBackground />;
}
