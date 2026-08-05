"use client";

import dynamic from "next/dynamic";

const SharedBackground = dynamic(() => import("./SharedBackground"), { ssr: false });

export default function LazySharedBackground() {
  return <SharedBackground />;
}
