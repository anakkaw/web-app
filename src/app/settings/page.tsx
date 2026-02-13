"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/navbar";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const { userRole, agencies, updateAgencyPasscode, isAuthenticated } = useProjects();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    if (!isAuthenticated || userRole !== 'admin') {
        return (
            <div className="min-h-screen bg-[#fffcfb] font-sans">
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
        <div className="min-h-screen bg-[#fffcfb] font-sans">
            <Navbar />
            <div className="container mx-auto py-10 px-4 max-w-3xl animate-page-enter">
                <div className="flex items-center gap-2 text-stone-500 font-bold text-sm mb-4">
                    <a href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        แดชบอร์ด
                    </a>
                    <span className="text-stone-300">/</span>
                    <span>ตั้งค่าระบบ</span>
                </div>
                <h1 className="text-3xl font-black text-stone-800 mb-8">ตั้งค่าระบบ</h1>

                <div className="space-y-8">
                    {/* Agency Reader Passcodes */}
                    <Card className="shadow-sm border-stone-200">
                        <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                            <CardTitle className="text-xl font-bold text-orange-800">รหัสผ่านสำหรับอ่านข้อมูล (แยกตามหน่วยงาน)</CardTitle>
                            <CardDescription className="text-orange-600/80">
                                กำหนดรหัสผ่านเพื่อให้ผู้ใช้งานเข้าถึงข้อมูลงบประมาณของแต่ละหน่วยงานได้
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {agencies.map((agency) => (
                                <div key={agency.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-stone-800 text-lg">{agency.name}</h3>
                                        <p className="text-sm text-stone-400">รหัสปัจจุบัน: <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">{agency.passcode || 'ไม่ระบุ'}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="ตั้งรหัสใหม่"
                                            className="w-32 font-bold text-center border-stone-200 focus:border-orange-500"
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
                                    </div>
                                </div>
                            ))}
                            {agencies.length === 0 && (
                                <div className="text-center py-8 text-stone-400">ไม่พบข้อมูลหน่วยงาน</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Password Settings */}
                    <Card className="shadow-sm border-stone-200">
                        <CardHeader className="bg-stone-100/50 border-b border-stone-200">
                            <CardTitle className="text-xl font-bold text-stone-800">เปลี่ยนรหัสผ่านผู้ดูแลระบบ (Admin)</CardTitle>
                            <CardDescription>
                                เปลี่ยนรหัสผ่านสำหรับบัญชีของคุณ
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="font-bold border-stone-300"
                                        placeholder="อย่างน้อย 6 ตัวอักษร"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="font-bold border-stone-300"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loadingPassword}
                                    className="bg-stone-800 hover:bg-black text-white font-bold w-full"
                                >
                                    {loadingPassword ? "กำลังเปลี่ยนแปลง..." : "เปลี่ยนรหัสผ่าน"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {message && (
                    <div className={`fixed bottom-8 right-8 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 font-bold ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
