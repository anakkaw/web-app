"use client";

import Link from "next/link";
import { useProjects } from "@/contexts/ProjectContext";
import { useState } from "react";
import { AgencyModal } from "@/components/feature/AgencyModal";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export function Navbar() {
    const { currentAgency, session, userRole, logout } = useProjects();
    const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-white/20 bg-white/60 backdrop-blur-xl shadow-sm transition-all duration-300">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href="/">
                            <Logo />
                        </Link>

                        {/* Agency Switcher Trigger - Only for Admin */}
                        {userRole !== 'reader' && (
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
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1 mr-4 bg-stone-100/50 p-1 rounded-full border border-stone-200/50 backdrop-blur-sm">
                            <Link
                                href="/"
                                className="px-5 py-2 rounded-full text-sm font-bold text-stone-600 transition-all hover:bg-white hover:text-orange-600 hover:shadow-sm"
                            >
                                แดชบอร์ด
                            </Link>
                        </div>

                        {/* Mobile Agency Button */}
                        {userRole !== 'reader' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsAgencyModalOpen(true)}
                                className="md:hidden h-10 w-10 text-orange-600 bg-orange-50 rounded-xl"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21" /></svg>
                            </Button>
                        )}

                        {/* Cloud/Auth Controls */}
                        {session || userRole !== 'guest' ? (
                            <div className="flex items-center gap-3 pl-2">
                                {/* Sync button removed as per user request */}

                                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-stone-200">
                                    <div className="flex flex-col items-end mr-2">
                                        {userRole === 'reader' ? (
                                            <div className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider border border-orange-200">
                                                Reader Mode
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                                                Admin
                                            </span>
                                        )}
                                        <span className="text-xs font-bold text-stone-800 max-w-[100px] truncate">
                                            {session?.user?.email || (userRole === 'admin' ? 'Demo Admin' : 'Guest Access')}
                                        </span>
                                    </div>

                                    {userRole === 'admin' && (
                                        <Link href="/settings">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all"
                                                title="ตั้งค่า"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </Button>
                                        </Link>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={logout}
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
