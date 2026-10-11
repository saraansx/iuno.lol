"use client";

import dynamic from "next/dynamic";

function ChartSkeleton({ className }: { className: string }) {
  return (
    <div className={`bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full ${className} relative overflow-hidden`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" />
      </div>
    </div>
  );
}

const AnalyticsChart = dynamic(() => import("./AnalyticsChart"), {
  ssr: false,
  loading: () => <ChartSkeleton className="h-[25rem]" />,
});
const DeviceChart = dynamic(() => import("./DeviceChart"), {
  ssr: false,
  loading: () => <ChartSkeleton className="h-full min-h-[20rem]" />,
});

export { AnalyticsChart, DeviceChart };
