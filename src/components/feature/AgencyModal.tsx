"use client";

import { useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function AgencyModal({
    isOpen,
    onClose
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { agencies, currentAgencyId, addAgency, switchAgency, deleteAgency, updateAgencyName, updateAgencyPasscode } = useProjects();
    const [newAgencyName, setNewAgencyName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    // New state for passcode editing
    const [editingPasscodeId, setEditingPasscodeId] = useState<string | null>(null);
    const [editingPasscodeValue, setEditingPasscodeValue] = useState("");

    if (!isOpen) return null;

    const handleAddClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAgencyName.trim()) {
            addAgency(newAgencyName.trim());
            setNewAgencyName("");
            onClose();
        }
    };

    const handleRename = (id: string) => {
        if (editingName.trim()) {
            updateAgencyName(id, editingName.trim());
            setEditingId(null);
        }
    };

    const handlePasscodeSave = (id: string) => {
        updateAgencyPasscode(id, editingPasscodeValue.trim());
        setEditingPasscodeId(null);
        setEditingPasscodeValue("");
    };

    const handleDeleteClick = (id: string) => {
        if (agencies.length <= 1) {
            alert("ไม่สามารถลบหน่วยงานสุดท้ายได้");
            return;
        }
        if (confirm("คุณต้องการลบหน่วยงานนี้ใช่หรือไม่? ข้อมูลทั้งหมดในหน่วยงานนี้จะหายไป")) {
            deleteAgency(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg relative shadow-2xl border-stone-300 animate-in zoom-in-95 fade-in duration-200">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-800"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Button>
                <CardHeader className="bg-stone-100/80 border-b border-stone-200">
                    <CardTitle className="text-xl font-black text-stone-900">จัดการหน่วยงาน (ระบบสวิตช์)</CardTitle>
                    <CardDescription className="text-stone-600 font-bold">สร้างหรือเลือกหน่วยงานเพื่อแยกโครงการและงบประมาณ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleAddClick} className="flex gap-3">
                        <Input
                            className="flex-1 font-bold border-stone-200 focus:border-orange-500"
                            placeholder="ชื่อหน่วยงานใหม่..."
                            value={newAgencyName}
                            onChange={(e) => setNewAgencyName(e.target.value)}
                        />
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-600/20 px-6">
                            เพิ่ม
                        </Button>
                    </form>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">หน่วยงานทั้งหมด</p>
                        {agencies.map(agency => (
                            <div
                                key={agency.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${currentAgencyId === agency.id
                                    ? "bg-orange-50 border-orange-200 shadow-sm"
                                    : "bg-white border-stone-100 hover:border-orange-100 group"
                                    }`}
                            >
                                <div className="flex-1 flex items-center gap-3">
                                    {currentAgencyId === agency.id && (
                                        <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></div>
                                    )}

                                    {editingId === agency.id ? (
                                        <div className="flex flex-1 gap-2">
                                            <Input
                                                className="h-8 flex-1 font-bold text-sm"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700" onClick={() => handleRename(agency.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                            </Button>
                                        </div>
                                    ) : editingPasscodeId === agency.id ? (
                                        <div className="flex flex-1 gap-2 items-center">
                                            <span className="text-xs font-bold text-stone-400">Code:</span>
                                            <Input
                                                className="h-8 flex-1 font-bold text-sm"
                                                placeholder="Set passcode..."
                                                value={editingPasscodeValue}
                                                onChange={(e) => setEditingPasscodeValue(e.target.value)}
                                                autoFocus
                                            />
                                            <Button size="icon" className="h-8 w-8 bg-orange-600 hover:bg-orange-700 text-white" onClick={() => handlePasscodeSave(agency.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black ${currentAgencyId === agency.id ? "text-orange-900" : "text-stone-700"}`}>
                                                {agency.name}
                                            </span>
                                            {agency.passcode && (
                                                <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                                                    {agency.passcode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {editingId !== agency.id && editingPasscodeId !== agency.id && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Set Passcode"
                                                className="h-9 w-9 text-stone-400 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => {
                                                    setEditingPasscodeId(agency.id);
                                                    setEditingPasscodeValue(agency.passcode || "");
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-stone-400 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => {
                                                    setEditingId(agency.id);
                                                    setEditingName(agency.name);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => handleDeleteClick(agency.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </Button>
                                            {currentAgencyId !== agency.id && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-stone-200 text-stone-600 font-bold hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all ml-2"
                                                    onClick={() => {
                                                        switchAgency(agency.id);
                                                        onClose();
                                                    }}
                                                >
                                                    เลือก
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
