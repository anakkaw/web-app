"use client";

import Link from "next/link";
import { useProjects } from "@/contexts/ProjectContext";
import { useState } from "react";
import { AgencyModal } from "@/components/feature/AgencyModal";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const { currentAgency, session } = useProjects();
    const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-white/20 bg-white/60 backdrop-blur-xl shadow-sm transition-all duration-300">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group">
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <Link href="/" className="flex flex-col">
                                <span className="text-xl font-black tracking-tighter text-stone-900 leading-none group-hover:text-orange-600 transition-colors">
                                    Project
                                </span>
                                <span className="text-sm font-bold tracking-widest text-orange-600 uppercase">Management</span>
                            </Link>
                        </div>

                        {/* Agency Switcher Trigger */}
                        <div className="hidden md:flex items-center pl-6 border-l border-stone-200/50">
                            <Button
                                variant="ghost"
                                onClick={() => setIsAgencyModalOpen(true)}
                                className="glass-button flex items-center gap-3 px-5 h-11 rounded-full text-stone-700 hover:text-orange-700 font-bold"
                            >
                                <div className="p-1 bg-orange-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21" /></svg>
                                </div>
                                <span className="text-lg">{currentAgency?.name || "เลือกหน่วยงาน"}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="m6 9 6 6 6-6" /></svg>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1 mr-4 bg-stone-100/50 p-1 rounded-full border border-stone-200/50 backdrop-blur-sm">
                            <Link
                                href="/"
                                className="px-5 py-2 rounded-full text-sm font-bold text-stone-600 transition-all hover:bg-white hover:text-orange-600 hover:shadow-sm"
                            >
                                แดชบอร์ด
                            </Link>

                            <Link
                                href="/reports"
                                className="px-5 py-2 rounded-full text-sm font-bold text-stone-600 transition-all hover:bg-white hover:text-orange-600 hover:shadow-sm"
                            >
                                รายงาน
                            </Link>
                        </div>

                        {/* Mobile Agency Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAgencyModalOpen(true)}
                            className="md:hidden h-10 w-10 text-orange-600 bg-orange-50 rounded-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" /><circle cx="12" cy="12" r="3" /></svg>
                        </Button>

                        {/* Cloud/Auth Controls */}
                        {session ? (
                            <div className="flex items-center gap-3 pl-2">
                                {/* Sync button removed as per user request */}

                                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-stone-200">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">User</span>
                                        <span className="text-xs font-bold text-stone-800 max-w-[100px] truncate">{session.user.email}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={async () => {
                                            const { supabase } = await import("@/lib/supabase");
                                            await supabase.auth.signOut();
                                            window.location.reload();
                                        }}
                                        className="h-10 w-10 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                        title="ออกจากระบบ"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/auth">
                                <Button
                                    className="flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-6 h-11 rounded-xl shadow-lg shadow-stone-900/20 transition-all active:scale-95"
                                >
                                    <span className="font-bold text-sm">เข้าสู่ระบบ</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <AgencyModal
                isOpen={isAgencyModalOpen}
                onClose={() => setIsAgencyModalOpen(false)}
            />
        </>
    );
}
