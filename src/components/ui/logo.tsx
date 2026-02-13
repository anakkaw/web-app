"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    textClassName?: string;
}

export function Logo({
    className,
    showText = true,
    size = "md",
    textClassName
}: LogoProps) {

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        xl: "h-20 w-20"
    };

    const iconSizes = {
        sm: "h-5 w-5",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12"
    };

    return (
        <div className={cn("flex items-center gap-3 group", className)}>
            <div className={cn(
                "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-105",
                sizeClasses[size]
            )}>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("text-white", iconSizes[size])}
                >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            </div>

            {showText && (
                <div className={cn("flex flex-col", textClassName)}>
                    <span className="text-xl font-black tracking-tighter text-stone-900 leading-none group-hover:text-orange-600 transition-colors">
                        Project
                    </span>
                    <span className="text-sm font-bold tracking-widest text-orange-600 uppercase">Management</span>
                </div>
            )}
        </div>
    );
}
