"use client";

import React, { useState } from 'react';

interface ChartSegment {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: ChartSegment[];
    size?: number;
    thickness?: number;
}

export function PieChart({ data, size = 200, thickness = 20 }: PieChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;

    // Explicitly defined colors for specific categories if passed, or fallback
    // This matches the app's color logic indirectly, but the data prop should carry the color.

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
            {/* Chart Section */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    {data.map((segment, index) => {
                        const percentage = total > 0 ? segment.value / total : 0;
                        const dashArray = percentage * Math.PI * (size - thickness);
                        const circumference = Math.PI * (size - thickness);

                        // Calculate stroke-dasharray (visible part, hidden part)
                        const strokeDasharray = `${dashArray} ${circumference - dashArray}`;

                        // Calculate stroke-dashoffset (starting position)
                        const strokeDashoffset = -currentAngle * (Math.PI * (size - thickness));

                        // Update current angle for next segment (0 to 1 scale)
                        currentAngle += percentage;

                        const radius = (size - thickness) / 2;
                        const center = size / 2;

                        return (
                            <circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke={segment.color} // Use the color passed from data
                                strokeWidth={hoveredIndex === index ? thickness + 4 : thickness}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset} // Note: offset is usually negative or handled via rotate
                                className="transition-all duration-300 ease-out cursor-pointer"
                                style={{
                                    strokeDashoffset: - (currentAngle - percentage) * Math.PI * (size - thickness), // Correct offset calculation
                                    transformOrigin: 'center'
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        );
                    })}
                    {/* Summary Center Text */}
                    {/* We need to reverse the rotation for text */}
                    <foreignObject x="0" y="0" width={size} height={size} className="transform rotate-90 override-rotate">
                        <div className="h-full w-full flex flex-col items-center justify-center text-center pointer-events-none">
                            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                                {hoveredIndex !== null ? data[hoveredIndex].label : "รวมงบประมาณ"}
                            </span>
                            <span className="text-xl font-black text-stone-800 tracking-tight">
                                ฿{hoveredIndex !== null ? data[hoveredIndex].value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </foreignObject>
                </svg>
            </div>

            {/* Legend Section */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
                {data.map((segment, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${hoveredIndex === index ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: segment.color }}></div>
                            <span className={`text-sm font-bold ${hoveredIndex === index ? 'text-stone-900' : 'text-stone-600'}`}>{segment.label}</span>
                        </div>
                        <div className="text-right">
                            <span className={`text-sm font-bold block ${hoveredIndex === index ? 'text-stone-900' : 'text-stone-700'}`}>฿{segment.value.toLocaleString()}</span>
                            <span className="text-xs text-stone-400 font-medium">({total > 0 ? ((segment.value / total) * 100).toFixed(1) : 0}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
