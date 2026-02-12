import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getCategoryColor(category: string) {
    const colors = [
        { bg: "bg-orange-500", text: "text-orange-500", lightBg: "bg-orange-50", lightText: "text-orange-700", border: "border-orange-200", ring: "ring-orange-200" },
        { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-50", lightText: "text-blue-700", border: "border-blue-200", ring: "ring-blue-200" },
        { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50", lightText: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-200" },
        { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-50", lightText: "text-purple-700", border: "border-purple-200", ring: "ring-purple-200" },
        { bg: "bg-pink-500", text: "text-pink-500", lightBg: "bg-pink-50", lightText: "text-pink-700", border: "border-pink-200", ring: "ring-pink-200" },
        { bg: "bg-cyan-500", text: "text-cyan-500", lightBg: "bg-cyan-50", lightText: "text-cyan-700", border: "border-cyan-200", ring: "ring-cyan-200" },
        { bg: "bg-indigo-500", text: "text-indigo-500", lightBg: "bg-indigo-50", lightText: "text-indigo-700", border: "border-indigo-200", ring: "ring-indigo-200" },
        { bg: "bg-rose-500", text: "text-rose-500", lightBg: "bg-rose-50", lightText: "text-rose-700", border: "border-rose-200", ring: "ring-rose-200" },
        { bg: "bg-teal-500", text: "text-teal-500", lightBg: "bg-teal-50", lightText: "text-teal-700", border: "border-teal-200", ring: "ring-teal-200" },
        { bg: "bg-violet-500", text: "text-violet-500", lightBg: "bg-violet-50", lightText: "text-violet-700", border: "border-violet-200", ring: "ring-violet-200" },
    ];

    if (!category) return colors[0];

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
