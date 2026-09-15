"use client";

import dynamic from "next/dynamic";

function ChartSkeleton() {
  return <div className="h-[280px] w-full animate-pulse rounded-[20px] bg-white/[0.03] border border-white/5" aria-hidden />;
}

const AnalyticsChart = dynamic(() => import("./AnalyticsChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const DeviceChart = dynamic(() => import("./DeviceChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export { AnalyticsChart, DeviceChart };
