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

export function PasscodeModal({
    isOpen,
    onClose,
    onSuccess,
    title = "ยืนยันรหัสผ่าน",
    description = "กรุณากรอกรหัสผ่านเพื่อดำเนินการต่อ"
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title?: string;
    description?: string;
}) {
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setPasscode("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Get stored passcode or default to '1234'
        const storedPasscode = localStorage.getItem("app_passcode") || "1234";

        if (passcode === storedPasscode) {
            onSuccess();
            onClose();
        } else {
            setError("รหัสผ่านไม่ถูกต้อง");
        }
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        {title}
                    </CardTitle>
                    <CardDescription className="text-stone-600 font-bold text-sm">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                className={`text-center text-2xl font-black tracking-widest h-12 ${error ? "border-red-500 focus-visible:ring-red-500" : "border-stone-200 focus-visible:ring-orange-500"}`}
                                placeholder="• • • •"
                                value={passcode}
                                onChange={(e) => {
                                    setPasscode(e.target.value);
                                    if (error) setError("");
                                }}
                                autoFocus
                                maxLength={10}
                            />
                            {error && <p className="text-red-600 text-xs font-bold text-center animate-pulse">{error}</p>}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" className="flex-1 font-bold" onClick={onClose}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-600/20">
                                ยืนยัน
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
