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
    onCategoryClick?: (category: string) => void;
}

export function PieChart({ data, size = 200, thickness = 20, onCategoryClick }: PieChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;


    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
            {/* Chart Section */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 overflow-visible">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feComposite in="coloredBlur" in2="SourceAlpha" operator="in" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {data.map((segment, index) => {
                        const percentage = total > 0 ? segment.value / total : 0;
                        const dashArray = percentage * Math.PI * (size - thickness);
                        const circumference = Math.PI * (size - thickness);

                        const strokeDasharray = `${dashArray} ${circumference - dashArray}`;

                        currentAngle += percentage;

                        const radius = (size - thickness) / 2;
                        const center = size / 2;
                        const isHovered = hoveredIndex === index;
                        const isDimmed = hoveredIndex !== null && !isHovered;

                        return (
                            <circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke={segment.color}
                                strokeWidth={isHovered ? thickness + 8 : thickness}
                                strokeDasharray={strokeDasharray}
                                className="transition-all duration-300 ease-out cursor-pointer"
                                style={{
                                    strokeDashoffset: -(currentAngle - percentage) * Math.PI * (size - thickness),
                                    transformOrigin: 'center',
                                    opacity: isDimmed ? 0.3 : 1,
                                    filter: isHovered ? 'url(#glow)' : 'none',
                                    zIndex: isHovered ? 10 : 1
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => onCategoryClick && onCategoryClick(segment.label)}
                            />
                        );
                    })}
                </svg>
                {/* Summary Center Text - Moved outside SVG to avoid rotation issues */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                        {hoveredIndex !== null ? data[hoveredIndex].label : "รวมงบประมาณ"}
                    </span>
                    <span className="text-3xl lg:text-4xl font-black text-stone-800 tracking-tight drop-shadow-sm">
                        ฿{hoveredIndex !== null ? data[hoveredIndex].value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>

            {/* Legend Section */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
                {data.map((segment, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300 ${hoveredIndex === index ? 'bg-stone-100 scale-105 shadow-sm' : 'hover:bg-stone-50'} ${hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40 blur-[0.5px]' : 'opacity-100'}`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onCategoryClick && onCategoryClick(segment.label)}
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
