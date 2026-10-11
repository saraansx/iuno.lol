"use client";

import dynamic from "next/dynamic";

const WorldMapCard = dynamic(() => import("./WorldMapCard"), { ssr: false });

export { WorldMapCard };
