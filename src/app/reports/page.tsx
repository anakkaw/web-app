"use client";

import { Navbar } from "@/components/layout/navbar";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
        <div className="min-h-screen bg-[#fff9f2] font-sans">
            <Navbar />
            <main className="app-container px-6 py-12 lg:px-10 animation-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 tracking-tight">
                            ภาพรวมโครงการ
                        </h1>
                        <p className="text-stone-500 font-bold text-lg mt-1 tracking-tight">สรุปข้อมูลโครงการและสถานะการดำเนินงานทั้งหมด</p>
                    </div>
                    <Button
                        onClick={handleExportCSV}
                        disabled={isExporting || projects.length === 0}
                        className="h-14 bg-orange-600 hover:bg-orange-700 text-white font-black px-8 rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 flex items-center gap-3 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        {isExporting ? "กำลังเตรียมข้อมูล..." : "ส่งออกรายงาน (CSV)"}
                    </Button>
                </div>

                <Card className="border-stone-200 card-premium overflow-hidden">
                    <CardHeader className="bg-stone-100/60 border-b border-stone-200 py-6 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-stone-900 text-xl font-black tracking-tight">รายการโครงการ</CardTitle>
                        </div>
                        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-black border border-orange-200">
                            {projects.length} โครงการ
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-stone-200 bg-stone-50/10">
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">รหัส/ชื่อโครงการ</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">วันที่/สถานะ</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">ผู้รับผิดชอบ</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">ประเภท</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm text-right">งบประมาณรวม</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {projects.length > 0 ? (
                                        projects.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="group hover:bg-orange-50/10 transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="font-mono text-[11px] font-bold text-stone-400">#{project.projectCode || "N/A"}</div>
                                                    <div className="font-black text-stone-900 text-base">{project.name}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-bold text-stone-700">
                                                        {project.activityDate ? new Date(project.activityDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' }) : '-'}
                                                    </div>
                                                    <div className="mt-1.5">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ring-1 ring-inset shadow-sm
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
                                                <td className="px-8 py-6 text-stone-600">
                                                    <div className="font-bold">{project.owner || "-"}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border border-stone-200">
                                                        {project.category}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-stone-900 text-lg">
                                                    ฿{project.budget.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-stone-400 font-bold italic text-lg">
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
