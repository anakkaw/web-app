"use client";

import { Navbar } from "@/components/layout/navbar";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Auth from "@/components/feature/Auth";
import { Input } from "@/components/ui/input";
import { PieChart } from "@/components/ui/pie-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { useProjects } from "@/contexts/ProjectContext";
import { useState, useEffect, useMemo, Fragment } from "react";
import { getCategoryColor } from "@/lib/utils";


export default function Home() {
  const {
    projects,
    deleteProject,
    categories,
    addCategory,
    deleteCategory,
    totalAllocatedBudget,
    updateTotalAllocatedBudget,
    clearAllData,
    duplicateProject,
    resetAllProjectDates,
    userRole,
  } = useProjects();
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalAllocatedBudget.toString());
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<number>>(new Set());

  const toggleProjectExpansion = (projectId: number) => {
    const newExpanded = new Set(expandedProjectIds);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjectIds(newExpanded);
  };

  // Update temp budget when the agency's total budget changes (e.g., after switching agencies)
  useEffect(() => {
    setTempBudget(totalAllocatedBudget.toString());
  }, [totalAllocatedBudget]);

  const [sortConfig, setSortConfig] = useState<{ key: 'projectCode' | 'category' | 'budget' | 'name'; direction: 'asc' | 'desc' } | null>({ key: 'projectCode', direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    } catch {
      // Export failed silently
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const totalProjectBudget = useMemo(() => projects.reduce((sum, p) => sum + p.budget, 0), [projects]);
  const remainingBudget = useMemo(() => totalAllocatedBudget - totalProjectBudget, [totalAllocatedBudget, totalProjectBudget]);

  const handleBudgetSave = () => {
    const amount = parseFloat(tempBudget);
    if (!isNaN(amount)) {
      updateTotalAllocatedBudget(amount);
      setIsEditingBudget(false);
    }
  };

  const handleBudgetEditClick = () => {
    handleBudgetEditConfirm();
  };

  const handleBudgetEditConfirm = () => {
    if (userRole === 'reader') return;
    setTempBudget(totalAllocatedBudget.toString());
    setIsEditingBudget(true);
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortConfig]);

  const filteredProjects = useMemo(() => {
    return sortedProjects.filter(p => {
      const matchesCategory = filterCategory === "ทั้งหมด" || (p.category || "อื่นๆ") === filterCategory;
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (p.projectCode && p.projectCode.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [sortedProjects, filterCategory, debouncedSearchQuery]);

  const requestSort = (key: 'projectCode' | 'category' | 'budget' | 'name') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Calculate budget by category
  const budgetByCategory = useMemo(() => {
    return projects.reduce((acc, project) => {
      const category = project.category || "อื่นๆ";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += project.budget;
      return acc;
    }, {} as Record<string, number>);
  }, [projects]);

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

  const handleCategoryClick = (category: string) => {
    setFilterCategory(current => current === category ? "ทั้งหมด" : category);

    // Scroll to the project list
    const projectListElement = document.getElementById('project-list');
    if (projectListElement) {
      projectListElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Landing Page logic
  const { isAuthenticated, isLoaded } = useProjects();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white animate-save-pulse">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <p className="font-bold text-stone-400 text-sm tracking-wide">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!isAuthenticated && userRole === 'guest') {
    return (
      <div className="min-h-screen bg-stone-50 font-sans">
        <Navbar />
        <main className="app-container px-6 py-12 lg:px-10 flex items-center justify-center min-h-[calc(100vh-144px)]">
          {/* Dynamic import or just normal import if client component */}
          <Auth />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar />

      <main className="app-container px-4 py-8 lg:px-8 relative animate-page-enter">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-0 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
            <div>
              <div className="mb-6 inline-block">
                <Logo size="lg" showText={false} className="animate-in zoom-in-50 duration-500" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 mb-2 drop-shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
                ระบบบริหารจัดการโครงการ
              </h1>
              <p className="text-stone-500 text-sm sm:text-lg font-medium max-w-xl leading-relaxed">
                ติดตามสถานะและงบประมาณของโครงการทั้งหมดในที่เดียว
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isExporting || projects.length === 0}
                className="gap-2 border-emerald-200/50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold h-10 px-4 rounded-xl transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                {isExporting ? "กำลัง.." : "ส่งออก CSV"}
              </Button>
              {userRole !== 'reader' && (
                <>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className="gap-2 border-stone-200/50 text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-bold h-10 px-4 rounded-xl transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>
                      ตั้งค่า
                    </Button>

                    {isSettingsOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}></div>
                        <div className="absolute top-12 right-0 z-50 w-56 bg-white rounded-xl shadow-xl border border-stone-200 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => {
                                setIsManageCategoriesOpen(true);
                                setIsSettingsOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors text-left"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                              จัดการประเภท
                            </button>
                            <button
                              onClick={() => {
                                resetAllProjectDates();
                                setIsSettingsOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-left"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M5 6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /><path d="M10 16h4" /><path d="M12 14v4" /></svg>
                              รีเซ็ตวันที่
                            </button>
                            <div className="h-px bg-stone-100 my-1"></div>
                            <button
                              onClick={() => {
                                if (confirm("คุณต้องการล้างข้อมูลทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
                                  clearAllData();
                                }
                                setIsSettingsOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                              ล้างข้อมูลระบบ
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger">
            {/* Allocated Budget - Blue */}
            <Card className="relative overflow-hidden border-none shadow-xl rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white transform hover:scale-[1.01] transition-all duration-300">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-1V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7Zm-4-1a2 2 0 0 1 2 2v1H5V6a2 2 0 0 1 2-2h10Zm6 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9h18v7Z" /><path d="M16 14h.01" /></svg>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-5 relative z-10">
                <CardTitle className="text-sm font-black text-blue-100 uppercase tracking-widest drop-shadow-md">งบ (ได้รับจัดสรร)</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-5 pb-4">
                {isEditingBudget ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                    <Input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="h-10 text-2xl font-medium  focus-visible:ring-blue-500/20 border-white/20 bg-white/20 text-white placeholder-blue-200"
                      autoFocus
                    />
                    <Button onClick={handleBudgetSave} size="sm" className="bg-white hover:bg-blue-50 text-blue-600 font-black h-10 px-4 rounded-lg">บันทึก</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group/val">
                    <div className="text-3xl lg:text-4xl font-medium text-white  drop-shadow-md">฿{totalAllocatedBudget.toLocaleString()}</div>
                    {userRole !== 'reader' && (
                      <Button variant="ghost" size="icon" onClick={handleBudgetEditClick} className="h-8 w-8 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-all opacity-0 group-hover/val:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Remaining Budget - Green/Red */}
            <Card className={`relative overflow-hidden border-none shadow-xl rounded-2xl text-white transform hover:scale-[1.01] transition-all duration-300 ${remainingBudget >= 0 ? "bg-gradient-to-br from-emerald-500 to-teal-700" : "bg-gradient-to-br from-red-500 to-rose-700"}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-1.5.3-.5.5-1 1-1.5a6.4 6.4 0 0 0-2-8Z" /></svg>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-5 relative z-10">
                <CardTitle className="text-sm font-black text-white/90 uppercase tracking-widest drop-shadow-md">งบ (คงเหลือ)</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-5 pb-4">
                <div className="text-3xl lg:text-4xl font-medium  drop-shadow-md">
                  ฿{remainingBudget.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Total Projects - Orange */}
            <Card className="relative overflow-hidden border-none shadow-xl rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white transform hover:scale-[1.01] transition-all duration-300">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M9 14h6" /><path d="M9 10h6" /><path d="M9 18h6" /></svg>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-5 relative z-10">
                <CardTitle className="text-sm font-black text-orange-100 uppercase tracking-widest drop-shadow-md">โครงการทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-5 pb-4">
                <div className="text-3xl lg:text-4xl font-medium text-white  drop-shadow-md">{projects.length} <span className="text-lg text-orange-100 font-bold">โครงการ</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Charts Section using Grid */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Progress Summary */}
            <Card className="card-premium border-none ring-1 ring-white/50 overflow-hidden h-full">
              <CardHeader className="bg-white/40 border-b border-white/20 backdrop-blur-sm py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-stone-900 text-lg font-black">
                  <div className="p-1.5 bg-blue-100 rounded-lg shadow-sm text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                  </div>
                  ภาพรวมความคืบหน้า
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {['Not Start', 'Planning', 'In Progress', 'Done'].map((status) => {
                    const count = projects.filter(p => (p.progressLevel || 'Not Start') === status).length;
                    const colorMap: Record<string, string> = {
                      'Not Start': 'bg-stone-100 text-stone-600 ring-stone-200 hover:bg-stone-200 hover:scale-105',
                      'Planning': 'bg-indigo-100 text-indigo-700 ring-indigo-300 hover:bg-indigo-200 hover:scale-105',
                      'In Progress': 'bg-orange-100 text-orange-700 ring-orange-300 hover:bg-orange-200 hover:scale-105',
                      'Done': 'bg-emerald-100 text-emerald-700 ring-emerald-300 hover:bg-emerald-200 hover:scale-105'
                    };
                    const labelMap: Record<string, string> = {
                      'Not Start': 'ยังไม่เริ่ม',
                      'Planning': 'วางแผน',
                      'In Progress': 'กำลังดำเนินการ',
                      'Done': 'เสร็จสิ้น'
                    };
                    return (
                      <div key={status} className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 ring-1 ring-inset ${colorMap[status]} transition-all duration-300 shadow-sm cursor-default hover:shadow-md`}>
                        <span className="text-xs font-black opacity-80 uppercase tracking-wider">{labelMap[status]}</span>
                        <span className="text-3xl lg:text-4xl font-black tracking-tighter drop-shadow-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category Proportion */}
            <Card className="card-premium border-none ring-1 ring-white/50 overflow-hidden h-full">
              <CardHeader className="bg-white/40 border-b border-white/20 backdrop-blur-sm py-4 px-6">
                <CardTitle className="flex items-center gap-2 text-stone-900 text-lg font-black">
                  <div className="p-1.5 bg-orange-100 rounded-lg shadow-sm text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                  </div>
                  สัดส่วนงบประมาณตามประเภทโครงการ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {Object.keys(budgetByCategory).length === 0 ? (
                  <div className="text-center py-10 bg-stone-50/50 rounded-2xl border-2 border-dashed border-stone-200">
                    <p className="text-stone-400 font-bold text-base">ยังไม่มีข้อมูลโครงการ</p>
                  </div>
                ) : (
                  <PieChart
                    data={Object.entries(budgetByCategory)
                      .sort(([, a], [, b]) => b - a) // Sort by value descending
                      .map(([category, budget]) => {
                        const colors = getCategoryColor(category);

                        return {
                          label: category,
                          value: budget,
                          color: colors.hex
                        };
                      })}
                    onCategoryClick={handleCategoryClick}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects Table */}
          <Card id="project-list" className="card-premium border border-stone-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-stone-200 py-5 px-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg text-stone-900 font-black tracking-tight">
                  <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg>
                  </div>
                  รายการโครงการ
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" strokeWidth="2" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                      </svg>
                      <Input
                        type="text"
                        placeholder="ค้นหาชื่อโครงการ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 w-[180px] sm:w-[240px] bg-stone-50 border-stone-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filterCategory === 'ทั้งหมด' ? 'default' : 'ghost'}
                      onClick={() => setFilterCategory('ทั้งหมด')}
                      className={`h-8 px-3 rounded-lg font-bold text-xs ${filterCategory === 'ทั้งหมด' ? 'bg-stone-900 text-white hover:bg-stone-800' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'}`}
                    >
                      ทั้งหมด
                    </Button>
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={filterCategory === cat ? 'default' : 'ghost'}
                        onClick={() => setFilterCategory(cat)}
                        className={`h-8 px-3 rounded-lg font-bold text-xs ${filterCategory === cat ? 'bg-orange-600 text-white hover:bg-orange-700' : 'text-stone-500 hover:text-orange-700 hover:bg-orange-50'}`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>

                  {userRole !== 'reader' && (
                    <div className="hidden sm:block h-6 w-px bg-stone-200"></div>
                  )}

                  {userRole !== 'reader' && (
                    <Button size="sm" asChild className="gap-2 bg-stone-900 hover:bg-black text-white font-bold h-9 px-4 rounded-xl shadow-sm transition-all active:scale-95">
                      <Link href="/projects/new">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        สร้างโครงการ
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-hidden min-h-[300px]">
                {projects.length === 0 ? (
                  <div className="text-center py-24 text-stone-500">
                    <div className="inline-flex items-center justify-center p-6 bg-stone-50 rounded-full mb-6 text-stone-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" x2="12" y1="18" y2="12" /><line x1="9" x2="15" y1="15" y2="15" /></svg>
                    </div>
                    <p className="font-bold text-xl mb-2 text-stone-700">เริ่มสร้างโครงการของคุณ</p>
                    <p className="text-stone-400 mb-8 max-w-sm mx-auto">ยังไม่มีข้อมูลในระบบ สร้างโครงการใหม่เพื่อเริ่มติดตาม</p>
                    <Button variant="default" asChild className="bg-stone-900 hover:bg-black text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-stone-900/10">
                      <Link href="/projects/new">สร้างโครงการใหม่</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="text-center py-16 text-stone-500">
                        <p className="font-bold text-lg">ไม่พบโครงการในหมวดหมู่ "{filterCategory}"</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <div className="hidden md:block bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                          {/* Header Row */}
                          <div className="flex items-center border-b border-stone-200 bg-stone-50/50 text-xs text-stone-500 font-bold uppercase tracking-wider">
                            <div className="h-12 w-[50px] shrink-0 flex items-center justify-center"></div>
                            <div onClick={() => requestSort('projectCode')} className="h-12 w-[100px] shrink-0 hidden lg:flex items-center px-6 cursor-pointer hover:text-stone-800 transition-colors group whitespace-nowrap">
                              รหัส
                              <span className={`ml-1.5 inline-block transition-all ${sortConfig?.key === 'projectCode' ? 'opacity-100 text-orange-600 scale-110' : 'opacity-30 group-hover:opacity-100'}`}>
                                {sortConfig?.key === 'projectCode' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                              </span>
                            </div>
                            <div onClick={() => requestSort('name')} className="h-12 flex-1 min-w-0 flex items-center px-6 cursor-pointer hover:text-stone-800 transition-colors group">
                              ชื่อโครงการ
                              <span className={`ml-1.5 inline-block transition-all ${sortConfig?.key === 'name' ? 'opacity-100 text-orange-600 scale-110' : 'opacity-30 group-hover:opacity-100'}`}>
                                {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                              </span>
                            </div>
                            <div className="h-12 w-[100px] shrink-0 hidden xl:flex items-center justify-center whitespace-nowrap">สถานะ</div>
                            <div className="h-12 w-[100px] shrink-0 hidden xl:flex items-center justify-center whitespace-nowrap">วันที่</div>
                            <div onClick={() => requestSort('budget')} className="h-12 w-[160px] shrink-0 flex items-center justify-end px-6 cursor-pointer hover:text-stone-800 transition-colors group whitespace-nowrap">
                              งบประมาณ
                              <span className={`ml-1.5 inline-block transition-all ${sortConfig?.key === 'budget' ? 'opacity-100 text-orange-600 scale-110' : 'opacity-30 group-hover:opacity-100'}`}>
                                {sortConfig?.key === 'budget' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                              </span>
                            </div>
                            <div onClick={() => requestSort('category')} className="h-12 w-[140px] shrink-0 hidden lg:flex items-center justify-center px-6 cursor-pointer hover:text-stone-800 transition-colors group whitespace-nowrap">
                              หมวดหมู่
                              <span className={`ml-1.5 inline-block transition-all ${sortConfig?.key === 'category' ? 'opacity-100 text-orange-600 scale-110' : 'opacity-30 group-hover:opacity-100'}`}>
                                {sortConfig?.key === 'category' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                              </span>
                            </div>
                            <div className="h-12 w-[280px] shrink-0 flex items-center justify-center whitespace-nowrap">
                              {userRole !== 'reader' && "จัดการ"}
                            </div>
                          </div>

                          {/* Rows */}
                          <div className="divide-y divide-stone-100">
                            {filteredProjects.map((project) => {
                              const isExpanded = expandedProjectIds.has(project.id);
                              const totalWBS = (project.wbs || []).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

                              return (
                                <div key={project.id} className="group transition-colors hover:bg-stone-50">
                                  <div className={`flex items-center ${isExpanded ? "bg-stone-50" : ""}`}>
                                    <div className="w-[50px] shrink-0 flex items-center justify-center py-3">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-7 w-7 rounded-md transition-transform duration-200 ${isExpanded ? "rotate-180 text-stone-600 bg-stone-200/50" : "text-stone-300 hover:text-stone-600 hover:bg-stone-100"}`}
                                        onClick={() => toggleProjectExpansion(project.id)}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                      </Button>
                                    </div>
                                    <div className="w-[100px] shrink-0 hidden lg:flex items-center px-6 py-4 font-mono font-medium text-stone-400 text-xs whitespace-nowrap">
                                      #{project.projectCode || "N/A"}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center px-4 sm:px-6 py-4 font-bold text-stone-900 text-sm">
                                      {project.name}
                                    </div>
                                    <div className="w-[100px] shrink-0 hidden xl:flex items-center justify-center px-4 sm:px-6 py-4">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap
                                      ${!project.progressLevel || project.progressLevel === 'Not Start' ? 'bg-stone-100 text-stone-600' : ''}
                                      ${project.progressLevel === 'Planning' ? 'bg-indigo-50 text-indigo-700' : ''}
                                      ${project.progressLevel === 'In Progress' ? 'bg-orange-50 text-orange-700' : ''}
                                      ${project.progressLevel === 'Done' ? 'bg-emerald-50 text-emerald-700' : ''}
                                      `}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                                        ${!project.progressLevel || project.progressLevel === 'Not Start' ? 'bg-stone-400' : ''}
                                        ${project.progressLevel === 'Planning' ? 'bg-indigo-500' : ''}
                                        ${project.progressLevel === 'In Progress' ? 'bg-orange-500' : ''}
                                        ${project.progressLevel === 'Done' ? 'bg-emerald-500' : ''}
                                        `}></span>
                                        {project.progressLevel === 'Not Start' && 'ยังไม่เริ่ม'}
                                        {project.progressLevel === 'Planning' && 'วางแผน'}
                                        {project.progressLevel === 'In Progress' && 'กำลังทำ'}
                                        {project.progressLevel === 'Done' && 'เสร็จสิ้น'}
                                        {!project.progressLevel && 'ยังไม่เริ่ม'}
                                      </span>
                                    </div>
                                    <div className="w-[100px] shrink-0 hidden xl:flex items-center justify-center px-6 py-4 text-stone-500 font-medium text-xs whitespace-nowrap">
                                      {project.activityDate ? new Date(project.activityDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' }) : '-'}
                                    </div>
                                    <div className="w-[160px] shrink-0 flex items-center justify-end px-4 sm:px-6 py-4 font-bold text-stone-900 text-sm whitespace-nowrap">
                                      ฿{(project.budget || 0).toLocaleString()}
                                    </div>
                                    <div className="w-[140px] shrink-0 hidden lg:flex items-center justify-center px-6 py-4">
                                      <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                                        {project.category || "อื่นๆ"}
                                      </span>
                                    </div>
                                    <div className="w-[280px] shrink-0 flex items-center justify-center px-1 sm:px-6 py-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" className="h-8 px-3 bg-orange-50 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-all border border-orange-100/50" asChild>
                                        <Link href={`/projects/detail?id=${project.id}`} className="flex items-center gap-1.5">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                          <span className="text-xs">แก้ไข</span>
                                        </Link>
                                      </Button>
                                      {userRole !== 'reader' && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => duplicateProject(project.id)}
                                            title="คัดลอก"
                                            className="h-8 px-3 bg-blue-50 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all border border-blue-100/50 flex items-center gap-1.5"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                            <span className="text-xs">คัดลอก</span>
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-3 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all border border-red-100/50 flex items-center gap-1.5"
                                            onClick={(e) => {
                                              if (confirm("คุณต้องการลบโครงการนี้ใช่หรือไม่?")) {
                                                deleteProject(project.id);
                                              }
                                            }}
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            <span className="text-xs">ลบ</span>
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {isExpanded && (
                                    <div className="w-full bg-orange-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="border-b border-stone-200/50 p-0">
                                        <div className="p-4 bg-stone-50/80 m-2 rounded-xl border border-stone-200/60 shadow-inner">
                                          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                                            <div className="px-4 py-3 bg-stone-50/50 border-b border-stone-200 flex justify-between items-center">
                                              <span className="text-xs font-black text-stone-500 uppercase tracking-wider">รายการค่าใช้จ่าย (WBS)</span>
                                              <span className="text-[10px] font-bold text-stone-400">เรียงตามลำดับ</span>
                                            </div>
                                            {(!project.wbs || project.wbs.length === 0) ? (
                                              <div className="p-8 text-center text-stone-400 text-sm font-medium">ยังไม่มีรายการค่าใช้จ่าย</div>
                                            ) : (
                                              <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-stone-500 table-fixed">
                                                  <thead>
                                                    <tr className="border-b border-stone-200 text-xs text-stone-400 font-bold uppercase tracking-wider">
                                                      <th className="px-4 py-3 text-center w-[50px]">#</th>
                                                      <th className="px-4 py-3 w-auto">รายการ</th>
                                                      <th className="px-4 py-3 text-right w-[100px] hidden sm:table-cell">ปริมาณ</th>
                                                      <th className="px-4 py-3 text-center w-[80px] hidden sm:table-cell">หน่วย</th>
                                                      <th className="px-4 py-3 text-right w-[120px] hidden sm:table-cell">ราคา/หน่วย</th>
                                                      <th className="px-4 py-3 text-right w-[140px] whitespace-nowrap">รวม</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-stone-100">
                                                    {(project.wbs || []).map((item, idx) => {
                                                      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
                                                      return (
                                                        <tr key={item.id || idx} className="hover:bg-white transition-colors group">
                                                          <td className="px-4 py-3 text-center text-stone-300 font-bold text-xs sm:text-sm w-[50px]">{idx + 1}</td>
                                                          <td className="px-4 py-3 w-auto">
                                                            <div className="font-bold text-stone-800 text-sm sm:text-base mb-0.5">{item.description}</div>
                                                            <div className="sm:hidden mt-2 text-xs text-stone-500 flex items-center gap-2">
                                                              <span className="font-medium bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{item.quantity} {item.unit}</span>
                                                              <span className="text-stone-300">×</span>
                                                              <span>฿{item.unitPrice.toLocaleString()}</span>
                                                            </div>
                                                          </td>
                                                          <td className="px-4 py-3 text-right font-bold text-stone-700 hidden sm:table-cell w-[100px]">{item.quantity.toLocaleString()}</td>
                                                          <td className="px-4 py-3 text-center font-medium text-stone-500 text-xs hidden sm:table-cell w-[80px]">{item.unit}</td>
                                                          <td className="px-4 py-3 text-right font-bold text-stone-700 hidden sm:table-cell w-[120px]">{item.unitPrice.toLocaleString()}</td>
                                                          <td className="px-4 py-3 text-right font-bold text-stone-800 text-base whitespace-nowrap w-[140px]">฿{itemTotal.toLocaleString()}</td>
                                                        </tr>
                                                      );
                                                    })}
                                                    <tr className="bg-stone-100/50 border-t border-stone-200">
                                                      <td colSpan={4} className="visible hidden sm:table-cell"></td>
                                                      <td className="px-4 py-4 text-right font-black text-stone-600 text-[10px] uppercase tracking-wider">รวมทั้งหมด</td>
                                                      <td className="px-4 py-4 text-right font-black text-stone-900 text-lg whitespace-nowrap">฿{totalWBS.toLocaleString()}</td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden space-y-4">
                          {filteredProjects.map((project) => {
                            const isExpanded = expandedProjectIds.has(project.id);
                            const totalWBS = (project.wbs || []).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
                            const progressLevel = project.progressLevel || 'Not Start';
                            const statusStyles: Record<string, string> = {
                              'Not Start': 'bg-stone-100 text-stone-600',
                              'Planning': 'bg-indigo-50 text-indigo-700',
                              'In Progress': 'bg-orange-50 text-orange-700',
                              'Done': 'bg-emerald-50 text-emerald-700'
                            };

                            const formattedStatus: Record<string, string> = {
                              'Not Start': 'ยังไม่เริ่ม',
                              'Planning': 'วางแผน',
                              'In Progress': 'กำลังดำเนินการ',
                              'Done': 'เสร็จสิ้น'
                            };

                            return (
                              <div key={project.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                                <div
                                  className="p-4 cursor-pointer active:bg-stone-50 transition-colors"
                                  onClick={() => toggleProjectExpansion(project.id)}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-bold text-stone-900 text-lg mb-1">{project.name}</h3>
                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyles[progressLevel] || 'bg-stone-100 text-stone-800'}`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${progressLevel === 'Not Start' ? 'bg-stone-400' : progressLevel === 'Planning' ? 'bg-indigo-500' : progressLevel === 'In Progress' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                                          {formattedStatus[progressLevel] || 'ยังไม่เริ่ม'}
                                        </span>
                                        <span className="text-xs text-stone-400 font-medium px-2 py-0.5 bg-stone-100 rounded-full">{project.category || "อื่นๆ"}</span>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className={`h-8 w-8 text-stone-400 transition-transform duration-200 ${isExpanded ? "rotate-180 bg-stone-100 text-stone-600" : ""}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </Button>
                                  </div>

                                  <div className="flex justify-between items-end">
                                    <div className="text-xs text-stone-500">
                                      {project.startDate ? new Date(project.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-stone-400 font-medium mb-0.5">งบประมาณ</div>
                                      <div className="text-xl font-black text-stone-900">฿{project.budget.toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Bar */}
                                <div className="border-t border-stone-100 p-2 flex justify-end gap-2 bg-stone-50/50">
                                  <Button variant="ghost" size="sm" className="h-8 bg-orange-50 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-all border border-orange-100/50" asChild onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/projects/detail?id=${project.id}`} className="flex items-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                      <span className="text-xs">แก้ไข</span>
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all border border-red-100/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("คุณต้องการลบโครงการนี้ใช่หรือไม่?")) {
                                        deleteProject(project.id);
                                      }
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                    <span className="text-xs">ลบ</span>
                                  </Button>
                                </div>

                                {/* Expanded WBS Section */}
                                {isExpanded && (
                                  <div className="border-t border-stone-200 bg-stone-50/50 p-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
                                      <div className="p-3 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                                        <h4 className="font-bold text-stone-700 text-sm">รายการค่าใช้จ่าย</h4>
                                        <Link href={`/projects/detail?id=${project.id}`} className="text-xs text-orange-600 font-bold hover:text-orange-700">
                                          จัดการ &rarr;
                                        </Link>
                                      </div>

                                      {(project.wbs || []).length === 0 ? (
                                        <div className="p-6 text-center text-stone-400 text-sm">ยังไม่มีรายการ</div>
                                      ) : (
                                        <ul className="divide-y divide-stone-100">
                                          {(project.wbs || []).map((item, idx) => {
                                            const itemTotal = item.quantity * item.unitPrice;
                                            return (
                                              <li key={idx} className="p-3 hover:bg-stone-50 transition-colors">
                                                <div className="flex justify-between items-start gap-3 mb-1">
                                                  <span className="text-stone-800 font-medium text-sm leading-tight">{item.description}</span>
                                                  <span className="font-bold text-stone-900 text-sm whitespace-nowrap">฿{itemTotal.toLocaleString()}</span>
                                                </div>
                                                <div className="text-xs text-stone-400 font-medium">
                                                  {item.quantity.toLocaleString()} {item.unit} x ฿{item.unitPrice.toLocaleString()}
                                                </div>
                                              </li>
                                            );
                                          })}
                                          <li className="p-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                                            <span className="text-xs font-black text-stone-500 uppercase tracking-wider">รวมทั้งหมด</span>
                                            <span className="text-base font-black text-stone-900">฿{totalWBS.toLocaleString()}</span>
                                          </li>
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                    }
                  </div >
                )}
              </div >
            </CardContent >
          </Card >



          {/* Manage Categories Modal */}
          {
            isManageCategoriesOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
                <Card className="w-full max-w-md relative shadow-2xl border-stone-300 animate-in zoom-in-95 fade-in duration-200">
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
            )
          }
        </div >
      </main >
    </div >
  );
}
