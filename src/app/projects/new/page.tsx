"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { useState } from "react";

export default function NewProject() {
    const { addProject, categories } = useProjects();
    const router = useRouter();

    const [projectCode, setProjectCode] = useState("");
    const [name, setName] = useState("");
    const [budget, setBudget] = useState("");
    const [formData, setFormData] = useState({
        owner: "",
        location: "",
        category: categories[0] || "อื่นๆ",
    });

    return (
        <div className="min-h-screen bg-[#fff9f2] font-sans">
            <Navbar />

            <main className="app-container px-6 py-12 lg:px-10">
                <div className="max-w-xl mx-auto animation-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-10 flex items-center gap-6">
                        <Button variant="ghost" size="icon" asChild className="h-12 w-12 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all">
                            <Link href="/">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m15 18-6-6 6-6" />
                                </svg>
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-4xl font-black text-stone-900 tracking-tight">
                                สร้างโครงการใหม่
                            </h1>
                            <p className="text-stone-500 font-bold text-lg mt-1 tracking-tight">กรอกรายละเอียดเพื่อเริ่มประมาณการงบประมาณ</p>
                        </div>
                    </div>

                    <Card className="border-stone-200 card-premium overflow-hidden">
                        <CardHeader className="bg-stone-100/60 border-b border-stone-200 py-5 px-8">
                            <CardTitle className="text-xs font-black text-stone-500 uppercase tracking-[0.2em]">ข้อมูลพื้นฐานโครงการ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form className="space-y-6" onSubmit={(e) => {
                                e.preventDefault();

                                setTimeout(() => {
                                    addProject({
                                        projectCode,
                                        name,
                                        budget: parseFloat(budget) || 0,
                                        status: "วางแผน",
                                        owner: formData.owner,
                                        location: formData.location,
                                        category: formData.category,
                                        wbs: [],
                                    });
                                    router.push("/");
                                }, 100);
                            }}>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="projectCode" className="text-stone-700 font-bold ml-1">รหัสโครงการ</Label>
                                        <Input
                                            id="projectCode"
                                            placeholder="เช่น PRJ-001"
                                            value={projectCode}
                                            onChange={(e) => setProjectCode(e.target.value)}
                                            className="h-12 border-stone-200 focus:border-orange-500 focus:ring-orange-500/20 font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-stone-700 font-bold ml-1">ชื่อโครงการ</Label>
                                        <Input
                                            id="name"
                                            placeholder="ระบุชื่อโครงการ..."
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-12 border-stone-200 focus:border-orange-500 focus:ring-orange-500/20 font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-stone-700 font-bold">ประเภทโครงการ</Label>
                                    <select
                                        id="category"
                                        className="flex h-11 w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="owner" className="text-stone-700 font-bold">ผู้รับผิดชอบโครงการ</Label>
                                    <Input
                                        id="owner"
                                        placeholder="ระบุชื่อผู้รับผิดชอบ (ไม่บังคับ)"
                                        className="font-medium"
                                        value={formData.owner}
                                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-stone-700 font-bold">สถานที่ตั้ง</Label>
                                    <Input
                                        id="location"
                                        placeholder="ระบุสถานที่ตั้ง (ไม่บังคับ)"
                                        className="font-medium"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-stone-100 mt-6">
                                    <Button variant="ghost" asChild className="text-stone-500 font-black hover:text-stone-700">
                                        <Link href="/">ยกเลิก</Link>
                                    </Button>
                                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-black px-10 h-12 shadow-lg shadow-orange-600/20 transition-all active:scale-95">
                                        สร้างโครงการ
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
