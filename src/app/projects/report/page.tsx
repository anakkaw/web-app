"use client";

import { useSearchParams } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ReportContent() {
    const searchParams = useSearchParams();
    const paramId = searchParams.get("id");
    const projectId = paramId ? parseInt(paramId) : null;
    const { projects } = useProjects();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const project = projects.find((p) => p.id === projectId);

    if (!isClient) return <div className="p-10 text-center font-bold text-stone-500">กำลังโหลด...</div>;

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold text-red-500">ไม่พบข้อมูลโครงการ</h1>
                <Link href="/">
                    <Button>กลับสู่หน้าหลัก</Button>
                </Link>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalWBSAmount = (project.wbs || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const budgetUsagePercent = project.budget > 0 ? (totalWBSAmount / project.budget) * 100 : 0;
    const remainingBudget = project.budget - totalWBSAmount;

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 p-8 print:p-0 print:bg-white pb-20">
            {/* Print Controls - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        หน้าหลัก
                    </Link>
                    {projectId && (
                        <Link href={`/projects/detail?id=${projectId}`} className="flex items-center gap-1.5 text-stone-400 hover:text-orange-600 font-bold transition-colors text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                            แก้ไขโครงการ
                        </Link>
                    )}
                </div>
                <Button
                    onClick={() => window.print()}
                    className="bg-stone-900 hover:bg-black text-white font-black gap-2 h-11 px-6 rounded-xl shadow-lg shadow-stone-900/10 transition-all active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                    พิมพ์รายงาน
                </Button>
            </div>

            {/* Report Content */}
            <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none print:w-full">

                {/* Header */}
                <div className="bg-stone-50 border-b border-stone-200 p-8 print:bg-white print:border-b-2 print:border-stone-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-stone-900 mb-2">{project.name}</h1>
                            <p className="text-lg text-stone-500 font-bold">รหัสโครงการ: {project.projectCode}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">สถานะปัจจุบัน</div>
                            <div className="text-xl font-black text-orange-600 border px-3 py-1 rounded-lg border-orange-200 bg-orange-50 print:border-stone-900 print:bg-transparent print:text-stone-900 inline-block mt-1">
                                {project.progressLevel}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Info Grid */}
                <div className="p-8 grid grid-cols-2 gap-8 border-b border-stone-200 print:border-stone-200">
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">เจ้าของโครงการ</div>
                            <div className="text-lg font-bold text-stone-800">{project.owner || "-"}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">สถานที่ตั้ง</div>
                            <div className="text-lg font-bold text-stone-800">{project.location || "-"}</div>
                        </div>
                    </div>
                    <div className="space-y-4 text-right">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">วันที่กิจกรรม</div>
                            <div className="text-lg font-bold text-stone-800">{formatDate(project.activityDate)}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">หมวดหมู่</div>
                            <div className="text-lg font-bold text-stone-800">{project.category}</div>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="p-8 bg-blue-50/30 border-b border-stone-200 print:bg-stone-50">
                    <h3 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2">สรุปงบประมาณ</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                        <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm print:border-stone-300 print:shadow-none">
                            <div className="text-xs font-bold text-stone-400 mb-1">งบประมาณโครงการ</div>
                            <div className="text-2xl font-black text-stone-900">฿{project.budget.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm print:border-stone-300 print:shadow-none">
                            <div className="text-xs font-bold text-stone-400 mb-1">ใช้งานจริง (WBS)</div>
                            <div className="text-2xl font-black text-blue-600 print:text-stone-900">฿{totalWBSAmount.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-stone-100 shadow-sm print:border-stone-300 print:shadow-none">
                            <div className="text-xs font-bold text-stone-400 mb-1">คงเหลือ</div>
                            <div className={`text-2xl font-black ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-stone-900`}>
                                ฿{remainingBudget.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-right text-xs font-bold text-stone-400">
                        ใช้ไปแล้ว {budgetUsagePercent.toFixed(2)}% ของงบประมาณ
                    </div>
                </div>

                {/* WBS Table */}
                <div className="p-8">
                    <h3 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-6 border-b border-stone-200 pb-2">รายละเอียดรายการ (WBS)</h3>
                    {(project.wbs || []).length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-stone-100">
                                    <th className="text-left py-2 font-black text-stone-900 w-[10%]">#</th>
                                    <th className="text-left py-2 font-black text-stone-900 w-[50%]">รายการ</th>
                                    <th className="text-right py-2 font-black text-stone-900 w-[10%]">จำนวน</th>
                                    <th className="text-right py-2 font-black text-stone-900 w-[15%]">ราคา/หน่วย</th>
                                    <th className="text-right py-2 font-black text-stone-900 w-[15%]">รวม</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {(project.wbs || []).map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="py-3 font-bold text-stone-500">{index + 1}</td>
                                        <td className="py-3 font-bold text-stone-800">{item.description}</td>
                                        <td className="py-3 text-right text-stone-600">{item.quantity} {item.unit}</td>
                                        <td className="py-3 text-right text-stone-600">{item.unitPrice.toLocaleString()}</td>
                                        <td className="py-3 text-right font-bold text-stone-900">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-stone-200 bg-stone-50 print:bg-transparent">
                                    <td colSpan={4} className="py-4 text-right font-black text-stone-900 pr-4">รวมทั้งสิ้น</td>
                                    <td className="py-4 text-right font-black text-stone-900">{totalWBSAmount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl">
                            <p className="text-stone-400 font-bold">ยังไม่มีรายการ WBS</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-stone-200 text-center text-stone-400 text-xs font-bold">
                    รายงานนี้สร้างจากระบบ ProjectBudget เมื่อ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

export default function ProjectReportPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-bold text-stone-500">กำลังโหลดข้อมูล...</div>}>
            <ReportContent />
        </Suspense>
    );
}
