import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getCategoryColor(category: string) {
    const colors = [
        { bg: "bg-orange-500", text: "text-orange-500", lightBg: "bg-orange-50", lightText: "text-orange-700", border: "border-orange-200", ring: "ring-orange-200", hex: "#f97316" },
        { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-50", lightText: "text-blue-700", border: "border-blue-200", ring: "ring-blue-200", hex: "#3b82f6" },
        { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50", lightText: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-200", hex: "#10b981" },
        { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-50", lightText: "text-purple-700", border: "border-purple-200", ring: "ring-purple-200", hex: "#a855f7" },
        { bg: "bg-pink-500", text: "text-pink-500", lightBg: "bg-pink-50", lightText: "text-pink-700", border: "border-pink-200", ring: "ring-pink-200", hex: "#ec4899" },
        { bg: "bg-cyan-500", text: "text-cyan-500", lightBg: "bg-cyan-50", lightText: "text-cyan-700", border: "border-cyan-200", ring: "ring-cyan-200", hex: "#06b6d4" },
        { bg: "bg-indigo-500", text: "text-indigo-500", lightBg: "bg-indigo-50", lightText: "text-indigo-700", border: "border-indigo-200", ring: "ring-indigo-200", hex: "#6366f1" },
        { bg: "bg-rose-500", text: "text-rose-500", lightBg: "bg-rose-50", lightText: "text-rose-700", border: "border-rose-200", ring: "ring-rose-200", hex: "#f43f5e" },
        { bg: "bg-teal-500", text: "text-teal-500", lightBg: "bg-teal-50", lightText: "text-teal-700", border: "border-teal-200", ring: "ring-teal-200", hex: "#14b8a6" },
        { bg: "bg-violet-500", text: "text-violet-500", lightBg: "bg-violet-50", lightText: "text-violet-700", border: "border-violet-200", ring: "ring-violet-200", hex: "#8b5cf6" },
        { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-50", lightText: "text-amber-700", border: "border-amber-200", ring: "ring-amber-200", hex: "#f59e0b" },
        { bg: "bg-lime-500", text: "text-lime-500", lightBg: "bg-lime-50", lightText: "text-lime-700", border: "border-lime-200", ring: "ring-lime-200", hex: "#84cc16" },
        { bg: "bg-fuchsia-500", text: "text-fuchsia-500", lightBg: "bg-fuchsia-50", lightText: "text-fuchsia-700", border: "border-fuchsia-200", ring: "ring-fuchsia-200", hex: "#d946ef" },
        { bg: "bg-slate-500", text: "text-slate-500", lightBg: "bg-slate-50", lightText: "text-slate-700", border: "border-slate-200", ring: "ring-slate-200", hex: "#64748b" },
        { bg: "bg-sky-500", text: "text-sky-500", lightBg: "bg-sky-50", lightText: "text-sky-700", border: "border-sky-200", ring: "ring-sky-200", hex: "#0ea5e9" },
    ];

    if (!category || category === "อื่นๆ") return { bg: "bg-stone-500", text: "text-stone-500", lightBg: "bg-stone-50", lightText: "text-stone-700", border: "border-stone-200", ring: "ring-stone-200", hex: "#78716c" };

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
