"use client";

import { useSyncExternalStore } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DeviceStats } from '@/lib/features/users/db';

interface DeviceChartProps {
  stats: DeviceStats;
}

const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function DeviceChart({ stats }: DeviceChartProps) {
  const isMounted = useMounted();

  const data = [
    { name: 'iOS', value: stats.ios, color: '#f472b6' },
    { name: 'Android', value: stats.android, color: '#4ade80' },
    { name: 'Windows', value: stats.windows, color: '#5b6cf5' },
    { name: 'Mac', value: stats.mac, color: '#94a3b8' },
    { name: 'Other', value: stats.other, color: '#52525b' },
  ].filter(item => item.value > 0);

  const displayData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#333333' }];

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full h-full relative transition-opacity duration-300 opacity-100 flex flex-col">
      <div className="mb-4">
        <h2 className="text-white font-medium text-lg tracking-wide" style={{ fontFamily: "var(--font-comfortaa)" }}>Devices</h2>
        <p className="text-white/30 text-xs mt-1" style={{ fontFamily: "var(--font-comfortaa)" }}>How visitors break down by device type in the last 30 days.</p>
      </div>

      <div className="h-48 w-full relative mt-4">
        {!isMounted ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#5b6cf5] rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length && data.length > 0) {
                  const total = data.reduce((sum, item) => sum + item.value, 0);
                  const value = payload[0].value as number;
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  
                  return (
                    <div className="bg-[#0f0f0f] border border-white/10 px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                        <p className="text-white/50 text-xs font-normal tracking-wide">
                          {payload[0].name} <span className="text-white font-normal ml-1.5 tracking-normal">{value} ({percentage}%)</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {isMounted && data.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white/60 text-xs font-normal">
                {entry.name} <span className="text-white font-medium ml-1">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
