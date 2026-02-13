"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProjects, WBSItem } from "@/contexts/ProjectContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { getCategoryColor } from "@/lib/utils";
import { WBS } from "@/components/feature/WBS";

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
    const { projects, updateProject, categories, userRole } = useProjects();
    const isReadOnly = userRole === 'reader';

    const project = projects.find((p) => p.id === projectId);

    // Local state for fields
    const [selectedCategory, setSelectedCategory] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectCode, setProjectCode] = useState("");
    const [projectOwner, setProjectOwner] = useState("");
    const [projectLocation, setProjectLocation] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [progressLevel, setProgressLevel] = useState("Not Start");
    const [wbsItems, setWbsItems] = useState<WBSItem[]>([]);

    // Derived budget from WBS
    const budget = wbsItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingCode, setIsEditingCode] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Initialize state from project data
    useEffect(() => {
        if (project && !isInitialized) {
            setSelectedCategory(project.category || "อื่นๆ");
            setProjectName(project.name || "");
            setProjectCode(project.projectCode || "");
            setProjectOwner(project.owner || "");
            setProjectLocation(project.location || "");
            setActivityDate(project.activityDate || "");
            setProgressLevel(project.progressLevel || "Not Start");
            // Budget is now derived, no need to set state
            setWbsItems(project.wbs || []);
            setIsInitialized(true);
        }
    }, [project, isInitialized]);

    // Auto-save effect
    useEffect(() => {
        if (!isInitialized || !projectId || !project) return;

        const timer = setTimeout(() => {
            // Check for actual changes
            const hasChanges =
                projectName !== (project.name || "") ||
                projectCode !== (project.projectCode || "") ||
                projectOwner !== (project.owner || "") ||
                projectLocation !== (project.location || "") ||
                budget !== (project.budget || 0) ||
                selectedCategory !== (project.category || "") ||
                activityDate !== (project.activityDate || "") ||
                progressLevel !== (project.progressLevel || "Not Start") ||
                JSON.stringify(wbsItems) !== JSON.stringify(project.wbs || []);

            if (hasChanges) {
                setIsSaving(true);
                updateProject(projectId, {
                    name: projectName,
                    projectCode: projectCode,
                    owner: projectOwner,
                    location: projectLocation,
                    budget: budget, // Save derived budget
                    category: selectedCategory,
                    activityDate: activityDate,
                    progressLevel: progressLevel as any,
                    wbs: wbsItems,
                });

                // Short delay to show "Saving..." state before switching to "Saved"
                setTimeout(() => {
                    setIsSaving(false);
                    setLastSaved(new Date());
                }, 500);
            }

        }, 1000); // Debounce 1 second

        return () => clearTimeout(timer);
    }, [
        selectedCategory,
        projectName,
        projectCode,
        projectOwner,
        projectLocation,
        activityDate,
        progressLevel,
        // budget removed from dependency as it's derived from wbsItems
        wbsItems,
        projectId,
        isInitialized,
        updateProject,
        project
    ]);

    if (!project || projectId === null) {
        return (
            <div className="min-h-screen bg-[#fffcfb] font-sans">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-24 animate-page-enter">
                    <div className="inline-flex items-center justify-center p-5 bg-stone-100 rounded-full mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" x2="15" y1="15" y2="15" /></svg>
                    </div>
                    <h2 className="text-xl font-black text-stone-700 mb-2">ไม่พบโครงการ</h2>
                    <p className="text-stone-400 font-medium mb-6">โครงการที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่</p>
                    <a href="/" className="inline-flex items-center gap-2 px-5 py-2 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        กลับหน้าหลัก
                    </a>
                </div>
            </div>
        );
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
        budget
    };

    const autoSaveStatus = isSaving ? 'saving' : (lastSaved ? 'saved' : 'idle');
    const categoryColors = getCategoryColor(formData.category || "อื่นๆ");

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
            // budget case removed as it is read-only
        }
    };

    return (
        <div className="min-h-screen bg-[#fffcfb] pb-20 font-sans">
            <Navbar />

            <main className="app-container px-4 py-6 lg:px-8 max-w-5xl mx-auto animate-page-enter">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 text-stone-500 font-bold text-sm mb-1">
                            <Link href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                กลับหน้าหลัก
                            </Link>
                            <span className="text-stone-300">/</span>
                            <span>รายละเอียดโครงการ</span>
                            {autoSaveStatus !== 'idle' && (
                                <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-bold ${autoSaveStatus === 'saving' ? 'text-orange-500 animate-save-pulse' : 'text-emerald-500'
                                    }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${autoSaveStatus === 'saving' ? 'bg-orange-500' : 'bg-emerald-500'
                                        }`} />
                                    {autoSaveStatus === 'saving' ? 'กำลังบันทึก...' : 'บันทึกแล้ว'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-start gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                {isEditingTitle ? (
                                    <Input
                                        autoFocus
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        onBlur={() => setIsEditingTitle(false)}
                                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                                        className="text-2xl md:text-4xl font-black tracking-tight h-auto py-2 px-4 border-orange-300 focus:ring-orange-500 bg-white shadow-lg w-full"
                                    />
                                ) : (
                                    <h1
                                        onClick={() => !isReadOnly && setIsEditingTitle(true)}
                                        className={`text-2xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 hover:from-orange-600 to-amber-600 hover:to-amber-700 leading-tight ${!isReadOnly ? 'cursor-pointer hover:opacity-80' : ''} transition-all flex items-center gap-3 select-none`}
                                    >
                                        {formData.name || "ชื่อโครงการ..."}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                    </h1>
                                )}
                            </div>

                            {/* Editable Project Code */}
                            <div className="flex items-center">
                                {isEditingCode ? (
                                    <Input
                                        autoFocus
                                        value={formData.projectCode}
                                        onChange={(e) => handleChange('projectCode', e.target.value)}
                                        onBlur={() => setIsEditingCode(false)}
                                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingCode(false)}
                                        className="w-32 text-sm  font-bold bg-white shadow-lg border-orange-300 focus:ring-orange-500"
                                    />
                                ) : (
                                    <div
                                        onClick={() => !isReadOnly && setIsEditingCode(true)}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 ${!isReadOnly ? 'hover:bg-white hover:border-orange-300 hover:shadow-sm cursor-pointer' : ''} transition-all group`}
                                    >
                                        <span className="text-xs font-bold text-stone-500">รหัสโครงการ</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm  font-bold text-stone-600 group-hover:text-orange-600">
                                                {formData.projectCode || "CODE"}
                                            </span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Metric Cards */}
                    <Card className="relative overflow-hidden border-none shadow-xl rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white transform hover:scale-[1.01] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-5 relative z-10">
                            <CardTitle className="text-xs font-black text-blue-100 uppercase tracking-widest drop-shadow-md">งบ (WBS)</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 px-5 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-medium text-white/80">฿</span>
                                <div className="h-8 text-2xl font-medium  text-white flex items-center">
                                    {formData.budget.toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`relative overflow-hidden border-none shadow-xl rounded-2xl text-white transform hover:scale-[1.01] transition-all duration-300
                         ${formData.progressLevel === 'Done' ? 'bg-gradient-to-br from-emerald-500 to-teal-700' :
                            formData.progressLevel === 'In Progress' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                formData.progressLevel === 'Planning' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                                    'bg-gradient-to-br from-stone-400 to-stone-500'}
                    `}>
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-5 relative z-10">
                            <CardTitle className="text-xs font-black text-white/90 uppercase tracking-widest drop-shadow-md">สถานะงาน</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 px-5 pb-4">
                            <div className="relative">
                                <select
                                    value={formData.progressLevel || 'Not Start'}
                                    onChange={(e) => handleChange('progressLevel', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full bg-transparent text-2xl font-medium text-white border-none focus:ring-0 appearance-none p-0 ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <option value="Not Start" className="text-stone-900">ยังไม่เริ่ม</option>
                                    <option value="Planning" className="text-stone-900">วางแผน</option>
                                    <option value="In Progress" className="text-stone-900">กำลังดำเนินการ</option>
                                    <option value="Done" className="text-stone-900">เสร็จสิ้น</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-white/50">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`relative overflow-hidden border-none shadow-xl rounded-2xl transform hover:scale-[1.01] transition-all duration-300 ${categoryColors.bg} text-white`}>
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-5 relative z-10">
                            <CardTitle className="text-xs font-black text-white/90 uppercase tracking-widest drop-shadow-md">หมวดหมู่</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 px-5 pb-4">
                            <div className="relative">
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full bg-transparent text-2xl font-medium text-white border-none focus:ring-0 appearance-none p-0 ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <option value="อื่นๆ" className="text-stone-900">อื่นๆ</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c} className="text-stone-900">{c}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-white/50">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Owner Card */}
                    <Card className="relative overflow-hidden border-none shadow-lg rounded-2xl bg-white text-stone-900 group hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                            <CardTitle className="text-xs font-black text-stone-500 uppercase tracking-widest">เจ้าของโครงการ</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                            <Input
                                value={formData.owner}
                                onChange={(e) => handleChange('owner', e.target.value)}
                                readOnly={isReadOnly}
                                className={`h-10 text-lg font-bold border-transparent -ml-2 ${!isReadOnly ? 'hover:bg-stone-50 focus:bg-white focus:border-orange-500' : 'bg-transparent'} transition-all shadow-none`}
                                placeholder={isReadOnly ? "-" : "ระบุชื่อเจ้าของ"}
                            />
                        </CardContent>
                    </Card>

                    {/* Location Card */}
                    <Card className="relative overflow-hidden border-none shadow-lg rounded-2xl bg-white text-stone-900 group hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                            <CardTitle className="text-xs font-black text-stone-500 uppercase tracking-widest">สถานที่</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                            <Input
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                readOnly={isReadOnly}
                                className={`h-10 text-lg font-bold border-transparent -ml-2 ${!isReadOnly ? 'hover:bg-stone-50 focus:bg-white focus:border-orange-500' : 'bg-transparent'} transition-all shadow-none`}
                                placeholder={isReadOnly ? "-" : "ระบุสถานที่"}
                            />
                        </CardContent>
                    </Card>

                    {/* Activity Date Card */}
                    <Card className="relative overflow-hidden border-none shadow-lg rounded-2xl bg-white text-stone-900 group hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-5">
                            <CardTitle className="text-xs font-black text-stone-500 uppercase tracking-widest">วันที่กิจกรรม</CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                            {formData.progressLevel === 'Not Start' ? (
                                <div className="h-10 flex items-center text-lg font-medium text-stone-400 italic">
                                    ยังไม่กำหนด
                                </div>
                            ) : (
                                <Input
                                    type="date"
                                    value={formData.activityDate ? new Date(formData.activityDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleChange('activityDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                    className={`h-10 text-lg font-bold border-transparent -ml-2 ${!isReadOnly ? 'hover:bg-stone-50 focus:bg-white focus:border-orange-500' : 'bg-transparent'} transition-all shadow-none`}
                                    disabled={isReadOnly}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* WBS Section */}
                <div className="w-full mt-8">
                    <WBS items={wbsItems} onItemsChange={setWbsItems} readOnly={isReadOnly} />
                </div>
            </main>
        </div>
    );
}
