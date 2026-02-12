"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { WBS } from "@/components/feature/WBS";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProjects, WBSItem } from "@/contexts/ProjectContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";

export default function ProjectDetail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectDetailContent />
        </Suspense>
    );
}

function ProjectDetailContent() {
    const searchParams = useSearchParams();
    const paramId = searchParams.get("id");
    const projectId = paramId ? parseInt(paramId) : null;
    const { projects, updateProject, categories } = useProjects();

    const project = projects.find((p) => p.id === projectId);

    // Local state for WBS items and fields
    const [wbsItems, setWbsItems] = useState<WBSItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectCode, setProjectCode] = useState("");
    const [projectOwner, setProjectOwner] = useState("");
    const [projectLocation, setProjectLocation] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [progressLevel, setProgressLevel] = useState("Not Start");

    const [isInitialized, setIsInitialized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Initialize state from project data
    useEffect(() => {
        if (project && !isInitialized) {
            setWbsItems(project.wbs || []);
            setSelectedCategory(project.category || "อื่นๆ");
            setProjectName(project.name || "");
            setProjectCode(project.projectCode || "");
            setProjectOwner(project.owner || "");
            setProjectLocation(project.location || "");
            setActivityDate(project.activityDate || "");
            setProgressLevel(project.progressLevel || "Not Start");
            setIsInitialized(true);
        }
    }, [project, isInitialized]);

    // Auto-save effect
    useEffect(() => {
        if (!isInitialized || !projectId) return;

        const timer = setTimeout(() => {
            const newBudget = wbsItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

            setIsSaving(true);
            updateProject(projectId, {
                name: projectName,
                projectCode: projectCode,
                owner: projectOwner,
                location: projectLocation,
                wbs: wbsItems,
                budget: newBudget,
                category: selectedCategory,
                activityDate: activityDate,
                progressLevel: progressLevel as any,
            });

            // Short delay to show "Saving..." state before switching to "Saved"
            setTimeout(() => {
                setIsSaving(false);
                setLastSaved(new Date());
            }, 500);

        }, 1000); // Debounce 1 second

        return () => clearTimeout(timer);
    }, [
        wbsItems,
        selectedCategory,
        projectName,
        projectCode,
        projectOwner,
        projectLocation,
        activityDate,
        progressLevel,
        projectId,
        isInitialized,
        updateProject
    ]);

    if (!project || projectId === null) {
        return <div>Project not found</div>;
    }

    // Derived state for UI consistency
    const formData = {
        name: projectName,
        projectCode,
        owner: projectOwner,
        location: projectLocation,
        activityDate,
        progressLevel,
        category: selectedCategory,
        wbs: wbsItems
    };

    const autoSaveStatus = isSaving ? 'saving' : (lastSaved ? 'saved' : 'idle');

    // Helper to handle field changes
    const handleChange = (field: string, value: any) => {
        switch (field) {
            case 'name': setProjectName(value); break;
            case 'projectCode': setProjectCode(value); break;
            case 'owner': setProjectOwner(value); break;
            case 'location': setProjectLocation(value); break;
            case 'activityDate': setActivityDate(value); break;
            case 'progressLevel': setProgressLevel(value); break;
            case 'category': setSelectedCategory(value); break;
        }
    };

    const handleWBSChange = (newWbs: WBSItem[]) => {
        setWbsItems(newWbs);
    };

    return (
        <div className="min-h-screen bg-[#fffcfb] pb-20 font-sans">
            <Navbar />

            <main className="app-container px-4 py-8 lg:px-8 max-w-5xl mx-auto animation-in slide-in-from-bottom-4 duration-700 fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-stone-500 font-bold text-sm mb-2">
                            <Link href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                กลับหน้าหลัก
                            </Link>
                            <span className="text-stone-300">/</span>
                            <span>รายละเอียดโครงการ</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                            {formData.name || "ชื่อโครงการ..."}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-bold text-stone-600 font-mono">
                                <span>#</span>
                                {formData.projectCode || "N/A"}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                                autoSaveStatus === 'saving' ? 'bg-orange-100 text-orange-700' :
                                    'bg-stone-100 text-stone-500'
                                }`}>
                                {autoSaveStatus === 'saved' && (
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        บันทึกแล้ว
                                    </span>
                                )}
                                {autoSaveStatus === 'saving' && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        กำลังบันทึก...
                                    </span>
                                )}
                                {autoSaveStatus === 'idle' && (
                                    <span className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                        พร้อม
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Info Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* WBS Section */}
                        <Card className="card-premium border-none ring-1 ring-white/50 overflow-hidden shadow-xl shadow-stone-200/50">
                            <CardHeader className="bg-white/60 border-b border-white/20 backdrop-blur-md">
                                <CardTitle className="text-xl font-black text-stone-800 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>
                                    </div>
                                    รายละเอียดงาน (BOQ/WBS)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <WBS
                                    items={formData.wbs}
                                    onItemsChange={(newWbs) => handleWBSChange(newWbs)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Meta Info Column */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <Card className="card-premium border-none ring-1 ring-white/50 shadow-lg">
                            <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-4">
                                <CardTitle className="text-lg font-black text-stone-800">ข้อมูลโครงการ</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">ชื่อโครงการ</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="h-11 font-bold border-stone-200 bg-white/50 focus:bg-white transition-all shadow-sm"
                                        placeholder="ระบุชื่อโครงการ"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">รหัสโครงการ</Label>
                                    <Input
                                        value={formData.projectCode}
                                        onChange={(e) => handleChange('projectCode', e.target.value)}
                                        className="h-11 font-mono font-bold text-stone-700 border-stone-200 bg-stone-50/50"
                                        placeholder="เช่น PRJ-001"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">สถานะงาน</Label>
                                        <div className="relative">
                                            <select
                                                value={formData.progressLevel || 'Not Start'}
                                                onChange={(e) => handleChange('progressLevel', e.target.value)}
                                                className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-bold text-stone-700"
                                            >
                                                <option value="Not Start">ยังไม่เริ่ม</option>
                                                <option value="Planning">วางแผน</option>
                                                <option value="In Progress">กำลังดำเนินการ</option>
                                                <option value="Done">เสร็จสิ้น</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">วันที่กิจกรรม</Label>
                                        <Input
                                            type="date"
                                            value={formData.activityDate ? new Date(formData.activityDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => handleChange('activityDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                            className="h-11 font-medium border-stone-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">หมวดหมู่</Label>
                                    <div className="relative">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleChange('category', e.target.value)}
                                            className="flex h-11 w-full rounded-md border border-stone-200 bg-white/50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none font-bold text-stone-700"
                                        >
                                            <option value="อื่นๆ">อื่นๆ</option>
                                            {categories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-premium border-none ring-1 ring-white/50 shadow-lg">
                            <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-4">
                                <CardTitle className="text-lg font-black text-stone-800">ข้อมูลเพิ่มเติม</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">เจ้าของโครงการ</Label>
                                    <Input
                                        value={formData.owner}
                                        onChange={(e) => handleChange('owner', e.target.value)}
                                        className="h-11 font-medium border-stone-200 bg-white/50"
                                        placeholder="ระบุชื่อเจ้าของ"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-stone-500 tracking-wider">สถานที่</Label>
                                    <Input
                                        value={formData.location}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="h-11 font-medium border-stone-200 bg-white/50"
                                        placeholder="ระบุสถานที่"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
