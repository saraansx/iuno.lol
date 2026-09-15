"use client";

import dynamic from "next/dynamic";

const AnalyticsChart = dynamic(() => import("./AnalyticsChart"), { ssr: false });
const DeviceChart = dynamic(() => import("./DeviceChart"), { ssr: false });

export { AnalyticsChart, DeviceChart };
