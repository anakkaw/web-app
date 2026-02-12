"use client";

import { Navbar } from "@/components/layout/navbar";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getCategoryColor } from "@/lib/utils";

export default function Reports() {
    const { projects } = useProjects();
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const headers = [
                "รหัสโครงการ",
                "ชื่อโครงการ",
                "ผู้รับผิดชอบโครงการ",
                "ประเภท",
                "วันที่กิจกรรม",
                "สถานะ",
                "งบประมาณรวม"
            ];

            const rows = projects.map(p => {
                const activityDate = p.activityDate ? new Date(p.activityDate).toLocaleDateString('th-TH') : "-";
                const statusMap: Record<string, string> = {
                    'Not Start': 'ยังไม่เริ่ม',
                    'Planning': 'วางแผน',
                    'In Progress': 'กำลังดำเนินการ',
                    'Done': 'เสร็จสิ้น'
                };
                const status = statusMap[p.progressLevel || 'Not Start'] || 'ยังไม่เริ่ม';

                return [
                    p.projectCode || "-",
                    p.name,
                    p.owner || "-",
                    p.category,
                    activityDate,
                    status,
                    p.budget
                ];
            });

            const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");

            // Add BOM for Excel compatibility with Thai characters
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const dateStr = new Date().toISOString().split('T')[0];

            link.setAttribute("href", url);
            link.setAttribute("download", `ภาพรวมโครงการ_${dateStr}.csv`);
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setTimeout(() => setIsExporting(false), 500);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffcfb] font-sans">
            <Navbar />
            <main className="app-container px-4 py-8 lg:px-8 animation-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 tracking-tight mb-2">
                            ภาพรวมโครงการ
                        </h1>
                        <p className="text-stone-500 font-bold text-base mt-1 tracking-tight">สรุปข้อมูลโครงการและสถานะการดำเนินงานทั้งหมด</p>
                    </div>
                    <Button
                        onClick={handleExportCSV}
                        disabled={isExporting || projects.length === 0}
                        className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-black px-6 rounded-xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 flex items-center gap-2 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        {isExporting ? "กำลังเตรียมข้อมูล..." : "ส่งออกรายงาน (CSV)"}
                    </Button>
                </div>

                <Card className="border-none shadow-xl shadow-stone-200/50 card-premium overflow-hidden ring-1 ring-white/50">
                    <CardHeader className="bg-white/60 border-b border-white/20 backdrop-blur-md py-4 px-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-stone-900 rounded-lg shadow-sm text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg>
                            </div>
                            <CardTitle className="text-stone-900 text-lg font-black tracking-tight">รายการโครงการทั้งหมด</CardTitle>
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-black border border-orange-200">
                            {projects.length} โครงการ
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-sm">
                                        <th className="h-12 px-6 align-middle font-black text-stone-400 uppercase tracking-widest text-[10px]">รหัส/ชื่อโครงการ</th>
                                        <th className="h-12 px-6 align-middle font-black text-stone-400 uppercase tracking-widest text-[10px]">วันที่/สถานะ</th>
                                        <th className="h-12 px-6 align-middle font-black text-stone-400 uppercase tracking-widest text-[10px]">ผู้รับผิดชอบ</th>
                                        <th className="h-12 px-6 align-middle font-black text-stone-400 uppercase tracking-widest text-[10px]">ประเภท</th>
                                        <th className="h-12 px-6 align-middle font-black text-stone-400 uppercase tracking-widest text-[10px] text-right">งบประมาณรวม</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {projects.length > 0 ? (
                                        projects.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="group hover:bg-orange-50/40 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className=" text-[10px] font-bold text-stone-400">#{project.projectCode || "N/A"}</div>
                                                    <div className="font-bold text-stone-900 text-sm">{project.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-stone-700 mb-1">
                                                        {project.activityDate ? new Date(project.activityDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' }) : '-'}
                                                    </div>
                                                    <div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-inset shadow-sm
                                                            ${!project.progressLevel || project.progressLevel === 'Not Start' ? 'bg-stone-100 text-stone-600 ring-stone-300' : ''}
                                                            ${project.progressLevel === 'Planning' ? 'bg-indigo-50 text-indigo-700 ring-indigo-200' : ''}
                                                            ${project.progressLevel === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-blue-200' : ''}
                                                            ${project.progressLevel === 'Done' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : ''}
                                                        `}>
                                                            {{
                                                                'Not Start': 'ยังไม่เริ่ม',
                                                                'Planning': 'วางแผน',
                                                                'In Progress': 'กำลังดำเนินการ',
                                                                'Done': 'เสร็จสิ้น'
                                                            }[project.progressLevel || 'Not Start']}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">
                                                    <div className="font-bold text-xs">{project.owner || "-"}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold border shadow-sm backdrop-blur-sm
                                                        ${getCategoryColor(project.category || "อื่นๆ").lightBg}
                                                        ${getCategoryColor(project.category || "อื่นๆ").lightText}
                                                        ${getCategoryColor(project.category || "อื่นๆ").border}
                                                      `}>
                                                        {project.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-stone-900 text-base ">
                                                    ฿{project.budget.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-bold italic">
                                                ไม่พบข้อมูลโครงการในระบบ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
