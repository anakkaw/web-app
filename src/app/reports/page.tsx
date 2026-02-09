"use client";

import { Navbar } from "@/components/layout/navbar";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Reports() {
    const { projects } = useProjects();
    const [isExporting, setIsExporting] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            const headers = [
                "รหัสโครงการ",
                "ชื่อโครงการ",
                "ผู้รับผิดชอบโครงการ",
                "ประเภท",
                "รายการ (WBS)",
                "ปริมาณ",
                "หน่วย",
                "ราคา/หน่วย",
                "รวมเงิน"
            ];

            const rows: any[][] = [];

            projects.forEach(p => {
                if (p.wbs && p.wbs.length > 0) {
                    p.wbs.forEach(item => {
                        rows.push([
                            p.projectCode || "-",
                            p.name,
                            p.owner || "-",
                            p.category,
                            item.description,
                            item.quantity,
                            item.unit,
                            item.unitPrice,
                            item.quantity * item.unitPrice
                        ]);
                    });
                } else {
                    rows.push([
                        p.projectCode || "-",
                        p.name,
                        p.owner || "-",
                        p.category,
                        "ไม่มีข้อมูลรายการ",
                        "-",
                        "-",
                        "-",
                        p.budget
                    ]);
                }
            });

            const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");

            // Add BOM for Excel compatibility with Thai characters
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const dateStr = new Date().toISOString().split('T')[0];

            link.setAttribute("href", url);
            link.setAttribute("download", `รายงานรายละเอียดโครงการ_${dateStr}.csv`);
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
                        <h1 className="text-4xl font-black text-stone-900 tracking-tight">
                            รายงานสรุปโครงการ
                        </h1>
                        <p className="text-stone-500 font-bold text-lg mt-1 tracking-tight">ตรวจสอบรายละเอียด WBS และส่งออกข้อมูลโครงการทั้งหมด</p>
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
                        {isExporting ? "กำลังเตรียมข้อมูล..." : "ส่งออกรายละเอียด (CSV)"}
                    </Button>
                </div>

                <Card className="border-stone-200 card-premium overflow-hidden">
                    <CardHeader className="bg-stone-100/60 border-b border-stone-200 py-6 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-stone-900 text-xl font-black tracking-tight">ข้อมูลรายโครงการและ WBS</CardTitle>
                            <p className="text-stone-500 font-bold text-sm mt-1">คลิกที่แถวเพื่อดูรายการประมาณราคา (WBS) ภายในโครงการ</p>
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
                                        <th className="px-8 py-5 w-10"></th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">รหัส/ชื่อโครงการ</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">ผู้รับผิดชอบโครงการ</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm">ประเภท</th>
                                        <th className="px-8 py-5 font-normal text-stone-500 uppercase tracking-wider text-sm text-right">งบประมาณรวม</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {projects.length > 0 ? (
                                        projects.map((project) => (
                                            <>
                                                <tr
                                                    key={project.id}
                                                    onClick={() => toggleRow(project.id)}
                                                    className="group cursor-pointer hover:bg-orange-50/10 transition-colors"
                                                >
                                                    <td className="px-8 py-5 text-center">
                                                        <div className={`transition-transform duration-300 ${expandedRows[project.id] ? "rotate-90" : ""}`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 group-hover:text-orange-600"><path d="m9 18 6-6-6-6" /></svg>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="font-mono text-[11px] font-bold text-stone-400">#{project.projectCode || "N/A"}</div>
                                                        <div className="font-black text-stone-900">{project.name}</div>
                                                    </td>
                                                    <td className="px-8 py-5 text-stone-600">
                                                        <div className="font-bold">{project.owner || "-"}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-stone-200">
                                                            {project.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-black text-stone-900">
                                                        ฿{project.budget.toLocaleString()}
                                                    </td>
                                                </tr>
                                                {expandedRows[project.id] && (
                                                    <tr className="bg-stone-50/50 border-y border-stone-200/50 animate-in fade-in slide-in-from-top-1 duration-300">
                                                        <td colSpan={5} className="px-12 py-8">
                                                            <div className="max-w-4xl">
                                                                <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                                    รายละเอียดรายการประมาณราคา (WBS)
                                                                </h4>
                                                                {project.wbs && project.wbs.length > 0 ? (
                                                                    <div className="grid gap-2 border-l-2 border-orange-200 ml-1 pl-6">
                                                                        {project.wbs.map((item, idx) => (
                                                                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0 group/item">
                                                                                <div>
                                                                                    <div className="font-bold text-stone-800 text-sm group-hover/item:text-orange-600 transition-colors">{idx + 1}. {item.description}</div>
                                                                                    <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">
                                                                                        {item.quantity} {item.unit} x ฿{item.unitPrice.toLocaleString()}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div className="font-black text-stone-900">฿{(item.quantity * item.unitPrice).toLocaleString()}</div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-stone-400 font-bold italic text-sm ml-10">ไม่พบข้อมูลรายการ WBS สำหรับโครงการนี้</div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-12 text-center text-stone-400 font-bold italic text-lg">
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
