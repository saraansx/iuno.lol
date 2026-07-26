"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { DeviceStats } from '@/lib/features/users/db';

interface DeviceChartProps {
  stats: DeviceStats;
}

export default function DeviceChart({ stats }: DeviceChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  const data = [
    { name: 'iOS', value: stats.ios, color: '#f472b6' }, // pink
    { name: 'Android', value: stats.android, color: '#4ade80' }, // green
    { name: 'Windows', value: stats.windows, color: '#60a5fa' }, // blue
    { name: 'Mac', value: stats.mac, color: '#94a3b8' }, // slate/silver
    { name: 'Other', value: stats.other, color: '#52525b' }, // dark gray
  ].filter(item => item.value > 0);

  // If no data, show a placeholder
  const displayData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#333333' }];

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-[20px] p-6 w-full h-full relative transition-opacity duration-300 opacity-100 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-white font-inter font-medium text-lg tracking-wide">Devices</h2>
        <p className="text-white/30 text-xs mt-1 font-inter">How visitors break down by device type.</p>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="h-48 w-full relative mt-4">
        {!isMounted || dimensions.width === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#609fda] rounded-full animate-spin" />
          </div>
        ) : (
          <PieChart width={dimensions.width} height={dimensions.height}>
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
        )}
      </div>

      {/* Legend */}
      {isMounted && dimensions.width > 0 && data.length > 0 && (
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
