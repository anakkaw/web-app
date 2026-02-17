"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
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
    const [budget] = useState("");
    const [formData, setFormData] = useState({
        owner: "",
        location: "",
        category: categories[0] || "อื่นๆ",
    });

    return (
        <div className="min-h-screen bg-stone-50 font-sans pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-10 max-w-2xl animate-page-enter">
                <div className="mb-10 flex items-center gap-6">
                    <Button variant="ghost" size="icon" asChild className="h-12 w-12 text-stone-400 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200 rounded-2xl transition-all">
                        <Link href="/">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
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

                <Card className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-stone-100 py-5 px-8">
                        <CardTitle className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
                            ข้อมูลพื้นฐานโครงการ
                        </CardTitle>
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
                                    progressLevel: "Not Start",
                                    activityDate: "",
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
                                        className="h-11 border-stone-200 focus:border-stone-800 focus:ring-stone-900/5 font-semibold rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-stone-700 font-bold ml-1">ชื่อโครงการ</Label>
                                    <Input
                                        id="name"
                                        placeholder="ระบุชื่อโครงการ..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 border-stone-200 focus:border-stone-800 focus:ring-stone-900/5 font-semibold rounded-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-stone-700 font-bold ml-1">ประเภทโครงการ</Label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        className="flex h-11 w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-800 transition-all appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="owner" className="text-stone-700 font-bold ml-1">ผู้รับผิดชอบโครงการ</Label>
                                <Input
                                    id="owner"
                                    placeholder="ระบุชื่อผู้รับผิดชอบ (ไม่บังคับ)"
                                    className="h-11 font-semibold border-stone-200 focus:border-stone-800 focus:ring-stone-900/5 rounded-lg"
                                    value={formData.owner}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-stone-700 font-bold ml-1">สถานที่ตั้ง</Label>
                                <Input
                                    id="location"
                                    placeholder="ระบุสถานที่ตั้ง (ไม่บังคับ)"
                                    className="h-11 font-semibold border-stone-200 focus:border-stone-800 focus:ring-stone-900/5 rounded-lg"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-stone-100 mt-6">
                                <Button type="button" variant="ghost" asChild className="text-stone-500 font-black hover:text-stone-700 h-11 px-6 rounded-xl">
                                    <Link href="/">ยกเลิก</Link>
                                </Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-black px-8 h-11 shadow-lg shadow-orange-600/20 transition-all active:scale-95 rounded-xl">
                                    สร้างโครงการ
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
