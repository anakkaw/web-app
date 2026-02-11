"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { WBS } from "@/components/feature/WBS";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProjects, WBSItem } from "@/contexts/ProjectContext";
import { Input } from "@/components/ui/input";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
    const { projects, updateProject, categories, session } = useProjects();

    const project = projects.find((p) => p.id === projectId);

    // Local state for WBS items
    const [wbsItems, setWbsItems] = useState<WBSItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectCode, setProjectCode] = useState("");
    const [projectOwner, setProjectOwner] = useState("");
    const [projectLocation, setProjectLocation] = useState("");

    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize WBS items from project data
    useEffect(() => {
        if (project && !isInitialized) {
            setWbsItems(project.wbs || []);
            setSelectedCategory(project.category || "อื่นๆ");
            setProjectName(project.name || "");
            setProjectCode(project.projectCode || "");
            setProjectOwner(project.owner || "");
            setProjectLocation(project.location || "");
            setIsInitialized(true);
        }
    }, [project, isInitialized]);

    if (!project || projectId === null) {
        return <div>Project not found</div>;
    }

    const handleSaveClick = () => {
        if (!project || projectId === null) return;

        // Calculate new budget from WBS
        const newBudget = wbsItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        // Update project
        updateProject(projectId, {
            name: projectName,
            projectCode: projectCode,
            owner: projectOwner,
            location: projectLocation,
            wbs: wbsItems,
            budget: newBudget,
            category: selectedCategory,
        });
        alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    };

    return (
        <div className="min-h-screen bg-[#fff9f2] font-sans">
            <Navbar />

            <main id="project-report-content" className="app-container px-6 py-12 lg:px-10 animation-in fade-in duration-700">
                <div className="mb-12 flex flex-col lg:flex-row lg:items-center gap-8 bg-white p-8 rounded-3xl border border-stone-200 shadow-premium relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fff7ed] rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <Button variant="ghost" size="icon" asChild className="h-12 w-12 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all shrink-0">
                        <Link href="/">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <Input
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="text-4xl font-black text-stone-900 tracking-tight bg-transparent border-none p-0 h-auto focus-visible:ring-0 w-full max-w-2xl"
                                placeholder="ระบุชื่อโครงการ..."
                            />
                            <select
                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-stone-400 font-bold text-lg tracking-tight shrink-0">รหัสโครงการ:</p>
                            <Input
                                value={projectCode}
                                onChange={(e) => setProjectCode(e.target.value)}
                                className="text-stone-600 font-mono font-bold text-lg p-0 h-auto bg-transparent border-none focus-visible:ring-0 w-32"
                                placeholder="PRJ-xxx"
                            />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-3 mt-8 lg:mt-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">ผู้รับผิดชอบโครงการ</p>
                                <Input
                                    value={projectOwner}
                                    onChange={(e) => setProjectOwner(e.target.value)}
                                    className="h-12 px-5 rounded-2xl bg-stone-100 border border-stone-200 font-bold text-stone-700 focus:bg-white transition-all"
                                    placeholder="ระบุชื่อผู้รับผิดชอบ"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">สถานที่ตั้ง</p>
                                <Input
                                    value={projectLocation}
                                    onChange={(e) => setProjectLocation(e.target.value)}
                                    className="h-12 px-5 rounded-2xl bg-stone-100 border border-stone-200 font-bold text-stone-700 focus:bg-white transition-all"
                                    placeholder="ระบุสถานที่ตั้ง"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">งบประมาณรวม (Auto)</p>
                                <div className="h-12 flex items-center px-5 rounded-2xl bg-orange-600 border border-orange-700 font-mono font-black text-white text-xl shadow-[#ea580c4d] shadow-lg">
                                    ฿{project.budget.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:ml-auto flex gap-3 lg:self-start">
                        <Button onClick={handleSaveClick} className="h-12 bg-black hover:bg-stone-800 text-white font-black px-10 rounded-2xl shadow-[0_10px_15px_-3px_rgba(28,25,23,0.1)] transition-all active:scale-95">
                            บันทึกโครงการ
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8">
                    <WBS items={wbsItems} onItemsChange={setWbsItems} />
                </div>
            </main>
        </div>
    );
}
