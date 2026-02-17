"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/navbar";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SettingsPage() {
    const { userRole, agencies, updateAgencyPasscode, isAuthenticated } = useProjects();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // Auto-dismiss toast messages after 4 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!isAuthenticated || userRole !== 'admin') {
        return (
            <div className="min-h-screen bg-stone-50 font-sans">
                <Navbar />
                <div className="container mx-auto py-20 text-center animate-page-enter">
                    <div className="inline-flex items-center justify-center p-5 bg-stone-100 rounded-full mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h1 className="text-2xl font-black text-stone-700 mb-2">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
                    <p className="text-stone-400 font-medium">กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin)</p>
                </div>
            </div>
        );
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingPassword(true);
        setMessage(null);

        try {
            if (newPassword.length < 6) {
                throw new Error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            }
            if (newPassword !== confirmPassword) {
                throw new Error("รหัสผ่านไม่ตรงกัน");
            }

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            setMessage({ text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว", type: "success" });
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ text: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", type: "error" });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 font-sans pb-20">
            <Navbar />
            <div className="container mx-auto py-10 px-4 max-w-4xl animate-page-enter">
                <div className="flex items-center gap-2 text-stone-500 font-bold text-xs mb-6 uppercase tracking-wider">
                    <Link href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        หน้าหลัก
                    </Link>
                    <span className="text-stone-300">/</span>
                    <span>ตั้งค่าระบบ</span>
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center text-stone-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight">ตั้งค่าระบบ</h1>
                        <p className="text-stone-500 font-bold">จัดการรหัสผ่านและการเข้าถึงข้อมูล</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Agency Reader Passcodes */}
                    <Card className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b border-stone-100 px-6 py-5">
                            <CardTitle className="text-lg font-black text-stone-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-orange-500 rounded-full inline-block"></span>
                                รหัสผ่านสำหรับอ่านข้อมูล (Reader Access)
                            </CardTitle>
                            <CardDescription className="text-stone-500 mt-1 font-medium pl-3.5">
                                กำหนดรหัสผ่านเพื่อให้ผู้ใช้งานทั่วไป (Reader) เข้าถึงข้อมูลของแต่ละหน่วยงานได้
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {agencies.map((agency) => (
                                <div key={agency.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200/60 transition-all hover:bg-white hover:border-orange-200 hover:shadow-sm gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-400 font-bold text-xs uppercase shadow-sm">
                                                {agency.name.substring(0, 2)}
                                            </div>
                                            <h3 className="font-bold text-stone-800">{agency.name}</h3>
                                        </div>
                                        <p className="text-xs text-stone-400 pl-10 font-medium flex items-center gap-2">
                                            รหัสปัจจุบัน:
                                            <span className="font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-700 tracking-wider font-bold">
                                                {agency.passcode || 'ไม่ระบุ'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-10 sm:pl-0">
                                        <div className="relative">
                                            <Input
                                                placeholder="ตั้งรหัสใหม่"
                                                className="w-40 font-bold text-center border-stone-200 focus:border-orange-500 h-10 rounded-lg pr-9"
                                                maxLength={6}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val) {
                                                            updateAgencyPasscode(agency.id, val);
                                                            (e.target as HTMLInputElement).value = '';
                                                            setMessage({ text: `อัปเดตรหัสของ ${agency.name} เป็น ${val} แล้ว`, type: 'success' });
                                                        }
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const val = e.target.value;
                                                    if (val) {
                                                        updateAgencyPasscode(agency.id, val);
                                                        e.target.value = '';
                                                        setMessage({ text: `อัปเดตรหัสของ ${agency.name} เป็น ${val} แล้ว`, type: 'success' });
                                                    }
                                                }}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {agencies.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-xl">
                                    <p className="text-stone-400 font-bold">ไม่พบข้อมูลหน่วยงาน</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Password Settings */}
                    <Card className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b border-stone-100 px-6 py-5">
                            <CardTitle className="text-lg font-black text-stone-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-stone-800 rounded-full inline-block"></span>
                                เปลี่ยนรหัสผ่านผู้ดูแลระบบ (Admin)
                            </CardTitle>
                            <CardDescription className="text-stone-500 mt-1 font-medium pl-3.5">
                                เปลี่ยนรหัสผ่านสำหรับบัญชีผู้ดูแลระบบของคุณ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-stone-700 font-bold">รหัสผ่านใหม่</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="h-11 font-bold border-stone-200 focus:border-stone-800 rounded-lg"
                                        placeholder="อย่างน้อย 6 ตัวอักษร"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-stone-700 font-bold">ยืนยันรหัสผ่านใหม่</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-11 font-bold border-stone-200 focus:border-stone-800 rounded-lg"
                                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={loadingPassword}
                                        className="bg-stone-900 hover:bg-black text-white font-black h-11 px-8 rounded-xl w-full sm:w-auto shadow-lg shadow-stone-900/10 transition-all active:scale-95"
                                    >
                                        {loadingPassword ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                กำลังบันทึก...
                                            </>
                                        ) : "เปลี่ยนรหัสผ่าน"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {message && (
                    <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 font-bold flex items-center gap-3 z-50 ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                            {message.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            )}
                        </div>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
