"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useProjects } from "@/contexts/ProjectContext";
import { useState, useEffect } from "react";

export default function Home() {
  const {
    projects,
    deleteProject,
    categories,
    addCategory,
    deleteCategory,
    totalAllocatedBudget,
    updateTotalAllocatedBudget,
    clearAllData
  } = useProjects();
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalAllocatedBudget.toString());

  // Update temp budget when the agency's total budget changes (e.g., after switching agencies)
  useEffect(() => {
    setTempBudget(totalAllocatedBudget.toString());
  }, [totalAllocatedBudget]);

  const [sortConfig, setSortConfig] = useState<{ key: 'projectCode' | 'category' | 'budget'; direction: 'asc' | 'desc' } | null>(null);

  const totalProjectBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const remainingBudget = totalAllocatedBudget - totalProjectBudget;

  const handleBudgetSave = () => {
    const amount = parseFloat(tempBudget);
    if (!isNaN(amount)) {
      updateTotalAllocatedBudget(amount);
      setIsEditingBudget(false);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: 'projectCode' | 'category' | 'budget') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Calculate budget by category
  const budgetByCategory = projects.reduce((acc, project) => {
    const category = project.category || "อื่นๆ";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += project.budget;
    return acc;
  }, {} as Record<string, number>);

  const maxCategoryBudget = Math.max(...Object.values(budgetByCategory), 0);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (confirm(`คุณต้องการลบประเภท "${category}" ใช่หรือไม่?`)) {
      deleteCategory(category);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfb] font-sans">
      <Navbar />

      <main className="app-container px-6 py-12 lg:px-10 relative animation-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              ภาพรวมโครงการทั้งหมด
            </h1>
            <p className="text-stone-500 mt-2 text-lg font-medium">
              ติดตามสถานะและงบประมาณของโครงการทั้งหมด
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
                  clearAllData();
                }
              }}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold h-11 px-5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              ล้างข้อมูลทั้งหมด
            </Button>
            <Button variant="outline" onClick={() => setIsManageCategoriesOpen(true)} className="gap-2 border-stone-300 hover:bg-orange-50 hover:text-orange-700 text-stone-700 font-bold h-11 px-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              จัดการประเภท
            </Button>
            <Button asChild className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-black h-11 px-8 shadow-lg shadow-orange-600/20 transition-all active:scale-95">
              <Link href="/projects/new">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                สร้างโครงการใหม่
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-stone-200 card-premium overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-6 bg-stone-100/60 border-b border-stone-200 group-hover:bg-stone-100 transition-colors">
              <CardTitle className="text-[13px] font-black text-stone-500 uppercase tracking-wider">งบประมาณที่ได้รับจัดสรร</CardTitle>
              <div className="p-2.5 bg-orange-100/80 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
              </div>
            </CardHeader>
            <CardContent className="py-8 px-6">
              {isEditingBudget ? (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <Input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="h-12 text-2xl font-black font-mono focus-visible:ring-orange-500/20 border-stone-300"
                    autoFocus
                  />
                  <Button onClick={handleBudgetSave} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-black h-12 px-6">บันทึก</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between group/val">
                  <div className="text-4xl font-black text-stone-900 tracking-tight">฿{totalAllocatedBudget.toLocaleString()}</div>
                  <Button variant="ghost" size="icon" onClick={() => { setTempBudget(totalAllocatedBudget.toString()); setIsEditingBudget(true); }} className="h-10 w-10 text-stone-300 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-stone-200 card-premium overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-6 bg-stone-100/60 border-b border-stone-200 group-hover:bg-stone-100 transition-colors">
              <CardTitle className="text-[13px] font-black text-stone-500 uppercase tracking-wider">งบประมาณคงเหลือ</CardTitle>
              <div className={`p-2.5 rounded-2xl group-hover:text-white transition-all duration-300 ${remainingBudget >= 0 ? "bg-orange-100/80 group-hover:bg-orange-600" : "bg-red-100 group-hover:bg-red-600"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={remainingBudget >= 0 ? "text-orange-600 group-hover:text-white" : "text-red-700 group-hover:text-white"}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
            </CardHeader>
            <CardContent className="py-8 px-6">
              <div className={`text-4xl font-black tracking-tight ${remainingBudget >= 0 ? "text-stone-900" : "text-red-600 animate-pulse"}`}>
                ฿{remainingBudget.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="border-stone-200 card-premium overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-6 bg-stone-100/60 border-b border-stone-200 group-hover:bg-stone-100 transition-colors">
              <CardTitle className="text-[13px] font-black text-stone-500 uppercase tracking-wider">โครงการทั้งหมด</CardTitle>
              <div className="p-2.5 bg-orange-100/80 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 group-hover:text-white font-black"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1h20Z" /><path d="M2 11v7a2 2 0 0 0 2 2h7" /><path d="M16 11l5 5-5 5" /><path d="M21 16H9" /></svg>
              </div>
            </CardHeader>
            <CardContent className="py-8 px-6">
              <div className="text-4xl font-black text-stone-900 tracking-tight">{projects.length} โครงการ</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-10">
          <Card className="border-stone-200 shadow-md">
            <CardHeader className="bg-stone-50/50 border-b border-stone-100">
              <CardTitle className="flex items-center gap-2 text-stone-900 text-lg font-black">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                </div>
                สัดส่วนโครงการตามประเภท
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(budgetByCategory).map(([category, budget]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="flex items-center gap-3 text-stone-700 font-bold">
                        <span className="h-3 w-3 rounded-full bg-orange-600"></span>
                        {category}
                      </span>
                      <span className="font-mono font-bold text-stone-700">฿{budget.toLocaleString()} <span className="text-xs text-stone-500 font-normal">({totalProjectBudget > 0 ? ((budget / totalProjectBudget) * 100).toFixed(1) : 0}%)</span></span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.2)] transition-all duration-700 ease-out"
                        style={{ width: `${maxCategoryBudget > 0 ? (budget / maxCategoryBudget) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(budgetByCategory).length === 0 && (
                  <div className="text-center py-10 bg-orange-50/30 rounded-2xl border-2 border-dashed border-orange-100">
                    <p className="text-stone-500 font-bold">ยังไม่มีข้อมูลโครงการ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Table */}
        <Card className="border-stone-200 overflow-hidden shadow-md">
          <CardHeader className="bg-stone-100/60 border-b border-stone-200">
            <CardTitle className="flex items-center gap-2 text-lg text-stone-900 font-black">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg>
              </div>
              โครงการทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-hidden">
              {projects.length === 0 ? (
                <div className="text-center py-20 text-stone-500">
                  <p className="font-black text-xl mb-4">ยังไม่มีโครงการในระบบ</p>
                  <Button variant="default" asChild className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 px-8">
                    <Link href="/projects/new">สร้างโครงการแรกของคุณ</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-100/40">
                        <th onClick={() => requestSort('projectCode')} className="h-16 px-8 align-middle font-normal text-stone-500 uppercase tracking-wider text-sm cursor-pointer hover:text-orange-600 transition-colors group">
                          รหัสโครงการ
                          <span className="ml-2 inline-block opacity-0 group-hover:opacity-100">{sortConfig?.key === 'projectCode' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                        </th>
                        <th className="h-16 px-8 align-middle font-normal text-stone-500 uppercase tracking-wider text-sm">ชื่อโครงการ</th>
                        <th onClick={() => requestSort('budget')} className="h-16 px-8 align-middle font-normal text-stone-500 uppercase tracking-wider text-sm text-right cursor-pointer hover:text-orange-600 transition-colors group">
                          งบประมาณ
                          <span className="ml-2 inline-block opacity-0 group-hover:opacity-100">{sortConfig?.key === 'budget' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                        </th>
                        <th onClick={() => requestSort('category')} className="h-16 px-8 align-middle font-normal text-stone-500 uppercase tracking-wider text-sm text-center cursor-pointer hover:text-orange-600 transition-colors group">
                          ประเภท
                          <span className="ml-2 inline-block opacity-0 group-hover:opacity-100">{sortConfig?.key === 'category' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                        </th>
                        <th className="h-16 px-8 align-middle font-normal text-stone-500 uppercase tracking-wider text-sm text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {sortedProjects.map((project) => (
                        <tr key={project.id} className="transition-all hover:bg-orange-50/20 group animate-in fade-in duration-500">
                          <td className="px-6 py-5 align-middle font-mono font-bold text-stone-400 text-xs">#{project.projectCode || "N/A"}</td>
                          <td className="px-6 py-5 align-middle font-bold text-stone-900">{project.name}</td>
                          <td className="px-6 py-5 align-middle text-right font-mono font-black text-stone-700">฿{project.budget.toLocaleString()}</td>
                          <td className="px-6 py-5 align-middle text-center">
                            <span className="inline-flex items-center rounded-lg bg-orange-50 px-3 py-1.5 text-[11px] font-black text-orange-700 border border-orange-100/50">
                              {project.category || "อื่นๆ"}
                            </span>
                          </td>
                          <td className="px-6 py-5 align-middle text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-stone-400 hover:text-orange-600" asChild>
                                <Link href={`/projects/detail?id=${project.id}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-stone-300 hover:text-red-500"
                                onClick={() => {
                                  if (confirm("คุณต้องการลบโครงการนี้ใช่หรือไม่?")) {
                                    deleteProject(project.id);
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manage Categories Modal */}
        {isManageCategoriesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md relative shadow-2xl border-stone-300">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-800"
                onClick={() => setIsManageCategoriesOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </Button>
              <CardHeader className="bg-stone-100/80 border-b border-stone-200">
                <CardTitle className="text-xl font-black text-stone-900">จัดการประเภทโครงการ</CardTitle>
                <CardDescription className="text-stone-600 font-bold">เพิ่มหรือลบประเภทเพื่อใช้ประกอบโครงการ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e: React.FormEvent) => handleAddCategory(e)} className="flex gap-3">
                  <Input
                    className="flex-1 font-bold border-stone-200 focus:border-orange-500"
                    placeholder="ชื่อประเภทใหม่..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-600/20">
                    เพิ่ม
                  </Button>
                </form>
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center justify-between p-4 rounded-xl bg-stone-100 border border-stone-200 group transition-all hover:bg-white hover:border-orange-200 hover:shadow-md">
                      <span className="text-sm font-black text-stone-800">{category}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
