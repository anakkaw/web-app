"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function ChangePasscodeModal({
    isOpen,
    onClose
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [currentPasscode, setCurrentPasscode] = useState("");
    const [newPasscode, setNewPasscode] = useState("");
    const [confirmPasscode, setConfirmPasscode] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState<"verify" | "set">("verify");

    useEffect(() => {
        if (isOpen) {
            setCurrentPasscode("");
            setNewPasscode("");
            setConfirmPasscode("");
            setError("");
            setStep("verify");
        }
    }, [isOpen]);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const storedPasscode = localStorage.getItem("app_passcode") || "1234";
        if (currentPasscode === storedPasscode) {
            setStep("set");
            setError("");
        } else {
            setError("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        }
    };

    const handleSet = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPasscode.length < 4) {
            setError("รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
            return;
        }
        if (newPasscode !== confirmPasscode) {
            setError("รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }

        localStorage.setItem("app_passcode", newPasscode);
        alert("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-sm relative shadow-2xl border-stone-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 text-stone-500 hover:text-stone-800"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Button>
                <CardHeader className="bg-stone-50 border-b border-stone-100 pb-4">
                    <CardTitle className="text-xl font-black text-stone-900 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        เปลี่ยนรหัสผ่าน
                    </CardTitle>
                    <CardDescription className="text-stone-600 font-bold text-sm">
                        {step === "verify" ? "กรุณากรอกรหัสผ่านปัจจุบัน" : "กำหนดรหัสผ่านใหม่"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {step === "verify" ? (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    className={`text-center text-2xl font-black tracking-widest h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : "border-stone-200 focus-visible:ring-orange-500"}`}
                                    placeholder="• • • •"
                                    value={currentPasscode}
                                    onChange={(e) => {
                                        setCurrentPasscode(e.target.value);
                                        if (error) setError("");
                                    }}
                                    autoFocus
                                    maxLength={10}
                                />
                                {error && <p className="text-red-600 text-xs font-bold text-center animate-pulse">{error}</p>}
                            </div>
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-600/20">
                                ตรวจสอบ
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSet} className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase">รหัสผ่านใหม่</label>
                                    <Input
                                        type="password"
                                        className="text-center text-xl font-bold tracking-widest"
                                        placeholder="• • • •"
                                        value={newPasscode}
                                        onChange={(e) => setNewPasscode(e.target.value)}
                                        autoFocus
                                        maxLength={10}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-stone-500 uppercase">ยืนยันรหัสผ่านใหม่</label>
                                    <Input
                                        type="password"
                                        className="text-center text-xl font-bold tracking-widest"
                                        placeholder="• • • •"
                                        value={confirmPasscode}
                                        onChange={(e) => setConfirmPasscode(e.target.value)}
                                        maxLength={10}
                                    />
                                </div>
                                {error && <p className="text-red-600 text-xs font-bold text-center animate-pulse">{error}</p>}
                            </div>
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-600/20">
                                บันทึกรหัสผ่านใหม่
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
